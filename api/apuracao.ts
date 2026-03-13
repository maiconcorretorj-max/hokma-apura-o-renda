// ============================================================
// MOTOR DE APURAÇÃO DE RENDA — v3.0.0-interactive
// 100% determinístico · Zero IA · Zero heurística probabilística
// Todos os valores em centavos (inteiros)
// ============================================================

import { type Transacao, type ClassificacaoTransacao, type ApuracaoResult } from '@/types/transaction';
import { v4 as uuidv4 } from 'uuid';

const VERSAO_ALGORITMO = '3.0.0-interactive';

// ── REGEXES PRINCIPAIS ─────────────────────────────────────────────────────────

const DATA_RE =
  /^\d{2}[\/\-\.\s]\d{2}(?:[\/\-\.\s]\d{4})?|^\d{2}[\/\-\.\s]+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[\/\-\.\s]?(?:\d{2,4})?/i;

const VALOR_RE =
  /([+-]?\s*(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2})\s*([CD]|\(\+\)|\(-\)|\+|-)?(?=\s|$|\|)/;

const MOEDAS_WHITELIST = 'USD|EUR|GBP|BRL|CHF|CAD|JPY|AUD|ARS';

const VALORES_LINE_RE = new RegExp(
  `([+-]?\\s*(?:R\\$?\\s*|\\b(?:${MOEDAS_WHITELIST})\\$?\\s*)?\\d{1,3}(?:[.,]\\d{3})*[.,]\\d{2})(?:\\s*([CD]|\\(\\+\\)|\\(-\\)|\\+|-))?(?=\\s|$|\\||[A-Za-z])`,
  'g'
);

// ── MESES EM EXTENSO ────────────────────────────────────────────────────────────

const MESES_EXTENSO: Record<string, string> = {
  janeiro: 'JAN', janeiro2: 'JAN', jan: 'JAN',
  fevereiro: 'FEV', fev: 'FEV',
  março: 'MAR', marco: 'MAR', mar: 'MAR',
  abril: 'ABR', abr: 'ABR',
  maio: 'MAI', mai: 'MAI',
  junho: 'JUN', jun: 'JUN',
  julho: 'JUL', jul: 'JUL',
  agosto: 'AGO', ago: 'AGO',
  setembro: 'SET', set: 'SET',
  outubro: 'OUT', out: 'OUT',
  novembro: 'NOV', nov: 'NOV',
  dezembro: 'DEZ', dez: 'DEZ',
};

const MES_NUM: Record<string, string> = {
  JAN: '01', FEV: '02', MAR: '03', ABR: '04', MAI: '05', JUN: '06',
  JUL: '07', AGO: '08', SET: '09', OUT: '10', NOV: '11', DEZ: '12',
};

// ── KEYWORDS ───────────────────────────────────────────────────────────────────

const KEYWORDS_APOSTAS_EXATAS = [
  'BETNACIONAL', 'BETANO', 'SPORTINGBET', 'BRAZINO', 'PIXBET',
  'ESPORTE DA SORTE', 'SUPERBET', 'NOVIBET', 'BLAZE', 'FORTUNE TIGER', 'TIGRINHO',
];

const KEYWORDS_APOSTAS_PALAVRA = [
  'BET', 'CASINO', 'CASSINO', 'APOSTA', 'LOTERIA', 'JOGO', 'SLOTS',
  'ROLETA', 'POKER', 'FORTUNE',
];

const KEYWORDS_IGNORAR = [
  'ESTORNO', 'DEVOLUCAO', 'PIXENVIADO', 'PIX ENVIADO', 'CANCELAMENTO',
  'ENTRE CONTAS', 'TRANSFERENCIA ENTRE CONTAS', 'MESMA TITULARIDADE',
  'APLICACAO', 'POUPANCA', 'CDB', 'CDI', 'IOF', 'RESGATE',
  'TARIFA', 'TAXA', 'JUROS', 'MULTA', 'COBRANCA', 'ANUIDADE', 'SALDO',
  'TOTAL ENTRADAS', 'TOTAL SAIDAS', 'MINHA CONTA', 'MINHA AGENCIA',
  'ITAUCARD', 'ITAÚ CARD', 'FATURA CARTAO', 'FATURA CARTÃO',
  'LIMITE', 'EMPRESTIMO', 'FINANCIAMENTO',
];

