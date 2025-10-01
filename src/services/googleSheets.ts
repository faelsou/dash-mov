interface GoogleSheetsResponse {
  values: string[][];
}

export class GoogleSheetsService {
  private apiKey: string;
  private spreadsheetId: string;
  private range: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID || '';
    this.range = import.meta.env.VITE_SHEET_RANGE || 'Sheet1!A:U';
  }

  async fetchSheetData(): Promise<string[][]> {
    try {
      // Para planilhas públicas, usar CSV export direto
      const csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv&gid=0`;
      
      console.log('Buscando dados da planilha:', csvUrl);
      
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error(`CSV fetch error: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('Dados CSV recebidos, primeiras linhas:', csvText.substring(0, 200));
      
      return this.parseCSV(csvText);
      
    } catch (error) {
      console.error('Error fetching Google Sheets data:', error);
      throw error;
    }
  }

  private parseCSV(csvText: string): string[][] {
    const lines = csvText.split('\n');
    const result: string[][] = [];
    
    for (const line of lines) {
      if (line.trim()) {
        // Parse CSV considerando aspas e vírgulas dentro de campos
        const row = this.parseCSVLine(line);
        result.push(row);
      }
    }
    
    return result;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  convertToSalesData(rawData: string[][]): any[] {
    if (rawData.length === 0) return [];
    
    const headers = rawData[0];
    const dataRows = rawData.slice(1);
    
    return dataRows.map(row => {
      const obj: any = {};
      
      headers.forEach((header, index) => {
        const value = row[index] || '';
        const cleanHeader = header.trim();
        
        // Converter valores numéricos
        if (cleanHeader.includes('R$') || cleanHeader.includes('%') || cleanHeader === 'ID Projeto' || cleanHeader === 'Parcelas') {
          const numericValue = this.parseNumericValue(value);
          obj[cleanHeader] = numericValue;
        } else {
          obj[cleanHeader] = value.trim();
        }
      });
      
      return obj;
    });
  }

  private parseNumericValue(value: string): number {
    if (!value || value.trim() === '') return 0;
    
    // Remove símbolos de moeda, pontos de milhares e substitui vírgula por ponto
    const cleanValue = value
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
}