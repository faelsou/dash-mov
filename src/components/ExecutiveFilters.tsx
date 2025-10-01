import React from 'react';
import { Filter, Download } from 'lucide-react';

interface ExecutiveFiltersProps {
  vendors: string[];
  cities: string[];
  statuses: string[];
  payments: string[];
  selectedVendor: string;
  selectedCity: string;
  selectedStatus: string;
  selectedPayment: string;
  onVendorChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onExport: () => void;
  isExportDisabled?: boolean;
}

export const ExecutiveFilters: React.FC<ExecutiveFiltersProps> = ({
  vendors,
  cities,
  statuses,
  payments,
  selectedVendor,
  selectedCity,
  selectedStatus,
  selectedPayment,
  onVendorChange,
  onCityChange,
  onStatusChange,
  onPaymentChange,
  onExport,
  isExportDisabled = false
}) => {
  const renderOptions = (options: string[]) => (
    <>
      <option value="all">Todos</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros Avançados (Executivo)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vendedor
          </label>
          <select
            value={selectedVendor}
            onChange={(event) => onVendorChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {renderOptions(vendors)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cidade
          </label>
          <select
            value={selectedCity}
            onChange={(event) => onCityChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {renderOptions(cities)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(event) => onStatusChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {renderOptions(statuses)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Forma de pagamento
          </label>
          <select
            value={selectedPayment}
            onChange={(event) => onPaymentChange(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {renderOptions(payments)}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onExport}
          disabled={isExportDisabled}
          className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isExportDisabled
              ? 'bg-purple-300 text-white cursor-not-allowed opacity-80'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Exportar Excel</span>
        </button>
      </div>
    </div>
  );
};
