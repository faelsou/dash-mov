import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Plus, 
  Phone, 
  Mail, 
  DollarSign, 
  User, 
  Calendar,
  MessageSquare,
  Star,
  TrendingUp,
  X,
  Save,
  Users
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { formatCurrency } from '../utils/calculations';
import { StrictModeDroppable } from './StrictModeDroppable';
const LEADS_STORAGE_KEY = 'leads-kanban-state';

const createInitialLeadsState = (): Record<LeadStatus, Lead[]> => ({
  novo: [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@email.com',
      phone: '(11) 99999-9999',
      source: 'Website',
      estimatedValue: 45000,
      status: 'novo',
      createdAt: '2024-01-15',
      lastContact: '2024-01-15',
      assignedTo: 'Maria Vendedora',
      notes: 'Interessada em cozinha planejada'
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      phone: '(11) 88888-8888',
      source: 'Indicação',
      estimatedValue: 32000,
      status: 'novo',
      createdAt: '2024-01-16',
      lastContact: '2024-01-16',
      assignedTo: 'João Vendedor'
    }
  ],
  contato: [
    {
      id: '3',
      name: 'Mariana Costa',
      email: 'mariana@email.com',
      phone: '(11) 77777-7777',
      source: 'Facebook',
      estimatedValue: 28000,
      status: 'contato',
      createdAt: '2024-01-14',
      lastContact: '2024-01-17',
      assignedTo: 'Maria Vendedora'
    }
  ],
  qualificado: [
    {
      id: '4',
      name: 'Roberto Lima',
      email: 'roberto@email.com',
      phone: '(11) 66666-6666',
      source: 'Google Ads',
      estimatedValue: 55000,
      status: 'qualificado',
      createdAt: '2024-01-12',
      lastContact: '2024-01-18',
      assignedTo: 'João Vendedor'
    }
  ],
  proposta: [],
  negociacao: [],
  fechado: [],
  perdido: []
});

