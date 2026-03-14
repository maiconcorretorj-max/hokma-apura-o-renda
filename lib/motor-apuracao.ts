// ============================================================
// MOTOR DE APURAÇÃO DE RENDA — v3.0.0-interactive
// 100% determinístico · Zero IA · Zero heurística probabilística
// Todos os valores em centavos (inteiros)
// ============================================================

import { type Transacao, type ClassificacaoTransacao, type ApuracaoResult } from '@/types/transaction';
import { v4 as uuidv4 } from 'uuid';

const VERSAO_ALGORITMO = '3.0.0-interactive';

// ═══════════════════════════════════════════════════════════════
// KEYWORDS
// ═══════════════════════════════════════════════════════════════

const KEYWORDS_CREDITO = [
  'PIX RECEBIDO', 'RECEBIMENTO PIX', 'RECEBIMENTO DE PIX', 'TRANSFERENCIA PIX RECEBIDA',
  'PIX RECEBIDO DE', 'CRED PIX', 'CR PIX', 'REM', 'REM.', 'REM:', 'DES:',
  'TED RECEBIDA', 'TED CREDITO', 'DOC RECEBIDO', 'DOC CREDITO', 'TEV RECEBIDA',
  'TED', 'DOC', 'TEV', 'LIQUIDACAO',
  'CRED TED', 'CR TED', 'CRED DOC', 'CR DOC',
  'DEPOSITO', 'DEPOSITO IDENTIFICADO', 'DEPOSITO BANCARIO', 'DEPOSITO EM CONTA', 'DEP IDENT',
  'CREDITO', 'CREDITO EM CONTA',
  'CRED SAL', 'CRED FGTS', 'CRED INSS',
  'TRANSFERENCIA RECEBIDA', 'TRANSFERENCIA CREDITADA', 'RECEBIMENTO', 'RECEBIMENTO DE TRANSFERENCIA',
  'PAGAMENTO RECEBIDO', 'TR RECEB', 'PAG RECEB',
  'SALARIO', 'REMUNERACAO', 'VENCIMENTO', 'HONORARIO', 'COMISSAO', 'PROVENTO',
  'PREMIO', 'BONIFICACAO', 'GRATIFICACAO', 'ADIANTAMENTO SALARIAL', 'FERIAS', 'DECIMO TERCEIRO', '13 SALARIO',
  'BENEFICIO', 'AUXILIO', 'INDENIZACAO', 'RESCISAO', 'FGTS',
  'RECEBIMENTO DE PAGAMENTO', 'LIBERACAO DE DINHEIRO', 'PAGAMENTO COM CODIGO QR',
  'VENDA', 'TRANSF', 'PIX',
];

const KEYWORDS_IGNORAR = [
  'ESTORNO', 'DEVOLUCAO', 'DEVOLUCAO PIX', 'ESTORNO PIX', 'CANCELAMENTO',
  'ENTRE CONTAS', 'TRANSFERENCIA ENTRE CONTAS', 'MESMA TITULARIDADE', 'CONTA PROPRIA',
  'PIXENVIADO', 'PIX ENVIADO',
  'RENDIMENTO POUPANCA', 'RENDIMENTO CDB', 'RENDIMENTO FUNDO',
  'RESGATE', 'RESGATE CDB', 'RESGATE POUPANCA', 'RESGATE FUNDO',
  'APLICACAO', 'APLICACAO AUTOMATICA', 'POUPANCA', 'CDB', 'CDI', 'IOF',
  'CORRECAO MONETARIA', 'CORR MONETARIA',
  'EMPRESTIMO', 'ANTECIPACAO EMPRESTIMO', 'CREDITO CONSIGNADO', 'LIBERACAO EMPRESTIMO',
  'SALDO', 'SALDO ANTERIOR', 'TARIFA', 'TAXA', 'JUROS', 'MULTA', 'COBRANCA', 'ANUIDADE',
  'TOTAL DE CREDITOS', 'TOTAL DE DEBITOS', 'DEPOSITOS / TRANSFERENCIAS', 'SAQUES / TRANSFERENCIAS',
  'SOMA', 'SUBTOTAL', 'OUTROS CREDITOS', 'PAGAMENTOS / TRANSFERENCIAS',
  'TOTAL ENTRADAS', 'TOTAL SAIDAS', 'TOTAL ENTRADAS TOTAL SAIDAS',
  'TRANSFERENCIAS DOCS E TEDS', 'TRANSFERENCIAS DOCS TEDS',
  'DEPOSITOS E RECEBIMENTOS', 'OUTRAS ENTRADAS', 'OUTRAS SAIDAS',
  'APLIC AUT MAIS', 'APLIC MAIS', 'SALDO APLIC', 'RES APLIC AUT', 'SALDO APLIC AUT MAIS',
  'MINHA CONTA', 'MINHA AGENCIA',
  'ITAUCARD', 'ITAU CARD', 'FATURA CARTAO', 'FATURA CARTAO', 'LIMITE', 'FINANCIAMENTO',
];

