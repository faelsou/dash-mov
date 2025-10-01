# Dashboard de Controle de Vendas - Fábrica de Móveis Planejados

Dashboard moderno e intuitivo para análise de vendas conectado diretamente com Google Sheets.

## 🚀 Funcionalidades

- **Conexão em Tempo Real**: Integração direta com Google Sheets
- **KPIs Principais**: Vendas totais, projetos, margem de lucro, ticket médio
- **Análises Visuais**: Gráficos de barras e pizza para diferentes métricas
- **Filtros de Data**: Análise temporal personalizada
- **Atualização Automática**: Dados atualizados a cada 5 minutos
- **Design Responsivo**: Otimizado para monitores de departamento

## 📊 Métricas Analisadas

- Vendas por vendedor
- Performance por cidade
- Formas de pagamento
- Status dos projetos
- Margem de lucro
- Análise temporal de vendas

## ⚙️ Configuração

### 1. Google Sheets API

Para conectar com sua planilha, você precisa:

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Sheets API
4. Crie credenciais (API Key)
5. Configure as variáveis de ambiente

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_GOOGLE_SHEETS_ID=1HJxcgh4yJit10flPdHcLWkSH34CGLLU4MLV8GhEOKGs
VITE_GOOGLE_API_KEY=sua_chave_api_aqui
VITE_SHEET_RANGE=Sheet1!A:U
```

### 3. Configuração da Planilha

Certifique-se que sua planilha Google Sheets:
- Está configurada como pública para leitura
- Possui os cabeçalhos corretos na primeira linha
- Segue a estrutura de dados especificada

## 🏗️ Estrutura dos Dados

A planilha deve conter as seguintes colunas:

- ID Projeto
- Cliente
- Cidade
- Código Projeto
- Data Início
- Data Prevista Entrega
- Valor Bruto (R$)
- Desconto (%)
- Valor Final (R$)
- Forma de Pagamento
- Parcelas
- Matéria-Prima (R$)
- Mão de Obra (R$)
- Impostos (R$)
- Logística (R$)
- Marketing (R$)
- Total Custos (R$)
- Lucro (R$)
- Margem Lucro (%)
- Status
- Vendedor Responsável

## 🚀 Como Usar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente
4. Execute o projeto: `npm run dev`
5. Acesse o dashboard no navegador

## 🔄 Atualização de Dados

- **Automática**: A cada 5 minutos
- **Manual**: Botão "Atualizar" no cabeçalho
- **Tempo Real**: Reflete mudanças na planilha instantaneamente

## 📱 Responsividade

O dashboard é otimizado para:
- Monitores de departamento (1920x1080+)
- Tablets e dispositivos móveis
- Diferentes resoluções de tela

## 🎨 Design

- Paleta de cores profissional
- Animações suaves e micro-interações
- Layout limpo e intuitivo
- Hierarquia visual clara
- Componentes modulares

## 🔧 Tecnologias

- React + TypeScript
- Tailwind CSS
- Google Sheets API
- Vite
- Lucide React (ícones)

## 📈 Métricas de Performance

O dashboard calcula automaticamente:
- Somas totais precisas
- Médias ponderadas
- Percentuais de share
- Tendências temporais
- Comparações período a período

## 🛠️ Manutenção

- Logs detalhados de conexão
- Tratamento de erros robusto
- Fallback para dados offline
- Validação de dados automática# dash-mov
