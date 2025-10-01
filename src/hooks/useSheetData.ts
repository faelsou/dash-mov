import { useState, useEffect } from 'react';
import { SalesData } from '../types';
import { GoogleSheetsService } from '../services/googleSheets';

export const useSheetData = () => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const googleSheetsService = new GoogleSheetsService();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rawData = await googleSheetsService.fetchSheetData();
        const salesData = googleSheetsService.convertToSalesData(rawData);
        
        setData(salesData);
        setLastUpdate(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao conectar com a planilha Google Sheets. Verifique se a planilha está pública e acessível.');
        setLoading(false);
      }
    };

    loadData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const rawData = await googleSheetsService.fetchSheetData();
      const salesData = googleSheetsService.convertToSalesData(rawData);
      
      setData(salesData);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Erro ao atualizar dados:', err);
      setError('Erro ao atualizar dados da planilha');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, lastUpdate, refreshData };
};