const KEYWORDS_RENDIMENTO_INVESTIMENTO = ['CDB', 'POUPANCA', 'FUNDO', 'RESGATE'];
const KEYWORDS_RENDIMENTO_RENDA = ['SALARIO', 'GRATIFICACAO', 'PREMIO', 'REMUNERACAO'];

const KEYWORDS_CREDITO = [
  'PIX RECEBIDO', 'RECEBIMENTO PIX', 'CRED PIX', 'PIX', 'TED', 'DOC', 'TEV',
  'DEPOSITO', 'CREDITO', 'TRANSFERENCIA RECEBIDA', 'RECEBIMENTO',
  'SALARIO', 'REMUNERACAO', 'VENCIMENTO', 'HONORARIO', 'COMISSAO',
  'FGTS', 'BENEFICIO', 'AUXILIO', 'INDENIZACAO', 'FERIAS', 'DECIMO TERCEIRO',
  'PAGAMENTO RECEBIDO', 'VENDA', 'LIQUIDACAO', 'CRED', 'CR ',
  'RECEB', 'ENTRADA', 'BONUS', 'PREMIO', 'RESTITUICAO', 'DEVOLUCAO IMPOSTO',
  'RENDIMENTO', 'DIVIDENDO', 'JCP', 'REEMBOLSO', 'ANTECIPACAO',
];

const KEYWORDS_RENDA_LABORAL = [
  'SALARIO', 'VENCIMENTO', 'REMUNERACAO', 'HONORARIO', 'COMISSAO', 'FGTS', 'BONUS',
];

const CABECALHOS_IGNORE = [
  'extrato de', 'bradesco', 'banco do brasil', 'lançamentos', 'histórico',
  'docto', 'documento', 'data descrição', 'data  descrição', 'hora tipo',
  'entradas (créditos)', 'saídas (débitos)', 'outras entradas',
  'res aplic aut mais', 'saldo aplic aut mais', 'este material está dispon',
  'saldo ao final do dia', 'documento emitido em',
  'agência', 'agencia:', 'cliente:', 'data:', 'conta:',
];

const SECTIONS_IGNORE = [
  'comprovantes de', 'pacote de serviços', 'índices econômicos',
  'resumo consolidado', 'demonstrativo de', 'posição de',
  'investimentos', 'fundos de investimento', 'crédito pessoal',
  'poupança', 'cartão de crédito', 'seguros', 'proteção',
];

const SECTIONS_VALID = [
  'conta corrente', 'movimentação', 'lançamentos', 'histórico',
  'transações da conta', 'extrato de conta', 'extrato da conta',
];

// ── HELPERS ────────────────────────────────────────────────────────────────────

