import { SalesData, KPIData, ChartData } from '../types';

const parseSheetDate = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parts = value.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const [day, month, year] = parts.map(Number);

  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
};

export const calculateKPIs = (data: SalesData[]): KPIData => {
  const totalSales = data.reduce((sum, item) => sum + item["Valor Final (R$)"], 0);
  const totalProjects = data.length;
  const totalProfit = data.reduce((sum, item) => sum + item["Lucro (R$)"], 0);
  const averageMargin = data.length > 0 
    ? data.reduce((sum, item) => sum + item["Margem Lucro (%)"], 0) / data.length 
    : 0;
  const averageTicket = totalProjects > 0 ? totalSales / totalProjects : 0;

  return {
    totalSales,
    totalProjects,
    averageMargin,
    averageTicket,
    totalProfit
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getSalesByVendor = (data: SalesData[]): ChartData[] => {
  const vendorSales = data.reduce((acc, item) => {
    const vendor = item["Vendedor Responsável"];
    if (!acc[vendor]) {
      acc[vendor] = 0;
    }
    acc[vendor] += item["Valor Final (R$)"];
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(vendorSales).reduce((sum, value) => sum + value, 0);

  return Object.entries(vendorSales).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));
};

export const getSalesByCity = (data: SalesData[]): ChartData[] => {
  const citySales = data.reduce((acc, item) => {
    const city = item.Cidade;
    if (!acc[city]) {
      acc[city] = 0;
    }
    acc[city] += item["Valor Final (R$)"];
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(citySales).reduce((sum, value) => sum + value, 0);

  return Object.entries(citySales).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));
};

export const getSalesByPaymentMethod = (data: SalesData[]): ChartData[] => {
  const paymentSales = data.reduce((acc, item) => {
    const payment = item["Forma de Pagamento"];
    if (!acc[payment]) {
      acc[payment] = 0;
    }
    acc[payment] += item["Valor Final (R$)"];
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(paymentSales).reduce((sum, value) => sum + value, 0);

  return Object.entries(paymentSales).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));
};

export const getSalesByStatus = (data: SalesData[]): ChartData[] => {
  const statusCount = data.reduce((acc, item) => {
    const status = item.Status;
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += 1;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(statusCount).reduce((sum, value) => sum + value, 0);

  return Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));
};

export const filterDataByDateRange = (
  data: SalesData[],
  startDate: string,
  endDate: string
): SalesData[] => {
  if (!startDate && !endDate) {
    return data;
  }

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  return data.filter(item => {
    const itemDate = parseSheetDate(item["Data Início"]);
    if (!itemDate) {
      return false;
    }

    if (start && itemDate < start) {
      return false;
    }

    if (end && itemDate > end) {
      return false;
    }

    return true;
  });
};

export const filterDataByMonth = (data: SalesData[], month: string): SalesData[] => {
  if (month === 'all') {
    return data;
  }

  return data.filter(item => {
    const itemDate = parseSheetDate(item["Data Início"]);
    if (!itemDate) {
      return false;
    }

    const normalized = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
    return normalized === month;
  });
};
