import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Target,
  RefreshCw,
  Wifi,
  WifiOff,
  Kanban
} from 'lucide-react';

import { useSheetData } from '../hooks/useSheetData';
import { KPICard } from './KPICard';
import { DateFilter } from './DateFilter';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';
import { StatusTable } from './StatusTable';
import { 
  calculateKPIs, 
  formatCurrency, 
  formatPercentage,
  getSalesByVendor,
  getSalesByCity,
  getSalesByPaymentMethod,
  getSalesByStatus,
  filterDataByDateRange
} from '../utils/calculations';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { data, loading, error, lastUpdate, refreshData } = useSheetData();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredData = useMemo(() => {
    return filterDataByDateRange(data, startDate, endDate);
  }, [data, startDate, endDate]);

  const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);
  
  const vendorData = useMemo(() => getSalesByVendor(filteredData), [filteredData]);
  const cityData = useMemo(() => getSalesByCity(filteredData), [filteredData]);
  const paymentData = useMemo(() => getSalesByPaymentMethod(filteredData), [filteredData]);
  const statusData = useMemo(() => getSalesByStatus(filteredData), [filteredData]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xl font-semibold text-gray-700">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-xl font-semibold mb-2">Erro de Conexão</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h4 className="font-semibold text-yellow-800 mb-2">Configuração Necessária:</h4>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Obtenha uma chave da Google Sheets API</li>
              <li>2. Configure a variável VITE_GOOGLE_API_KEY no arquivo .env</li>
              <li>3. Certifique-se que a planilha está pública para leitura</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard de Vendas</h1>
                <p className="text-sm text-gray-600">Fábrica de Móveis Planejados</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=3B82F6&color=fff`}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Wifi className="w-4 h-4 text-green-500" />
                <span>
                  {lastUpdate 
                    ? `Última atualização: ${lastUpdate.toLocaleString('pt-BR')}`
                    : 'Conectando...'
                  }
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              {user?.role !== 'operacional' && onPageChange && (
                <button
                  onClick={() => onPageChange('kanban')}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Kanban className="w-4 h-4" />
                  <span>Produção</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Filtros de Data */}
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={handleResetFilters}
          />

          {/* Status da Conexão */}
          {data.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  ✅ Conectado à planilha Google Sheets (Pública)
                </span>
                <span className="text-green-600 text-sm">
                  • {data.length} registros carregados
                  {filteredData.length !== data.length && (
                    <span> • {filteredData.length} filtrados</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Vendas Total"
              value={formatCurrency(kpis.totalSales)}
              trend={{ value: 12.5, isPositive: true }}
              icon={<DollarSign className="w-6 h-6" />}
              variant="compact"
            />
            <KPICard
              title="Projetos"
              value={kpis.totalProjects.toString()}
              trend={{ value: 8.2, isPositive: true }}
              icon={<ShoppingBag className="w-6 h-6" />}
              variant="compact"
            />
            <KPICard
              title="Lucro Total"
              value={formatCurrency(kpis.totalProfit)}
              trend={{ value: 15.3, isPositive: true }}
              icon={<Target className="w-6 h-6" />}
              variant="compact"
            />
            <KPICard
              title="Margem Média"
              value={formatPercentage(kpis.averageMargin)}
              trend={{ value: 2.1, isPositive: true }}
              icon={<TrendingUp className="w-6 h-6" />}
              variant="compact"
            />
            <KPICard
              title="Ticket Médio"
              value={formatCurrency(kpis.averageTicket)}
              trend={{ value: 5.7, isPositive: true }}
              icon={<Users className="w-6 h-6" />}
              variant="compact"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BarChart
              data={vendorData}
              title="Vendas por Vendedor"
              color="bg-blue-500"
            />
            <BarChart
              data={cityData}
              title="Vendas por Cidade"
              color="bg-green-500"
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PieChart
              data={paymentData}
              title="Formas de Pagamento"
            />
            <PieChart
              data={statusData}
              title="Status dos Projetos"
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
            />
          </div>

          {/* Recent Projects Table */}
          <StatusTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};