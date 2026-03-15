import { ApuracaoResult, Transacao } from '../types/transaction';

/**
 * Utilitário para exportar os resultados da apuração para CSV.
 */
export const exportarParaCSV = (resultado: ApuracaoResult, clienteNome: string) => {
  if (!resultado || !resultado.transacoes) return;

  // Cabeçalho do CSV
  const header = [
    'Data',
    'Descricao',
    'Valor (R$)',
    'Classificacao',
    'Mes/Ano',
    'Validado',
    'Motivo Exclusao'
  ];

  // Mapear transações para linhas
  const rows = resultado.transacoes.map((t: Transacao) => {
    return [
      t.data,
      `"${t.descricao.replace(/"/g, '""')}"`, // Escapar aspas
      (t.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      t.classificacao,
      t.mesAno || '',
      t.is_validated ? 'SIM' : 'NAO',
      t.motivoExclusao || ''
    ].join(';');
  });

  // Metadados da Apuração (opcional, pode ser adicionado ao final ou em arquivo separado)
  const resumo = [
    '',
    `RESUMO DA APURACAO - ${clienteNome}`,
    `Total Apurado:;${(resultado.totalApurado / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    `Media Mensal:;${(resultado.mediaMensal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    `Divisao 6 meses:;${(resultado.divisao6Meses / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    `Divisao 12 meses:;${(resultado.divisao12Meses / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    `Algoritmo:;${resultado.versaoAlgoritmo}`,
    `Data do Relatorio:;${new Date().toLocaleString('pt-BR')}`
  ].join('\n');

  const csvContent = [header.join(';'), ...rows, resumo].join('\n');

  // Adicionar BOM para Excel reconhecer caracteres PT-BR (acentuação)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Apuracao_${clienteNome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