function normalizar(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

function parseCentavos(valorStr: string, sufixo?: string): number {
  // Detectar formato US (Revolut): 1,500.00
  const isUs = /\d{1,3}(?:,\d{3})+\.\d{2}/.test(valorStr);

  let str = valorStr.replace(/\s/g, '').replace(/R\$\s*/gi, '');
  // Remover prefixos de moeda
  str = str.replace(new RegExp(`(?:${MOEDAS_WHITELIST})\\$?\\s*`, 'i'), '');

  let centavos: number;
  if (isUs) {
    centavos = Math.round(parseFloat(str.replace(/,/g, '')) * 100);
  } else {
    centavos = Math.round(parseFloat(str.replace(/\./g, '').replace(',', '.')) * 100);
  }

  if (isNaN(centavos)) return 0;

  // Aplicar sinal
  const negativo = /^-/.test(valorStr) || sufixo === 'D' || sufixo === '(-)' || sufixo === '-';
  return negativo ? -Math.abs(centavos) : Math.abs(centavos);
}

function parseMesAno(data: string): string {
  // Aceita: DD/MM/YYYY, DD/MES/YYYY, DD-MM-YYYY...
  const semAno = /^(\d{2})[\/\-\.\s](\d{2})$/.exec(data);
  if (semAno) return `0000-${semAno[2]}`;

  const numerico = /^(\d{2})[\/\-\.\s](\d{2})[\/\-\.\s](\d{4})/.exec(data);
  if (numerico) return `${numerico[3]}-${numerico[2]}`;

  const extenso = /^(\d{2})[\/\-\.\s](JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[\/\-\.\s]?(\d{2,4})?/i.exec(data);
  if (extenso) {
    const mesNum = MES_NUM[extenso[2].toUpperCase()];
    const ano = extenso[3] ? (extenso[3].length === 2 ? `20${extenso[3]}` : extenso[3]) : '0000';
    return `${ano}-${mesNum}`;
  }

  return '0000-00';
}

function normalizarDatasEmExtenso(texto: string): string {
  // "28 de fevereiro de 2026" → "28/FEV/2026"
  const mesesPt = 'janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez';

  let result = texto;

  // DD de MMMM de YYYY
  result = result.replace(
    new RegExp(`(\\d{1,2})\\s+(?:de\\s+)?(${mesesPt})\\.?\\s+(?:de\\s+)?(\\d{4})`, 'gi'),
    (_m, d, mes, ano) => {
      const mesNorm = normalizar(mes.replace('.', ''));
      const mesKey = Object.keys(MESES_EXTENSO).find(k => normalizar(k) === mesNorm) ?? '';
      const mesAbrev = MESES_EXTENSO[mesKey] ?? mes.toUpperCase().slice(0, 3);
      return `${d.padStart(2,'0')}/${mesAbrev}/${ano}`;
    }
  );

  // MMMM de YYYY (sem dia → 01)
  result = result.replace(
    new RegExp(`(?<![\\d\\/])(${mesesPt})\\.?\\s+(?:de\\s+)?(\\d{4})\\b`, 'gi'),
    (_m, mes, ano) => {
      const mesNorm = normalizar(mes.replace('.', ''));
      const mesKey = Object.keys(MESES_EXTENSO).find(k => normalizar(k) === mesNorm) ?? '';
      const mesAbrev = MESES_EXTENSO[mesKey] ?? mes.toUpperCase().slice(0, 3);
      return `01/${mesAbrev}/${ano}`;
    }
  );

  return result;
}

// ── DETECÇÃO DE BANCO ──────────────────────────────────────────────────────────

function isNeonBank(texto: string): boolean {
  return /neon\s*pagamentos|timeneon/i.test(texto.slice(0, 3000));
}

// ── PARSER NEON (DEDICADO) ─────────────────────────────────────────────────────

function extrairNeon(texto: string): Transacao[] {
  const linhas = texto.split('\n');
  const transacoes: Transacao[] = [];

  // Formato: DESCRIÇÃO  DD/MM/YYYY  HH:MM  R$ valor  R$ valor  -/+
  const RE_NEON = /(.{5,120}?)\s+(\d{2}\/\d{2}\/\d{4})\s+\d{2}.?\d{2}[^\d]*(\d[\d.]*,\d{2})/i;

  for (const linha of linhas) {
    const m = RE_NEON.exec(linha);
    if (!m) continue;

    const descricao = m[1].trim();
    const data = m[2];
    let valorStr = m[3];
    const centavos = parseCentavos(valorStr);
    if (centavos <= 0) continue;

    // Sinal negativo: \u0000 ou '-' antes do valor ou palavra "ENVIADO"
    const isNegativo =
      /ENVIADO|ENVIADA|PIX\s+ENVIADO/i.test(descricao) ||
      linha.includes('\u0000') ||
      /[-\u2013\u2014]\s*R\$\s*$/.test(linha.slice(0, linha.indexOf(valorStr)));

    const valor = isNegativo ? -centavos : centavos;

    transacoes.push({
      id: uuidv4(),
      data,
      descricao: descricao.trim(),
      valor,
      classificacao: 'credito_valido',
      is_validated: true,
      mesAno: parseMesAno(data),
    });
  }

  return transacoes;
}

// ── PARSER PRINCIPAL ───────────────────────────────────────────────────────────

function extrair(textoOriginal: string, anoContexto?: number): Transacao[] {
  // 1. Normalização unicode
  let texto = textoOriginal
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[–—−]/g, '-'); // en-dash, em-dash → hífen ASCII

  // 2. Normalizar datas em extenso
  texto = normalizarDatasEmExtenso(texto);

  const linhas = texto.split('\n');
  const transacoes: Transacao[] = [];

  // Detectar banco
  const isNeon = isNeonBank(texto);
  if (isNeon) return extrairNeon(texto);

  const isRevolut = /revolut/i.test(texto.slice(0, 3000));
  const isSantander = /santander/i.test(texto.slice(0, 1500));
  const isItauMensal = /ita[uú]/i.test(texto.slice(0, 2000)) && /entradas.*créditos/i.test(texto.slice(0, 5000));
  const isBradesco = /bradesco/i.test(texto.slice(0, 2000));
  const isC6 = /c6\s*bank/i.test(texto.slice(0, 2000));

  let isIgnoredSection = isSantander || isItauMensal;
  let saldoAnterior: number | null = null;
  let descAcumulada = '';
  let anoC6: number = anoContexto ?? new Date().getFullYear();

  for (let i = 0; i < linhas.length; i++) {
    const linhaRaw = linhas[i];
    const linha = linhaRaw.trim();
    const linhaNorm = normalizar(linha);

    if (!linha) continue;

    // ── Controle de seções ──
    if (SECTIONS_IGNORE.some(s => linhaNorm.includes(normalizar(s)))) {
      isIgnoredSection = true;
      continue;
    }
    if (SECTIONS_VALID.some(s => linhaNorm.includes(normalizar(s)))) {
      isIgnoredSection = false;
      continue;
    }
    if (isIgnoredSection) continue;

    // Cabeçalhos a ignorar
    if (CABECALHOS_IGNORE.some(h => linhaNorm.startsWith(normalizar(h)))) continue;

    // ── C6 Bank: capturar cabeçalho de mês ──
    if (isC6) {
      const mesMatch = /^(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+(\d{4})$/i.exec(linha);
      if (mesMatch) {
        anoC6 = parseInt(mesMatch[2]);
        continue;
      }
    }

    // ── Detectar linha com data ──
    const dataMatch = DATA_RE.exec(linha);
    if (!dataMatch) {
      // Pode ser continuação de descrição
      if (descAcumulada) {
        const valMatch = VALOR_RE.exec(linha);
        if (valMatch) {
          const centavos = parseCentavos(valMatch[1], valMatch[2]);
          transacoes.push({
            id: uuidv4(),
            data: '',
            descricao: (descAcumulada + ' ' + linha.replace(VALOR_RE, '').trim()).trim(),
            valor: centavos,
            classificacao: 'credito_valido',
            is_validated: true,
            mesAno: '0000-00',
          });
          descAcumulada = '';
        } else {
          descAcumulada += ' ' + linha;
        }
      }
      continue;
    }

    descAcumulada = '';
    let data = dataMatch[0].trim();

    // Completar ano se ausente (formato DD/MM sem ano)
    if (/^\d{2}[\/\-\.\s]\d{2}$/.test(data)) {
      data = `${data}/${anoC6}`;
    }

    const resto = linha.slice(dataMatch[0].length).trim();

    // Se Revolut: split por pipe
    let descricao = '';
    let valorBruto = 0;
    let sufixo = '';

    if (isRevolut) {
      const partes = linha.split('|').map(p => p.trim()).filter(Boolean);
      if (partes.length >= 3) {
        data = partes[0];
        descricao = partes[1];
        const vMatch = VALOR_RE.exec(partes[2]);
        if (vMatch) {
          valorBruto = parseCentavos(vMatch[1], vMatch[2]);
          sufixo = vMatch[2] ?? '';
        }
      }
    } else {
      // Tentar extrair todos os valores da linha
      const todosValores: Array<{ valor: number; sufixo: string }> = [];
      let m: RegExpExecArray | null;
      const re = new RegExp(VALORES_LINE_RE.source, 'g');
      while ((m = re.exec(resto)) !== null) {
        todosValores.push({ valor: parseCentavos(m[1], m[2]), sufixo: m[2] ?? '' });
      }

      if (todosValores.length === 0) {
        // Linha de data sem valor → acumular descrição
        descAcumulada = linha;
        continue;
      }

      // ── Bradesco: inferência por saldo ──
      if (isBradesco && todosValores.length >= 2) {
        const saldoAtual = Math.abs(todosValores[todosValores.length - 1].valor);
        const valorTx = Math.abs(todosValores[todosValores.length - 2].valor);

        if (saldoAnterior !== null) {
          const diffCredito = Math.abs(saldoAnterior + valorTx - saldoAtual);
          const diffDebito = Math.abs(saldoAnterior - valorTx - saldoAtual);
          valorBruto = diffCredito <= 5 ? valorTx : diffDebito <= 5 ? -valorTx : valorTx;
        } else {
          valorBruto = todosValores[0].valor;
        }
        saldoAnterior = saldoAtual;
        sufixo = valorBruto >= 0 ? 'C' : 'D';
      } else {
        // Usar primeiro valor com sufixo
        valorBruto = todosValores[0].valor;
        sufixo = todosValores[0].sufixo;
      }

      // Extrair descrição removendo valores
      descricao = resto.replace(new RegExp(VALORES_LINE_RE.source, 'g'), '').replace(/\s+/g, ' ').trim();
    }

    if (!descricao) descricao = resto;

    transacoes.push({
      id: uuidv4(),
      data,
      descricao: descricao.trim(),
      valor: valorBruto,
      classificacao: 'credito_valido', // classificar depois
      is_validated: true,
      mesAno: parseMesAno(data),
    });
  }

  return transacoes;
}

// ── CLASSIFICAÇÃO v3 (8 REGRAS EM CASCATA) ────────────────────────────────────

function classificar(transacoes: Transacao[], nomeCliente: string, cpf?: string): Transacao[] {
  const STOPWORDS = ['DE', 'DA', 'DO', 'DAS', 'DOS', 'E', 'A', 'O', 'EM', 'NO', 'NA'];

  // Tokenizar nome do cliente
  const tokensCliente = normalizar(nomeCliente)
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.includes(t));

  const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : '';

  return transacoes.map(tx => {
    const desc = normalizar(tx.descricao);

    // Regra 1: Débito
    if (tx.valor <= 0) {
      return { ...tx, classificacao: 'debito' as ClassificacaoTransacao, is_validated: false };
    }

    // Regra 2a: Apostas/Jogos
    if (KEYWORDS_APOSTAS_EXATAS.some(kw => desc.includes(normalizar(kw)))) {
      return { ...tx, classificacao: 'ignorar_aposta' as ClassificacaoTransacao, is_validated: false };
    }
    if (KEYWORDS_APOSTAS_PALAVRA.some(kw => new RegExp(`\\b${kw}\\b`).test(desc))) {
      return { ...tx, classificacao: 'ignorar_aposta' as ClassificacaoTransacao, is_validated: false };
    }

    // Regra 2b: Estornos/Investimentos
    if (KEYWORDS_IGNORAR.some(kw => desc.includes(normalizar(kw)))) {
      return { ...tx, classificacao: 'ignorar_estorno' as ClassificacaoTransacao, is_validated: false };
    }

    // Rendimento contextual
    if (desc.includes('RENDIMENTO')) {
      const isInvestimento = KEYWORDS_RENDIMENTO_INVESTIMENTO.some(k => desc.includes(k));
      const isRenda = KEYWORDS_RENDIMENTO_RENDA.some(k => desc.includes(k));
      if (isInvestimento && !isRenda) {
        return { ...tx, classificacao: 'ignorar_estorno' as ClassificacaoTransacao, is_validated: false };
      }
    }

    // Regra 3: Sem keyword de crédito
    const temKeywordCredito = KEYWORDS_CREDITO.some(kw => desc.includes(normalizar(kw)));
    if (!temKeywordCredito) {
      return { ...tx, classificacao: 'ignorar_sem_keyword' as ClassificacaoTransacao, is_validated: false };
    }

    // Regra 4: Autotransferência (match forte) — pular se renda laboral
    const isRendaLaboral = KEYWORDS_RENDA_LABORAL.some(kw => desc.includes(normalizar(kw)));
    if (!isRendaLaboral && tokensCliente.length > 0) {
      let matchesFortes = 0;
      for (const token of tokensCliente) {
        if (new RegExp(`\\b${token}\\b`).test(desc)) matchesFortes++;
      }
      const isForte =
        matchesFortes >= 3 ||
        matchesFortes / tokensCliente.length >= 0.7 ||
        (cpfLimpo && desc.includes(cpfLimpo)) ||
        desc.includes('MESMA TITULARIDADE');

      if (isForte) {
        return { ...tx, classificacao: 'ignorar_autotransferencia' as ClassificacaoTransacao, is_validated: false };
      }

      // Regra 5: Vínculo familiar (match fraco)
      if (matchesFortes >= 1) {
        return { ...tx, classificacao: 'possivel_vinculo_familiar' as ClassificacaoTransacao, is_validated: true };
      }
    }

    // Regra 8: Crédito válido
    return { ...tx, classificacao: 'credito_valido' as ClassificacaoTransacao, is_validated: true };
  });
}

// ── PÓS-PROCESSAMENTO ──────────────────────────────────────────────────────────

function deduplicar(transacoes: Transacao[]): Transacao[] {
  const vistas = new Set<string>();
  return transacoes.filter(tx => {
    const sig = `${tx.data}_${tx.valor}_${tx.descricao.slice(0, 15)}`;
    if (vistas.has(sig)) return false;
    vistas.add(sig);
    return true;
  });
}

function detectarWashTrading(transacoes: Transacao[]): Transacao[] {
  const debitos = transacoes.filter(tx => tx.classificacao === 'debito');

  return transacoes.map(tx => {
    if (tx.classificacao !== 'credito_valido') return tx;
    const temDebito = debitos.some(
      d => Math.abs(d.valor) === tx.valor && d.data === tx.data
    );
    if (temDebito) {
      return {
        ...tx,
        classificacao: 'possivel_vinculo_familiar' as ClassificacaoTransacao,
        is_validated: false,
        custom_tag: 'washtrading',
      };
    }
    return tx;
  });
}

// ── CÁLCULO DE MÉTRICAS ────────────────────────────────────────────────────────

function calcularMetricas(transacoes: Transacao[]): Omit<ApuracaoResult, 'transacoes' | 'versaoAlgoritmo' | 'hashPdf' | 'timestamp'> {
  const totalPorMes: Record<string, number> = {};

  for (const tx of transacoes) {
    if (!tx.is_validated) continue;
    if (tx.classificacao !== 'credito_valido' && tx.classificacao !== 'possivel_vinculo_familiar') continue;
    if (tx.valor <= 0) continue;
    if (!tx.mesAno || tx.mesAno === '0000-00') continue;

    totalPorMes[tx.mesAno] = (totalPorMes[tx.mesAno] ?? 0) + tx.valor;
  }

  const valores = Object.values(totalPorMes);
  const mesesConsiderados = valores.length;
  const totalApurado = valores.reduce((s, v) => s + v, 0);
  const mediaMensal = mesesConsiderados > 0 ? Math.round(totalApurado / mesesConsiderados) : 0;
  const divisao6Meses = Math.round(totalApurado / 6);
  const divisao12Meses = Math.round(totalApurado / 12);
  const maiorMes = valores.length > 0 ? Math.max(...valores) : 0;
  const menorMes = valores.length > 0 ? Math.min(...valores) : 0;

  return { totalApurado, mediaMensal, divisao6Meses, divisao12Meses, totalPorMes, maiorMes, menorMes, mesesConsiderados };
}

// ── API PÚBLICA ────────────────────────────────────────────────────────────────

export interface ApuracaoInput {
  textoExtrato: string;
  nomeCliente: string;
  cpf?: string;
  hashPdf: string;
}

export function executarApuracao(input: ApuracaoInput): ApuracaoResult {
  const { textoExtrato, nomeCliente, cpf, hashPdf } = input;

  // 1. Extração bruta
  let transacoes = extrair(textoExtrato);

  // 2. Classificação
  transacoes = classificar(transacoes, nomeCliente, cpf);

  // 3. Deduplicação
  transacoes = deduplicar(transacoes);

  // 4. Wash trading
  transacoes = detectarWashTrading(transacoes);

  // 5. Métricas
  const metricas = calcularMetricas(transacoes);

  return {
    transacoes,
    ...metricas,
    versaoAlgoritmo: VERSAO_ALGORITMO,
    hashPdf,
    timestamp: new Date().toISOString(),
  };
}