export const LeadsBoard: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'Website',
    estimatedValue: '',
    assignedTo: '',
    notes: ''
  });
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: ''
  });
  const [vendors, setVendors] = useState([
    'Maria Vendedora',
    'João Vendedor',
    'Ana Consultora',
    'Carlos Especialista'
  ]);

  const [leadsData, setLeadsData] = useState<Record<LeadStatus, Lead[]>>(createInitialLeadsState);
  const [initialized, setInitialized] = useState(false);

  const statusConfig: Record<LeadStatus, { title: string; color: string; bgColor: string }> = {
    novo: { title: 'Novos Leads', color: 'text-blue-700 dark:text-blue-300', bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' },
    contato: { title: 'Primeiro Contato', color: 'text-yellow-700 dark:text-yellow-300', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' },
    qualificado: { title: 'Qualificados', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700' },
    proposta: { title: 'Proposta Enviada', color: 'text-orange-700 dark:text-orange-300', bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' },
    negociacao: { title: 'Em Negociação', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' },
    fechado: { title: 'Fechados', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' },
    perdido: { title: 'Perdidos', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId as LeadStatus;
    const destColumn = destination.droppableId as LeadStatus;

    setLeadsData(prev => {
      const newData = { ...prev };
      const sourceLeads = [...newData[sourceColumn]];
      const destLeads = sourceColumn === destColumn ? sourceLeads : [...newData[destColumn]];

      const [movedLead] = sourceLeads.splice(source.index, 1);
      const updatedLead: Lead = { ...movedLead, status: destColumn };
      destLeads.splice(destination.index, 0, updatedLead);

      newData[sourceColumn] = sourceLeads;
      newData[destColumn] = destLeads;

      return newData;
    });

    if (selectedLead?.id === draggableId) {
      setSelectedLead(prev => (prev ? { ...prev, status: destColumn } : prev));
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Website': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Facebook': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'Google Ads': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'Indicação': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedState = localStorage.getItem(LEADS_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as Partial<Record<LeadStatus, Lead[]>>;
        const mergedState = createInitialLeadsState();

        (Object.keys(mergedState) as LeadStatus[]).forEach(status => {
          mergedState[status] = parsed[status] ?? mergedState[status];
        });

        setLeadsData(mergedState);
        setSelectedLead(null);
      } catch (error) {
        console.error('Erro ao restaurar pipeline de leads:', error);
      }
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leadsData));
  }, [leadsData, initialized]);

  const totalLeads = Object.values(leadsData).flat().length;
  const totalValue = Object.values(leadsData).flat().reduce((sum, lead) => sum + lead.estimatedValue, 0);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline de Leads</h1>
            <p className="text-gray-600 dark:text-gray-300">Gerencie seus leads e oportunidades de venda</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Total de leads: <span className="font-semibold text-gray-900 dark:text-white">{totalLeads}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Valor potencial: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</span>
            </div>
            <button
              onClick={() => setShowNewLeadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lead</span>
            </button>
            <button
              onClick={() => setShowNewVendorModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Novo Vendedor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 min-w-max">
            {Object.entries(statusConfig).map(([status, config]) => (
              <StrictModeDroppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-80 flex-shrink-0"
                  >
                    {/* Column Header */}
                    <div className={`rounded-lg border-2 ${config.bgColor} p-4 mb-4`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${config.color}`}>{config.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} bg-white dark:bg-gray-800`}>
                          {leadsData[status as LeadStatus].length}
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div
                      className={`space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto rounded-xl border border-transparent transition-all p-1 ${
                        snapshot.isDraggingOver ? 'border-blue-400/60 bg-blue-500/5 dark:bg-blue-500/10 shadow-inner' : ''
                      }`}
                    >
                      {leadsData[status as LeadStatus].map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedLead(lead)}
                              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow cursor-pointer ${
                                snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                              }`}
                            >
                              {/* Card Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{lead.name}</h4>
                                  <p className="text-gray-600 dark:text-gray-300 text-xs">{lead.assignedTo}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(lead.source)}`}>
                                  {lead.source}
                                </div>
                              </div>

                              {/* Card Content */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(lead.estimatedValue)}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                  <Phone className="w-4 h-4" />
                                  <span>{lead.phone}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                  <Calendar className="w-4 h-4" />
                                  <span>Último contato: {new Date(lead.lastContact).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {leadsData[status as LeadStatus].length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Plus className="w-6 h-6" />
                          </div>
                          <p className="text-sm">Nenhum lead neste status</p>
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

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedLead.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedLead.assignedTo}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Estimado</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedLead.estimatedValue)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origem</label>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(selectedLead.source)}`}>
                    {selectedLead.source}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status atual</label>
                <p className="text-gray-900 dark:text-white">{statusConfig[selectedLead.status].title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <p className="text-gray-900 dark:text-white">{selectedLead.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                <p className="text-gray-900 dark:text-white">{selectedLead.phone}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data de Criação</label>
                <p className="text-gray-900 dark:text-white">{new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>

              {selectedLead.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                  <p className="text-gray-900 dark:text-white">{selectedLead.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Novo Lead</h3>
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome do cliente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Origem</label>
                  <select
                    value={newLead.source}
                    onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Instagram">Instagram</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={(e) => setNewLead({...newLead, estimatedValue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="25000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendedor Responsável</label>
                <select
                  value={newLead.assignedTo}
                  onChange={(e) => setNewLead({...newLead, assignedTo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione um vendedor</option>
                  {vendors.map((vendor, index) => (
                    <option key={index} value={vendor}>{vendor}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Observações sobre o lead..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewLeadModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newLead.name && newLead.email && newLead.assignedTo) {
                    const lead: Lead = {
                      id: Date.now().toString(),
                      name: newLead.name,
                      email: newLead.email,
                      phone: newLead.phone,
                      source: newLead.source,
                      estimatedValue: parseFloat(newLead.estimatedValue) || 0,
                      status: 'novo',
                      createdAt: new Date().toISOString().split('T')[0],
                      lastContact: new Date().toISOString().split('T')[0],
                      assignedTo: newLead.assignedTo,
                      notes: newLead.notes
                    };
                    
                    setLeadsData(prev => ({
                      ...prev,
                      novo: [...prev.novo, lead]
                    }));
                    
                    setNewLead({
                      name: '',
                      email: '',
                      phone: '',
                      source: 'Website',
                      estimatedValue: '',
                      assignedTo: '',
                      notes: ''
                    });
                    
                    setShowNewLeadModal(false);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Criar Lead</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Vendor Modal */}
      {showNewVendorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Novo Vendedor</h3>
              <button
                onClick={() => setShowNewVendorModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Nome do vendedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especialidade</label>
                <select
                  value={newVendor.specialty}
                  onChange={(e) => setNewVendor({...newVendor, specialty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione uma especialidade</option>
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                  <option value="Ambos B2B e B2C">Ambos B2B e B2C</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewVendorModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (newVendor.name && newVendor.email) {
                    setVendors(prev => [...prev, newVendor.name]);
                    
                    setNewVendor({
                      name: '',
                      email: '',
                      phone: '',
                      specialty: ''
                    });
                    
                    setShowNewVendorModal(false);
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Criar Vendedor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};