// ============================================================
// TIPOS — Motor de Apuração de Renda v3.0.0-interactive
// ============================================================

export type ClassificacaoTransacao =
  | 'credito_valido'
  | 'possivel_vinculo_familiar'
  | 'debito'
  | 'ignorar_estorno'
  | 'ignorar_sem_keyword'
  | 'ignorar_autotransferencia'
  | 'ignorar_aposta'
  | 'ignorar_washtrading'
  | 'possivel_renda_familiar';

export interface Transacao {
  id: string;
  data: string;          // DD/MM/AAAA ou DD/MES/AAAA
  descricao: string;
  valor: number;         // centavos (inteiro)
  classificacao: ClassificacaoTransacao;
  is_validated: boolean; // entra no cálculo por padrão se true
  custom_tag?: string;   // 'washtrading' etc
  mesAno?: string;       // AAAA-MM (chave para agrupamento)
  motivoExclusao?: string; // razão da exclusão pelo motor
}

export interface ApuracaoResult {
  transacoes: Transacao[];
  totalApurado: number;     // centavos
  mediaMensal: number;      // centavos
  divisao6Meses: number;    // centavos
  divisao12Meses: number;   // centavos
  totalPorMes: Record<string, number>; // { "2025-01": 150000 }
  maiorMes: number;         // centavos
  menorMes: number;         // centavos
  mesesConsiderados: number;
  versaoAlgoritmo: string;
  hashPdf?: string;
  timestamp: string;
}

export interface IncomeReport {
  id?: string;
  created_at?: string;
  cliente_nome: string;
  cpf?: string;
  pdf_hash: string;
  total_apurado: number;
  media_mensal: number;
  divisao_6: number;
  divisao_12: number;
  transacoes_json: Transacao[];
  versao_algoritmo: string;
}

export interface ApuracaoPayload {
  textoExtrato: string;
  nomeCliente: string;
  cpf?: string;
  hashPdf: string;
}

export interface MetricasCalculadas {
  totalApurado: number;
  mediaMensal: number;
  divisao6Meses: number;
  divisao12Meses: number;
  totalPorMes: Record<string, number>;
  maiorMes: number;
  menorMes: number;
  mesesConsiderados: number;
}