// Apostas — exatas (includes) e palavras com word-boundary
const KEYWORDS_APOSTAS_EXATAS = [
  'BETNACIONAL', 'BETANO', 'SPORTINGBET', 'BRAZINO', 'PIXBET',
  'ESPORTE DA SORTE', 'SUPERBET', 'NOVIBET', 'BLAZE', 'FORTUNE TIGER', 'TIGRINHO',
];
const KEYWORDS_APOSTAS_PALAVRA = [
  'BET', 'CASINO', 'CASSINO', 'APOSTA', 'APOSTAS', 'LOTERIA', 'LOTERICA',
  'JOGO', 'JOGOS', 'SLOTS', 'ROLETA', 'POKER', 'FORTUNE',
];
const APOSTAS_PALAVRA_RE = new RegExp(
  '\\b(' + KEYWORDS_APOSTAS_PALAVRA.join('|') + ')\\b', 'i'
);

// Renda laboral — pula verificação de autotransferência
const INCOME_KEYWORDS_NOMES = new Set([
  'SALARIO', 'VENCIMENTO', 'REMUNERACAO', 'HONORARIO', 'COMISSAO',
  'PROVENTO', 'BONIFICACAO', 'GRATIFICACAO', 'INDENIZACAO', 'RESCISAO',
  'FGTS', 'BENEFICIO', 'AUXILIO', 'FERIAS', 'DECIMO TERCEIRO',
  '13 SALARIO', 'ADIANTAMENTO SALARIAL', 'CRED SAL', 'CRED FGTS',
]);

// RENDIMENTO contextual
const RENDIMENTO_EXCLUSAO_CONTEXTO = ['CDB', 'POUPANCA', 'FUNDO', 'RESGATE'];
const RENDIMENTO_INCLUSAO_CONTEXTO = ['GRATIFICACAO', 'SALARIO', 'PREMIO', 'TRABALHO'];

// Cabeçalhos de extrato a ignorar
const CABECALHOS_IGNORE =
  /^(extrato de|bradesco|banco do brasil|lançamentos|histórico|docto|crédito|débito|saldo|data:|cliente:|agência:|conta:|^[\d/]+$|saldo ao final do dias?[:,]?|documento emitido em|hora\s+tipo|origem.*destino|forma de pagamento|entradas\s*(\(cr[eé]ditos?\))?$|sa[ií]das\s*(\(d[eé]bitos?\))?$|outras entradas|dep[oó]sitos e recebimentos|este material est[aá] dispon|res aplic aut mais|saldo aplic aut mais)/i;

const SECTIONS_IGNORE =
  /^(comprovantes? de|pacote de servi[çc]os|[íi]ndices econ[óo]micos|resumo consolidado|demonstrativo de|posi[çc][ãa]o de|investimentos|t[íi]tulos? de capitaliza[çc][ãa]o|fundos? de investimento|cr[ée]dito pessoal|poupan[çc]a|cart[ãa]o de cr[ée]dito|seguros|prote[çc][ãa]o)/i;

const SECTIONS_VALID =
  /(conta corrente|movimenta[çc][ãa]o|lan[çc]amentos|hist[óo]rico(?! de)|transa[çc][ão][ãe]es da conta|extrato( de( conta| transa))?|data\s+descri[çc][ãa]o)/i;

