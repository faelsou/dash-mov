import React, { useState, useMemo, useEffect } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  Plus,
  Calendar,
  DollarSign, 
  User, 
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Save
} from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';
import { KanbanCard, ProductionStatus } from '../types';
import { formatCurrency } from '../utils/calculations';
import { KanbanService } from '../services/kanban';
import { StrictModeDroppable } from './StrictModeDroppable';
const STORAGE_KEY = 'production-kanban-state';

const createEmptyColumns = (): Record<ProductionStatus, KanbanCard[]> => ({
  orcamento: [],
  aprovado: [],
  projeto: [],
  corte: [],
  usinagem: [],
  montagem: [],
  acabamento: [],
  embalagem: [],
  entrega: [],
  finalizado: []
});

export const KanbanBoard: React.FC = () => {
  const { data, loading } = useSheetData();
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    projectCode: '',
    client: '',
    value: '',
    startDate: '',
    deliveryDate: '',
    responsible: '',
    priority: 'media' as 'alta' | 'media' | 'baixa'
  });
  const [kanbanColumns, setKanbanColumns] = useState<Record<ProductionStatus, KanbanCard[]>>(createEmptyColumns);
  const [initialized, setInitialized] = useState(false);
  const [updatingCardId, setUpdatingCardId] = useState<string | null>(null);
  const [updateFeedback, setUpdateFeedback] = useState<{ cardId: string; status: 'success' | 'error' } | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const kanbanService = useMemo(() => new KanbanService(), []);

  const statusConfig: Record<ProductionStatus, { title: string; color: string; bgColor: string }> = {
    orcamento: { title: 'Orçamento', color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' },
    aprovado: { title: 'Aprovado', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' },
    projeto: { title: 'Projeto', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' },
    corte: { title: 'Corte', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' },
    usinagem: { title: 'Usinagem', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' },
    montagem: { title: 'Montagem', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' },
    acabamento: { title: 'Acabamento', color: 'text-pink-700 dark:text-pink-300', bgColor: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700' },
    embalagem: { title: 'Embalagem', color: 'text-teal-700 dark:text-teal-300', bgColor: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700' },
    entrega: { title: 'Entrega', color: 'text-cyan-700 dark:text-cyan-300', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700' },
    finalizado: { title: 'Finalizado', color: 'text-gray-700 dark:text-gray-300', bgColor: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600' }
  };

  const cloneColumns = (columns: Record<ProductionStatus, KanbanCard[]>) =>
    (Object.keys(columns) as ProductionStatus[]).reduce((acc, status) => {
      acc[status] = columns[status].map(card => ({ ...card }));
      return acc;
    }, {} as Record<ProductionStatus, KanbanCard[]>);

  const mapStatusToProduction = (status: string): ProductionStatus => {
    const statusMap: Record<string, ProductionStatus> = {
      'Orçamento': 'orcamento',
      'Aprovado': 'aprovado',
      'Em Projeto': 'projeto',
      'Corte': 'corte',
      'Usinagem': 'usinagem',
      'Montagem': 'montagem',
      'Acabamento': 'acabamento',
      'Embalagem': 'embalagem',
      'Entrega': 'entrega',
      'Finalizado': 'finalizado'
    };
    return statusMap[status] || 'orcamento';
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!data.length) {
      return;
    }

    const baseColumns = createEmptyColumns();
    const cardsMap = new Map<string, KanbanCard>();

    data.forEach((item, index) => {
      const productionStatus = mapStatusToProduction(item.Status);
      const card: KanbanCard = {
        id: item["ID Projeto"]?.toString() || index.toString(),
        projectCode: item["Código Projeto"] || `Projeto-${index + 1}`,
        client: item.Cliente || 'Cliente não informado',
        value: item["Valor Final (R$)"] || 0,
        startDate: item["Data Início"] || '',
        deliveryDate: item["Data Prevista Entrega"] || '',
        priority: item["Valor Final (R$)"] > 50000 ? 'alta' : item["Valor Final (R$)"] > 25000 ? 'media' : 'baixa',
        responsible: item["Vendedor Responsável"] || 'Não atribuído',
        status: productionStatus
      };

      baseColumns[productionStatus].push(card);
      cardsMap.set(card.id, card);
    });

    const savedState = localStorage.getItem(STORAGE_KEY);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as Partial<Record<ProductionStatus, string[]>>;
        const restoredColumns = createEmptyColumns();
        const assignedCards = new Set<string>();

        (Object.keys(parsed) as ProductionStatus[]).forEach(status => {
          (parsed[status] || []).forEach(cardId => {
            const card = cardsMap.get(cardId);
            if (card) {
              restoredColumns[status].push({ ...card, status });
              assignedCards.add(cardId);
            }
          });
        });

        (Object.keys(baseColumns) as ProductionStatus[]).forEach(status => {
          baseColumns[status].forEach(card => {
            if (!assignedCards.has(card.id)) {
              restoredColumns[status].push({ ...card, status });
              assignedCards.add(card.id);
            }
          });
        });

        setKanbanColumns(restoredColumns);
        setSelectedCard(null);
        setInitialized(true);
        return;
      } catch (error) {
        console.error('Erro ao restaurar o kanban de produção:', error);
      }
    }

    setKanbanColumns(baseColumns);
    setSelectedCard(null);
    setInitialized(true);
  }, [data]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const serialized = JSON.stringify(
      Object.entries(kanbanColumns).reduce((acc, [status, cards]) => {
        acc[status as ProductionStatus] = cards.map(card => card.id);
        return acc;
      }, {} as Record<ProductionStatus, string[]>)
    );

    localStorage.setItem(STORAGE_KEY, serialized);
  }, [kanbanColumns, initialized]);

  const kanbanData = useMemo(() => {
    return Object.entries(kanbanColumns).map(([status, cards]) => ({
      id: status,
      title: statusConfig[status as ProductionStatus].title,
      color: statusConfig[status as ProductionStatus].color,
      bgColor: statusConfig[status as ProductionStatus].bgColor,
      cards: cards.slice().sort((a, b) => {
        const priorityOrder = { alta: 3, media: 2, baixa: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
    }));
  }, [kanbanColumns]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId as ProductionStatus;
    const destColumn = destination.droppableId as ProductionStatus;

    const previousColumns = cloneColumns(kanbanColumns);
    const nextColumns = cloneColumns(kanbanColumns);

    const sourceCards = nextColumns[sourceColumn];
    const destCards = sourceColumn === destColumn ? sourceCards : nextColumns[destColumn];

    const [movedCard] = sourceCards.splice(source.index, 1);

    if (!movedCard) {
      return;
    }

    const updatedCard: KanbanCard = { ...movedCard, status: destColumn };
    destCards.splice(destination.index, 0, updatedCard);

    nextColumns[sourceColumn] = sourceCards;
    nextColumns[destColumn] = destCards;

    if (sourceColumn !== destColumn) {
      nextColumns[destColumn] = nextColumns[destColumn].map(card =>
        card.id === updatedCard.id ? updatedCard : { ...card, status: destColumn }
      );
    }

    setKanbanColumns(nextColumns);
    setUpdateError(null);

    const previousSelectedCard = selectedCard;
    if (previousSelectedCard?.id === draggableId) {
      setSelectedCard({ ...updatedCard });
    }

    setUpdatingCardId(draggableId);
    setUpdateFeedback(null);

    const columnsToPersist =
      sourceColumn === destColumn
        ? [{ status: destColumn, cards: nextColumns[destColumn] }]
        : [
            { status: sourceColumn, cards: nextColumns[sourceColumn] },
            { status: destColumn, cards: nextColumns[destColumn] }
          ];

    try {
      await kanbanService.persistColumns(columnsToPersist);
      setUpdateFeedback({ cardId: draggableId, status: 'success' });
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          setUpdateFeedback(prev => (prev?.cardId === draggableId ? null : prev));
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao atualizar status do projeto:', error);
      setKanbanColumns(previousColumns);
      if (previousSelectedCard?.id === draggableId) {
        setSelectedCard(previousSelectedCard);
      }
      setUpdateError('Não foi possível atualizar o status. As alterações foram revertidas.');
      setUpdateFeedback({ cardId: draggableId, status: 'error' });
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          setUpdateFeedback(prev => (prev?.cardId === draggableId ? null : prev));
        }, 2500);
      }
    } finally {
      setUpdatingCardId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'media': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'baixa': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return <AlertCircle className="w-4 h-4" />;
      case 'media': return <Clock className="w-4 h-4" />;
      case 'baixa': return <CheckCircle2 className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando dados de produção...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Controle de Produção</h1>
            <p className="text-gray-600 dark:text-gray-300">Acompanhe o status de fabricação dos móveis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total de projetos: <span className="font-semibold text-gray-900 dark:text-white">{data.length}</span>
            </div>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
          </div>
        </div>
      </div>

      {updateError && (
        <div className="px-6 mt-4">
          <div className="flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-200">
            <AlertCircle className="w-4 h-4" />
            <span>{updateError}</span>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 min-w-max">
          {kanbanData.map((column) => (
            <StrictModeDroppable droppableId={column.id} key={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="w-80 flex-shrink-0"
                >
              {/* Column Header */}
              <div className={`rounded-lg border-2 ${column.bgColor} p-4 mb-4`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${column.color}`}>{column.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.color} bg-white dark:bg-gray-800`}>
                    {column.cards.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div
                className={`space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto rounded-xl border border-transparent transition-all p-1 ${
                  snapshot.isDraggingOver ? 'border-blue-400/60 bg-blue-500/5 dark:bg-blue-500/10 shadow-inner' : ''
                }`}
              >
                {column.cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setSelectedCard(card)}
                        className={`relative cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-transform transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                          snapshot.isDragging ? 'ring-2 ring-blue-500 shadow-lg' : ''
                        }`}
                      >
                        {updateFeedback?.cardId === card.id && updateFeedback.status === 'success' && (
                          <div className="absolute right-2 top-2 text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        )}
                        {updateFeedback?.cardId === card.id && updateFeedback.status === 'error' && (
                          <div className="absolute right-2 top-2 text-red-500">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        {updatingCardId === card.id && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 dark:bg-gray-900/70">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                          </div>
                        )}
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{card.projectCode}</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{card.client}</p>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(card.priority)}`}>
                        {getPriorityIcon(card.priority)}
                        <span className="capitalize">{card.priority}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(card.value)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Entrega: {card.deliveryDate}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="w-4 h-4" />
                        <span>{card.responsible}</span>
                      </div>
                    </div>
                  </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                {column.cards.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm">Nenhum projeto neste status</p>
                  </div>
                )}
              </div>
              </div>
              )}
            </StrictModeDroppable>
          ))}
          </div>
        </DragDropContext>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedCard.projectCode}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedCard.client}</p>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedCard.value)}</p>
                      </div>
                      <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedCard.priority)}`}>
                          {getPriorityIcon(selectedCard.priority)}
                          <span className="capitalize">{selectedCard.priority}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status atual</label>
                        <p className="text-gray-900 dark:text-white">
                          {statusConfig[selectedCard.status].title}
                        </p>
                      </div>
                    </div>

                    <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                <p className="text-gray-900 dark:text-white">{selectedCard.startDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previsão de Entrega</label>
                <p className="text-gray-900 dark:text-white">{selectedCard.deliveryDate}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsável</label>
                <p className="text-gray-900 dark:text-white">{selectedCard.responsible}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Novo Projeto</h3>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código do Projeto</label>
                <input
                  type="text"
                  value={newProject.projectCode}
                  onChange={(e) => setNewProject({...newProject, projectCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="PRJ-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                <input
                  type="text"
                  value={newProject.client}
                  onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    value={newProject.value}
                    onChange={(e) => setNewProject({...newProject, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value as 'alta' | 'media' | 'baixa'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Início</label>
                <input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Previsão de Entrega</label>
                <input
                  type="date"
                  value={newProject.deliveryDate}
                  onChange={(e) => setNewProject({...newProject, deliveryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsável</label>
                <input
                  type="text"
                  value={newProject.responsible}
                  onChange={(e) => setNewProject({...newProject, responsible: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newProject.projectCode && newProject.client) {
                    const project: KanbanCard = {
                      id: Date.now().toString(),
                      projectCode: newProject.projectCode,
                      client: newProject.client,
                      value: parseFloat(newProject.value) || 0,
                      startDate: newProject.startDate,
                      deliveryDate: newProject.deliveryDate,
                      priority: newProject.priority,
                      responsible: newProject.responsible,
                      status: 'orcamento'
                    };

                    setKanbanColumns(prev => ({
                      ...prev,
                      orcamento: [...prev.orcamento, project]
                    }));
                    
                    setNewProject({
                      projectCode: '',
                      client: '',
                      value: '',
                      startDate: '',
                      deliveryDate: '',
                      responsible: '',
                      priority: 'media'
                    });
                    
                    setShowNewProjectModal(false);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Criar Projeto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};