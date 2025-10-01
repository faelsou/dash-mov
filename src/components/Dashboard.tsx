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
import { ExecutiveFilters } from './ExecutiveFilters';
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
  filterDataByDateRange,
  filterDataByMonth
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
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState('all');

  const isExecutive = user?.role === 'executivo';

  const monthOptions = useMemo(() => {
    const months = new Set<string>();

    data.forEach(item => {
      const rawDate = item["Data Início"];
      if (!rawDate) {
        return;
      }

      const parts = rawDate.split('/');
      if (parts.length !== 3) {
        return;
      }

      const [, month, year] = parts;
      if (!month || !year) {
        return;
      }

      const normalizedMonth = `${year}-${month.padStart(2, '0')}`;
      months.add(normalizedMonth);
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const vendorOptions = useMemo(() => {
    const options = new Set<string>();
    data.forEach(item => {
      const vendor = item["Vendedor Responsável"]?.trim();
      if (vendor) {
        options.add(vendor);
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const cityOptions = useMemo(() => {
    const options = new Set<string>();
    data.forEach(item => {
      const city = item.Cidade?.trim();
      if (city) {
        options.add(city);
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const statusOptions = useMemo(() => {
    const options = new Set<string>();
    data.forEach(item => {
      const status = item.Status?.trim();
      if (status) {
        options.add(status);
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const paymentOptions = useMemo(() => {
    const options = new Set<string>();
    data.forEach(item => {
      const payment = item["Forma de Pagamento"]?.trim();
      if (payment) {
        options.add(payment);
      }
    });
    return Array.from(options).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [data]);

  const filteredData = useMemo(() => {
    let result = filterDataByDateRange(data, startDate, endDate);
    result = filterDataByMonth(result, selectedMonth);

    if (selectedVendor !== 'all') {
      result = result.filter(item => item["Vendedor Responsável"] === selectedVendor);
    }

    if (selectedCity !== 'all') {
      result = result.filter(item => item.Cidade === selectedCity);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(item => item.Status === selectedStatus);
    }

    if (selectedPayment !== 'all') {
      result = result.filter(item => item["Forma de Pagamento"] === selectedPayment);
    }

    return result;
  }, [data, startDate, endDate, selectedMonth, selectedVendor, selectedCity, selectedStatus, selectedPayment]);

  const kpis = useMemo(() => calculateKPIs(filteredData), [filteredData]);
  
  const vendorData = useMemo(() => getSalesByVendor(filteredData), [filteredData]);
  const cityData = useMemo(() => getSalesByCity(filteredData), [filteredData]);
  const paymentData = useMemo(() => getSalesByPaymentMethod(filteredData), [filteredData]);
  const statusData = useMemo(() => getSalesByStatus(filteredData), [filteredData]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedMonth('all');
    setSelectedVendor('all');
    setSelectedCity('all');
    setSelectedStatus('all');
    setSelectedPayment('all');
  };

  const handleExport = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (filteredData.length === 0) {
      alert('Nenhum dado disponível para exportação com os filtros selecionados.');
      return;
    }

    const headers = [
      'ID Projeto',
      'Cliente',
      'Cidade',
      'Código Projeto',
      'Data Início',
      'Data Prevista Entrega',
      'Valor Final (R$)',
      'Forma de Pagamento',
      'Vendedor Responsável',
      'Status',
      'Margem Lucro (%)',
      'Lucro (R$)'
    ];

    const escapeField = (value: unknown) => {
      if (value === null || value === undefined) {
        return '';
      }

      const stringValue = String(value).replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
      return stringValue;
    };

    const rows = filteredData
      .map(item => [
        item["ID Projeto"],
        item.Cliente,
        item.Cidade,
        item["Código Projeto"],
        item["Data Início"],
        item["Data Prevista Entrega"],
        item["Valor Final (R$)"],
        item["Forma de Pagamento"],
        item["Vendedor Responsável"],
        item.Status,
        item["Margem Lucro (%)"],
        item["Lucro (R$)"]
      ])
      .map(row => row.map(escapeField).join('\t'))
      .join('\n');

    const content = `${headers.join('\t')}\n${rows}`;

    const fileLabel = (() => {
      if (selectedMonth === 'all') {
        return 'completo';
      }

      const [year, month] = selectedMonth.split('-').map(Number);
      if (!year || !month) {
        return selectedMonth;
      }

      const formatted = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });

      return formatted
        .normalize('NFD')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .toLowerCase();
    })();

    const blob = new Blob([content], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-vendas-${fileLabel}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-xl font-semibold text-gray-700 dark:text-gray-200">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">Erro de Conexão</div>
          <div className="text-gray-600 dark:text-gray-300 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-left">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Configuração Necessária:</h4>
            <ol className="text-sm text-yellow-700 dark:text-yellow-200 space-y-1">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard de Vendas</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Fábrica de Móveis Planejados</p>
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
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
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
            monthOptions={monthOptions}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />

          {isExecutive && (
            <ExecutiveFilters
              vendors={vendorOptions}
              cities={cityOptions}
              statuses={statusOptions}
              payments={paymentOptions}
              selectedVendor={selectedVendor}
              selectedCity={selectedCity}
              selectedStatus={selectedStatus}
              selectedPayment={selectedPayment}
              onVendorChange={setSelectedVendor}
              onCityChange={setSelectedCity}
              onStatusChange={setSelectedStatus}
              onPaymentChange={setSelectedPayment}
              onExport={handleExport}
              isExportDisabled={filteredData.length === 0}
            />
          )}

          {/* Status da Conexão */}
          {data.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-green-800 dark:text-green-300 font-medium">
                  ✅ Conectado à planilha Google Sheets (Pública)
                </span>
                <span className="text-green-600 dark:text-green-200 text-sm">
                  • {data.length} registros carregados
                  {filteredData.length !== data.length && (
                    <span> • {filteredData.length} filtrados</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            <KPICard
              title="Vendas Total"
              value={formatCurrency(kpis.totalSales)}
              trend={{ value: 12.5, isPositive: true }}
              icon={<DollarSign className="w-6 h-6" />}
              variant="compact"
              className="h-full"
            />
            <KPICard
              title="Projetos"
              value={kpis.totalProjects.toString()}
              trend={{ value: 8.2, isPositive: true }}
              icon={<ShoppingBag className="w-6 h-6" />}
              variant="compact"
              className="h-full"
            />
            <KPICard
              title="Lucro Total"
              value={formatCurrency(kpis.totalProfit)}
              trend={{ value: 15.3, isPositive: true }}
              icon={<Target className="w-6 h-6" />}
              variant="compact"
              className="h-full"
            />
            <KPICard
              title="Margem Média"
              value={formatPercentage(kpis.averageMargin)}
              trend={{ value: 2.1, isPositive: true }}
              icon={<TrendingUp className="w-6 h-6" />}
              variant="compact"
              className="h-full"
            />
            <KPICard
              title="Ticket Médio"
              value={formatCurrency(kpis.averageTicket)}
              trend={{ value: 5.7, isPositive: true }}
              icon={<Users className="w-6 h-6" />}
              variant="compact"
              className="h-full"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <BarChart
              data={vendorData}
              title="Vendas por Vendedor"
              color="bg-blue-500"
              className="h-full"
            />
            <BarChart
              data={cityData}
              title="Vendas por Cidade"
              color="bg-green-500"
              className="h-full"
            />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <PieChart
              data={paymentData}
              title="Formas de Pagamento"
              className="h-full"
            />
            <PieChart
              data={statusData}
              title="Status dos Projetos"
              colors={['#10B981', '#3B82F6', '#F59E0B', '#EF4444']}
              className="h-full"
            />
          </div>

          {/* Recent Projects Table */}
          <StatusTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};