// Regex para data e valor
const DATA_RE =
  /^(\d{2}[\/\-\.\s]\d{2}(?:[\/\-\.\s]\d{4})?|\d{2}[\/\-\.\s]+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[\/\-\.\s]?(?:\d{2,4})?)/i;

const VALOR_RE =
  /([+-]?\s*(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2})\s*([CD]|\(\+\)|\(-\)|\+|-)?(?=\s|$|\|)/i;

const MOEDAS_WL = 'USD|EUR|GBP|BRL|CHF|CAD|JPY|AUD|ARS';

const MESES_EXTENSO_MAP: Record<string, string> = {
  janeiro: 'JAN', fevereiro: 'FEV', março: 'MAR', marco: 'MAR', abril: 'ABR',
  maio: 'MAI', junho: 'JUN', julho: 'JUL', agosto: 'AGO',
  setembro: 'SET', outubro: 'OUT', novembro: 'NOV', dezembro: 'DEZ',
  jan: 'JAN', fev: 'FEV', mar: 'MAR', abr: 'ABR', mai: 'MAI',
  jun: 'JUN', jul: 'JUL', ago: 'AGO', set: 'SET', out: 'OUT', nov: 'NOV', dez: 'DEZ',
};

const MES_NUM: Record<string, string> = {
  JAN: '01', FEV: '02', MAR: '03', ABR: '04', MAI: '05', JUN: '06',
  JUL: '07', AGO: '08', SET: '09', OUT: '10', NOV: '11', DEZ: '12',
};

const STOPWORDS = new Set(['DE', 'DA', 'DO', 'DOS', 'DAS', 'E']);

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

