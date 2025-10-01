export interface SalesData {
  "ID Projeto": number;
  "Cliente": string;
  "Cidade": string;
  "Código Projeto": string;
  "Data Início": string;
  "Data Prevista Entrega": string;
  "Valor Bruto (R$)": number;
  "Desconto (%)": number;
  "Valor Final (R$)": number;
  "Forma de Pagamento": string;
  "Parcelas": number;
  "Matéria-Prima (R$)": number;
  "Mão de Obra (R$)": number;
  "Impostos (R$)": number;
  "Logística (R$)": number;
  "Marketing (R$)": number;
  "Total Custos (R$)": number;
  "Lucro (R$)": number;
  "Margem Lucro (%)": number;
  "Status": string;
  "Vendedor Responsável": string;
}

export interface KPIData {
  totalSales: number;
  totalProjects: number;
  averageMargin: number;
  averageTicket: number;
  totalProfit: number;
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'executivo' | 'secretaria' | 'operacional';
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface KanbanCard {
  id: string;
  projectCode: string;
  client: string;
  value: number;
  startDate: string;
  deliveryDate: string;
  priority: 'alta' | 'media' | 'baixa';
  responsible: string;
  notes?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

export type ProductionStatus = 
  | 'orcamento'
  | 'aprovado'
  | 'projeto'
  | 'corte'
  | 'usinagem'
  | 'montagem'
  | 'acabamento'
  | 'embalagem'
  | 'entrega'
  | 'finalizado';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  estimatedValue: number;
  status: LeadStatus;
  createdAt: string;
  lastContact: string;
  notes?: string;
  assignedTo: string;
}

export type LeadStatus = 
  | 'novo'
  | 'contato'
  | 'qualificado'
  | 'proposta'
  | 'negociacao'
  | 'fechado'
  | 'perdido';

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}