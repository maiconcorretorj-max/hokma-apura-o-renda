# Product Requirements Document (PRD) - Motor de Apuração de Renda

## 1. Visão Geral do Produto
O **Motor de Apuração de Renda** é uma aplicação web SaaS projetada para automatizar a análise financeira através da leitura de extratos bancários em formato PDF. O sistema calcula a renda mensal dos usuários baseando-se em transações de crédito, oferecendo resultados determinísticos, auditáveis e sem a utilização de IA generativa no seu núcleo de cálculo, assegurando total transparência.

## 2. Objetivos
*   Reduzir o tempo e o esforço manual na análise de extratos bancários.
*   Fornecer um cálculo de renda preciso, consistente e 100% auditável.
*   Oferecer uma plataforma segura com gestão de perfis e configurações.
*   Suportar a extração em múltiplos formatos de diferentes instituições financeiras.

## 3. Escopo Funcional (Features)

### 3.1. Autenticação e Gestão de Usuários
*   Login e Cadastro gerenciados através do Supabase.
*   Página de configurações de perfil (edição de foto, nome, CPF e email).
*   Configurações de segurança:
    *   Autenticação em Dois Fatores (2FA).
    *   Alteração de senha.
*   Preferências de interface (Ex: Dark Mode).
*   Gestão de preferências de notificações.

### 3.2. Motor de Processamento (Core Engine)
*   **Upload de Documentos:** Suporte nativo ao upload de extratos bancários em PDF.
*   **Parsing Determinístico:** Lógica baseada em expressões regulares e mapeamento de texto para identificar e classificar transações de forma exata.
*   **Filtros de Transação:** Omissão de saídas/despesas (Pix enviados, compras) e isolamento de entradas válidas para renda (Pix recebidos, depósitos, transferências).
*   **Cálculo Consolidador:** Soma mensal dos créditos elegíveis.
*   **Tratamento de Multi-Linhas e Formatos de Data:** Lógica robusta para juntar quebras de linha de histórico de transações e converter datas de formatos variados (nacionais e US).

### 3.3. Bancos e Formatos Suportados
O parser suporta atualmente as seguintes instituições financeiras:
*   Mercado Pago
*   Caixa Econômica Federal
*   Banco Neon
*   Revolut
*   PicPay

### 3.4. Interface do Usuário (UI/UX)
*   **Dashboard:** Visão geral da renda calculada, métricas financeiras e histórico de análises processadas.
*   **Visualização de Resultados:** Exibição detalhada e auditável de cada transação extraída que compõe a renda calculada, justificando o valor final.
*   **Acessibilidade e Responsividade:** Interface acessível e adaptada para Desktop e Mobile.

## 4. Requisitos Técnicos e Arquitetura

### 4.1. Stack Tecnológica
*   **Frontend:** Next.js 14, React, Tailwind CSS.
*   **Backend/API:** Next.js API Routes.
*   **Banco de Dados & Auth:** Supabase (PostgreSQL).
*   **Linguagem:** TypeScript para tipagem estática e segurança.

### 4.2. Premissas Arquiteturais
*   **Arquitetura Determinística:** Nenhuma etapa de extração de valores de PDFs ou cálculo depende de IA "caixa-preta". Todo o processo é testável e rastreável.
*   **Vercel Deployment:** A aplicação deve tratar apropriadamente limites de payload e de tempo de execução (serverless functions) na Vercel para uploads de PDFs médios/grandes.
*   **Gerenciamento de Estado:** Uso de React Hooks e Contexts/Zustand (se aplicável), priorizando componentes do lado do servidor (RSC) no Next.js 14 sempre que possível.

## 5. Próximos Passos (Roadmap)
*   Melhoria contínua e inclusão de suporte a novos formatos de bancos (Itaú, Bradesco, Nubank, etc.).
*   Exportação de relatórios em CSV/PDF.
*   Testes de carga e otimização para arquivos de múltiplas páginas com volume extremado de transações.