function removerAcentos(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizar(s: string): string {
  return removerAcentos(s)
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizar(s: string): string[] {
  return normalizar(s)
    .split(' ')
    .filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function parseMoeda(raw: string): number {
  const limpo = raw.trim().replace(/^R\$\s*/i, '').replace(/^-R\$\s*/i, '-').trim();
  if (limpo.includes(',')) {
    const v = parseFloat(limpo.replace(/\./g, '').replace(',', '.'));
    return isNaN(v) ? 0 : Math.round(v * 100);
  }
  const v = parseFloat(limpo.replace(/\./g, ''));
  return isNaN(v) ? 0 : Math.round(v * 100);
}

function parseCentavos(valorStr: string, sufixo?: string): number {
  const isUs = /\d{1,3}(?:,\d{3})+\.\d{2}/.test(valorStr);
  let str = valorStr.replace(/\s/g, '').replace(/R\$\s*/gi, '');
  str = str.replace(new RegExp(`(?:${MOEDAS_WL})\\$?\\s*`, 'i'), '');

  let centavos: number;
  if (isUs) {
    centavos = Math.round(parseFloat(str.replace(/,/g, '')) * 100);
  } else {
    centavos = Math.round(parseFloat(str.replace(/\./g, '').replace(',', '.')) * 100);
  }
  if (isNaN(centavos)) return 0;

  const negativo = /^-/.test(valorStr) || sufixo === 'D' || sufixo === '(-)' || sufixo === '-';
  return negativo ? -Math.abs(centavos) : Math.abs(centavos);
}

function normalizarDatasEmExtenso(texto: string): string {
  const mesesPt = Object.keys(MESES_EXTENSO_MAP).join('|');

  let result = texto;
  // "28 de fevereiro de 2026" → "28/FEV/2026"
  result = result.replace(
    new RegExp(`(\\d{1,2})\\s+(?:de\\s+)?(${mesesPt})\\.?\\s+(?:de\\s+)?(\\d{4})`, 'gi'),
    (_m, d, mes, ano) => {
      const mesNorm = removerAcentos(mes.replace('.', '')).toLowerCase();
      const mesAbrev = MESES_EXTENSO_MAP[mesNorm] ?? mes.toUpperCase().slice(0, 3);
      return `${d.padStart(2, '0')}/${mesAbrev}/${ano}`;
    }
  );
  // "fevereiro de 2026" (sem dia → 01)
  result = result.replace(
    new RegExp(`(?<![\\d\\/])(${mesesPt})\\.?\\s+(?:de\\s+)?(\\d{4})\\b`, 'gi'),
    (_m, mes, ano) => {
      const mesNorm = removerAcentos(mes.replace('.', '')).toLowerCase();
      const mesAbrev = MESES_EXTENSO_MAP[mesNorm] ?? mes.toUpperCase().slice(0, 3);
      return `01/${mesAbrev}/${ano}`;
    }
  );
  return result;
}

function parseMesAno(data: string): string {
  const semAno = /^(\d{2})[\/\-\.\s](\d{2})$/.exec(data);
  if (semAno) return `0000-${semAno[2].padStart(2, '0')}`;

  const numerico = /^(\d{2})[\/\-\.\s](\d{2})[\/\-\.\s](\d{4})/.exec(data);
  if (numerico) return `${numerico[3]}-${numerico[2].padStart(2, '0')}`;

  const extenso = /^(\d{2})[\/\-\.\s](JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)[\/\-\.\s]?(\d{2,4})?/i.exec(data);
  if (extenso) {
    const mesNum = MES_NUM[extenso[2].toUpperCase()];
    const ano = extenso[3] ? (extenso[3].length === 2 ? `20${extenso[3]}` : extenso[3]) : '0000';
    return `${ano}-${mesNum}`;
  }
  return '0000-00';
}

// ═══════════════════════════════════════════════════════════════
// MATCHING
// ═══════════════════════════════════════════════════════════════

type ResultadoMatch = 'forte' | 'fraco' | 'sem_match';

function calcularMatch(nome: string, descricao: string, cpf?: string): ResultadoMatch {
  if (!nome || nome.trim().length === 0) return 'sem_match';

  const descNorm = normalizar(descricao);

  if (descNorm.includes('MESMA TITULARIDADE')) return 'forte';

  if (cpf) {
    const digits = cpf.replace(/[^\d]/g, '');
    if (digits.length >= 9) {
      const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
      const found = descNorm.match(cpfRegex);
      if (found?.some(m => m.replace(/[^\d]/g, '').includes(digits.slice(0, 9)))) {
        return 'forte';
      }
    }
  }

  const tokensNome = tokenizar(nome);
  if (tokensNome.length === 0) return 'sem_match';

  const encontrados = tokensNome.filter(t =>
    new RegExp(`(?:^|\\s)${t}(?:\\s|$)`).test(descNorm)
  );

  const percentual = Math.round((encontrados.length / tokensNome.length) * 100);

  if (percentual >= 70 || encontrados.length >= 3) return 'forte';
  if (encontrados.length >= 1) return 'fraco';
  return 'sem_match';
}

// ═══════════════════════════════════════════════════════════════
// RENDIMENTO CONTEXTUAL
// ═══════════════════════════════════════════════════════════════

function deveIgnorarRendimento(descNorm: string): boolean {
  if (!descNorm.includes('RENDIMENTO')) return false;
  if (RENDIMENTO_INCLUSAO_CONTEXTO.some(k => descNorm.includes(k))) return false;
  return RENDIMENTO_EXCLUSAO_CONTEXTO.some(k => descNorm.includes(k));
}

// ═══════════════════════════════════════════════════════════════
// CLASSIFICAÇÃO por transação individual
// ═══════════════════════════════════════════════════════════════

interface ContextoNomes {
  nomeCliente: string;
  cpf?: string;
}

function classificarTransacao(
  dataRaw: string,
  descricaoRaw: string,
  valorNum: number,
  ctx: ContextoNomes
): Transacao {
  const mesAno = parseMesAno(dataRaw);
  const descNorm = normalizar(descricaoRaw);

  const base = {
    id: uuidv4(),
    data: dataRaw,
    descricao: descricaoRaw,
    valor: valorNum,
    mesAno,
  };

  // 1. Débito
  if (valorNum <= 0) {
    return { ...base, classificacao: 'debito', is_validated: false };
  }

  // 2a. Apostas / jogos
  const temAposta =
    KEYWORDS_APOSTAS_EXATAS.some(k => descNorm.includes(normalizar(k))) ||
    APOSTAS_PALAVRA_RE.test(descNorm);
  if (temAposta) {
    return { ...base, classificacao: 'ignorar_aposta', motivoExclusao: 'Aposta/jogo', is_validated: false };
  }

  // 2b. Estorno + RENDIMENTO contextual
  const temIgnorar = KEYWORDS_IGNORAR.some(k => descNorm.includes(normalizar(k)));
  const temRendimento = deveIgnorarRendimento(descNorm);
  if (temIgnorar || temRendimento) {
    return { ...base, classificacao: 'ignorar_estorno', motivoExclusao: 'Estorno/investimento', is_validated: false };
  }

  // 3. Sem keyword de crédito
  const temCredito = KEYWORDS_CREDITO.some(k => descNorm.includes(normalizar(k)));
  if (!temCredito) {
    return { ...base, classificacao: 'ignorar_sem_keyword', motivoExclusao: 'Sem keyword de crédito', is_validated: false };
  }

  // Proteção: renda laboral comprovada → pula verificação de nome
  const ehRendaLaboral = [...INCOME_KEYWORDS_NOMES].some(k => descNorm.includes(k));

  if (!ehRendaLaboral) {
    // 4. Autotransferência (match forte)
    if (calcularMatch(ctx.nomeCliente, descricaoRaw, ctx.cpf) === 'forte') {
      return { ...base, classificacao: 'ignorar_autotransferencia', motivoExclusao: 'Autotransferência', is_validated: false };
    }

    // 5. Vínculo familiar (match fraco)
    if (calcularMatch(ctx.nomeCliente, descricaoRaw, ctx.cpf) === 'fraco') {
      return { ...base, classificacao: 'possivel_vinculo_familiar', motivoExclusao: 'Match fraco — revisão manual', is_validated: true };
    }
  }

  // 8. Crédito válido
  return { ...base, classificacao: 'credito_valido', is_validated: true };
}

// ═══════════════════════════════════════════════════════════════
// DETECÇÃO DE BANCO NEON
// ═══════════════════════════════════════════════════════════════

function isNeonBank(texto: string): boolean {
  return /neon\s*pagamentos|timeneon/i.test(texto.slice(0, 3000));
}

// ═══════════════════════════════════════════════════════════════
// PARSER NEON
// ═══════════════════════════════════════════════════════════════

function extrairNeon(
  texto: string,
  ctx: ContextoNomes
): Transacao[] {
  const linhas = texto.split('\n');
  const transacoes: Transacao[] = [];
  const RE_NEON = /(.{5,120}?)\s+(\d{2}\/\d{2}\/\d{4})\s+\d{2}.?\d{2}[^\d]*(\d[\d.]*,\d{2})/i;

  for (const linha of linhas) {
    const m = RE_NEON.exec(linha);
    if (!m) continue;

    let desc = m[1].trim();
    const dataRaw = m[2];
    let valorStr = m[3];

    if (desc.length < 3) continue;

    const isNegativo =
      /ENVIADO|ENVIADA|PIX\s+ENVIADO/i.test(desc) ||
      linha.includes('\u0000');
    if (isNegativo) valorStr = '-' + valorStr;

    const valor = parseMoeda(valorStr);
    const tx = classificarTransacao(dataRaw, desc, valor, ctx);
    // Dedup simples
    const existe = transacoes.some(
      t => t.data === tx.data && t.valor === tx.valor && t.descricao.slice(0, 15) === tx.descricao.slice(0, 15)
    );
    if (!existe) transacoes.push(tx);
  }
  return transacoes;
}

// ═══════════════════════════════════════════════════════════════
// PARSER PRINCIPAL
// ═══════════════════════════════════════════════════════════════

function extrair(textoOriginal: string, ctx: ContextoNomes): Transacao[] {
  let texto = textoOriginal
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[–—−]/g, '-');

  texto = normalizarDatasEmExtenso(texto);

  if (isNeonBank(texto)) return extrairNeon(texto, ctx);

  const isRevolut = /revolut/i.test(texto.slice(0, 3000));
  const isSantander = /santander/i.test(texto.slice(0, 1500));
  const isItauMensal = /ita[uú]/i.test(texto.slice(0, 2000)) && /entradas.*cr[eé]ditos/i.test(texto.slice(0, 5000));
  const isBradesco = /bradesco/i.test(texto.slice(0, 2000));
  const isC6 = /c6\s*bank/i.test(texto.slice(0, 2000));

  let isIgnoredSection = isSantander || isItauMensal;
  let saldoAnterior: number | null = null;
  let descAcumulada = '';
  let anoContextual = String(new Date().getFullYear());

  const mAnoInicial = texto.match(/\b(20\d{2})\b/);
  if (mAnoInicial) anoContextual = mAnoInicial[1];

  const C6_MES_RE = /^(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+(20\d{2})$/i;

  const linhas = isRevolut
    ? texto.split(/[\n|]/).map(l => l.trim()).filter(l => l.length > 0)
    : texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const vistas = new Set<string>();
  const todos: Array<{ dataRaw: string; descricaoRaw: string; valor: number }> = [];
  let dataContextual = '';

  const VALORES_RE = new RegExp(
    `([+-]?\\s*(?:R\\$?\\s*|\\b(?:${MOEDAS_WL})\\$?\\s*)?\\d{1,3}(?:[.,]\\d{3})*[.,]\\d{2})(?:\\s*([CD]|\\(\\+\\)|\\(-\\)|\\+|-))?(?=\\s|$|\\||[A-Za-z])`,
    'ig'
  );

  function add(dataRaw: string, descricaoRaw: string, valorStr: string, isCreditInferred?: boolean) {
    let v = valorStr.replace(/\s+/g, '').replace(/^R\$/i, '').replace(/^-R\$/i, '-');
    if (v.startsWith('+')) v = v.substring(1);

    const mDC = v.match(/^(-?[\d.,]+[.,]\d{2})([CD]|\(\+\)|\(-\)|\+|-)?$/i);
    if (mDC) {
      const numPart = mDC[1].replace(/^-/, '');
      const suf = (mDC[2] ?? '').toUpperCase();
      if (mDC[1].startsWith('-')) {
        v = `-${numPart}`;
      } else if (suf === 'D' || suf === '(-)' || suf === '-') {
        v = `-${numPart}`;
      } else if (suf === 'C' || suf === '(+)' || suf === '+') {
        v = numPart;
      } else if (isCreditInferred === false) {
        v = `-${numPart}`;
      }
    } else if (isCreditInferred === false) {
      v = `-${v}`;
    }

    const desc = descricaoRaw.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
    if (desc.length < 3) return;
    const chave = `${dataRaw}|${desc.slice(0, 20)}|${v}`;
    if (!vistas.has(chave)) {
      vistas.add(chave);
      todos.push({ dataRaw, descricaoRaw: desc, valor: parseMoeda(v) });
    }
  }

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];
    if (!linha) continue;

    // Controle de seções
    if (linha.length < 80) {
      if (SECTIONS_IGNORE.test(linha)) { isIgnoredSection = true; continue; }
      else if (SECTIONS_VALID.test(linha)) { isIgnoredSection = false; continue; }
    }
    if (isIgnoredSection) continue;

    // C6 Bank: capturar mês do cabeçalho
    if (isC6) {
      const mesMatch = C6_MES_RE.exec(linha);
      if (mesMatch) { anoContextual = mesMatch[2]; continue; }
    }

    // Cabeçalhos a ignorar
    if (CABECALHOS_IGNORE.test(linha)) continue;

    // Dupla data (DD/MM + DD/MM)
    const mDuplaDatas = linha.match(/^(\d{2}\/\d{2})\s+(\d{2}\/\d{2})\s+(.+)/);
    const linhaProcessada = mDuplaDatas ? `${mDuplaDatas[1]} ${mDuplaDatas[3]}` : linha;

    const mData = linhaProcessada.match(DATA_RE);

    if (mData) {
      let dataCandidata = mData[1];
      const mAno = dataCandidata.match(/\b(20\d{2})\b/);
      if (mAno) { anoContextual = mAno[1]; }
      else { dataCandidata = `${dataCandidata}/${anoContextual}`; }
      dataContextual = dataCandidata;

      let descSemData = linha.substring(mData[0].length).trim();

      if (/^saldo\s+(do\s+dia|anterior|final|bloqueado)/i.test(descSemData)) {
        const mSaldo = descSemData.match(VALOR_RE);
        if (mSaldo) saldoAnterior = parseMoeda(mSaldo[1]);
        descAcumulada = '';
        continue;
      }

      const valoresLine = Array.from(descSemData.matchAll(new RegExp(VALORES_RE.source, 'ig')));

      if (valoresLine.length > 0) {
        let descPura = descSemData;
        valoresLine.forEach(m => { descPura = descPura.replace(m[0], ''); });
        descPura = `${descAcumulada} ${descPura}`.trim();
        descAcumulada = '';

        if (!descPura || /^\d+$/.test(descPura)) continue;

        if (isBradesco && valoresLine.length >= 2) {
          const ult = valoresLine[valoresLine.length - 1];
          const penult = valoresLine[valoresLine.length - 2];
          const saldoAtual = Math.abs(parseMoeda(ult[1]));
          const valorTx = Math.abs(parseMoeda(penult[1]));
          let isCreditInferred: boolean | undefined;
          if (saldoAnterior !== null) {
            const diffC = Math.abs(saldoAnterior + valorTx - saldoAtual);
            const diffD = Math.abs(saldoAnterior - valorTx - saldoAtual);
            isCreditInferred = diffC <= 5 ? true : diffD <= 5 ? false : undefined;
          }
          add(dataContextual, descPura, penult[1] + (penult[2] ?? ''), isCreditInferred);
          saldoAnterior = saldoAtual;
        } else if (valoresLine.length >= 2) {
          const ult = valoresLine[valoresLine.length - 1];
          const penult = valoresLine[valoresLine.length - 2];
          const saldoAtual = parseMoeda(ult[1]);
          const valorNum = parseMoeda(penult[1]);
          let isCreditInferred: boolean | undefined;
          if (!(penult[2] ?? '').match(/[CD\+\-]/i) && saldoAnterior !== null) {
            const diffC = Math.abs(saldoAnterior + valorNum - saldoAtual);
            const diffD = Math.abs(saldoAnterior - valorNum - saldoAtual);
            if (diffC <= 5) isCreditInferred = true;
            else if (diffD <= 5) isCreditInferred = false;
          }
          add(dataContextual, descPura, penult[1] + (penult[2] ?? ''), isCreditInferred);
          saldoAnterior = saldoAtual;
        } else {
          const vMatch = valoresLine[0];
          add(dataContextual, descPura, vMatch[1] + (vMatch[2] ?? ''));
        }
        continue;
      }

      // Sem valor na linha: pode estar na próxima
      const proxLinha = i + 1 < linhas.length ? linhas[i + 1] : '';
      const mValorProximo = proxLinha.match(/^(?:R\$?\s*)?([+-]?\s*\d{1,3}(?:[.,]\d{3})*[.,]\d{2})\s*([CD]|\(\+\)|\(-\)|\+|-)?$/i);
      if (mValorProximo && descSemData.length > 0 && !/^saldo\s+/i.test(descSemData)) {
        const descPura = `${descAcumulada} ${descSemData}`.trim();
        add(dataContextual, descPura, mValorProximo[1] + (mValorProximo[2] ?? ''));
        descAcumulada = '';
        i++;
        continue;
      }

      if (descSemData.length === 0 || /total de/i.test(descSemData)) continue;
      descAcumulada = `${descAcumulada} ${descSemData}`.trim();

    } else if (dataContextual) {
      if (/^saldo\s+(do\s+dia|anterior|final|bloqueado|final do período|inicial)/i.test(linha) ||
          /rendimento líquido/i.test(linha)) {
        const mSaldo = linha.match(VALOR_RE);
        if (mSaldo) saldoAnterior = parseMoeda(mSaldo[1]);
        descAcumulada = '';
        continue;
      }

      if (CABECALHOS_IGNORE.test(linha)) continue;

      const valoresMatches = Array.from(linha.matchAll(new RegExp(VALORES_RE.source, 'ig')));
      if (valoresMatches.length > 0) {
        let targetMatch = valoresMatches[0];
        let isCreditInferred: boolean | undefined;

        if (valoresMatches.length >= 2) {
          const ult = valoresMatches[valoresMatches.length - 1];
          targetMatch = valoresMatches[valoresMatches.length - 2];
          const saldoAtual = parseMoeda(ult[1]);
          const valorNum = parseMoeda(targetMatch[1]);
          if (!(targetMatch[2] ?? '').match(/[CD\+\-]/i) && saldoAnterior !== null) {
            const diffC = Math.abs(saldoAnterior + valorNum - saldoAtual);
            const diffD = Math.abs(saldoAnterior - valorNum - saldoAtual);
            if (diffC <= 5) isCreditInferred = true;
            else if (diffD <= 5) isCreditInferred = false;
          }
          saldoAnterior = saldoAtual;
        }

        const descParts = linha.split(targetMatch[1]);
        let descPura = descParts[0].trim();
        descPura = `${descAcumulada} ${descPura}`.trim();
        descAcumulada = '';

        if (descPura.length > 0 && !/^\d+$/.test(descPura)) {
          add(dataContextual, descPura, targetMatch[1] + (targetMatch[2] ?? ''), isCreditInferred);
        }
      } else {
        descAcumulada = `${descAcumulada} ${linha}`.trim();
      }
    }
  }

  // Classificar cada transação bruta
  return todos.map(({ dataRaw, descricaoRaw, valor }) =>
    classificarTransacao(dataRaw, descricaoRaw, valor, ctx)
  );
}

// ═══════════════════════════════════════════════════════════════
// PÓS-PROCESSAMENTO
// ═══════════════════════════════════════════════════════════════

function deduplicar(transacoes: Transacao[]): Transacao[] {
  const vistas = new Set<string>();
  return transacoes.filter(tx => {
    const descCurta = tx.descricao.replace(/[^A-Z0-9]/ig, '').slice(0, 15).toUpperCase();
    const sig = `${tx.data}_${tx.valor}_${descCurta}`;
    if (vistas.has(sig)) return false;
    vistas.add(sig);
    return true;
  });
}

function detectarWashTrading(transacoes: Transacao[]): Transacao[] {
  const debitos = new Map<string, number>();
  for (const t of transacoes) {
    if (t.classificacao === 'debito') {
      const chave = `${t.data}|${Math.abs(t.valor)}`;
      debitos.set(chave, (debitos.get(chave) ?? 0) + 1);
    }
  }

  return transacoes.map(t => {
    if (t.classificacao !== 'credito_valido' && t.classificacao !== 'possivel_vinculo_familiar') return t;
    const chave = `${t.data}|${t.valor}`;
    if (debitos.has(chave)) {
      return {
        ...t,
        classificacao: 'possivel_vinculo_familiar' as ClassificacaoTransacao,
        motivoExclusao: 'Wash trading (in-and-out)',
        is_validated: false,
        custom_tag: 'washtrading',
      };
    }
    return t;
  });
}

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

  return {
    totalApurado,
    mediaMensal,
    divisao6Meses: Math.round(totalApurado / 6),
    divisao12Meses: Math.round(totalApurado / 12),
    totalPorMes,
    maiorMes: valores.length > 0 ? Math.max(...valores) : 0,
    menorMes: valores.length > 0 ? Math.min(...valores) : 0,
    mesesConsiderados,
  };
}

// ═══════════════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════════════

export interface ApuracaoInput {
  textoExtrato: string;
  nomeCliente: string;
  cpf?: string;
  hashPdf: string;
}

export function executarApuracao(input: ApuracaoInput): ApuracaoResult {
  const { textoExtrato, nomeCliente, cpf, hashPdf } = input;

  const ctx: ContextoNomes = { nomeCliente: nomeCliente.trim(), cpf: cpf?.trim() };

  // 1. Extração + classificação integradas
  let transacoes = extrair(textoExtrato, ctx);

  // 2. Deduplicação
  transacoes = deduplicar(transacoes);

  // 3. Wash trading
  transacoes = detectarWashTrading(transacoes);

  // 4. Métricas
  const metricas = calcularMetricas(transacoes);

  return {
    transacoes,
    ...metricas,
    versaoAlgoritmo: VERSAO_ALGORITMO,
    hashPdf,
    timestamp: new Date().toISOString(),
  };
}
