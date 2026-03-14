'use client';

// Gerador de PDF profissional para relatórios de apuração de renda
// Formato baseado no template "Apuração de Renda - Kaizen Axis"

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ApuracaoResult } from '@/types/transaction';

interface ExportOptions {
  nomeCliente: string;
  cpf?: string;
  incluirTransacoesExcluidas?: boolean;
}

export function gerarPdfApuracao(
  resultado: ApuracaoResult,
  opcoes: ExportOptions
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 20;

  // ═══════════════════════════════════════════════════════════════
  // CABEÇALHO
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Apuração de Renda - Kaizen Axis', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Informações do cliente
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nome Titular: ${opcoes.nomeCliente}`, 14, currentY);
  currentY += 6;

  if (opcoes.cpf) {
    doc.text(`Documento (CPF): ${opcoes.cpf}`, 14, currentY);
    currentY += 6;
  }

  const dataGeracao = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  doc.text(`Gerado em: ${dataGeracao}`, 14, currentY);
  currentY += 6;

  doc.text(`Versão Algoritmo: ${resultado.versaoAlgoritmo}`, 14, currentY);
  currentY += 12;

  // ═══════════════════════════════════════════════════════════════
  // RESUMO
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('RESUMO (APÓS REVISÃO MANUAL)', 14, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const formatarValor = (cents: number) =>
    `R$ ${(cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const resumoData = [
    ['Total Apurado:', formatarValor(resultado.totalApurado)],
    ['Renda Média Mensal:', formatarValor(resultado.mediaMensal)],
    ['Divisão por 6:', formatarValor(resultado.divisao6Meses)],
    ['Divisão por 12:', formatarValor(resultado.divisao12Meses)],
    ['Meses Considerados:', String(resultado.mesesConsiderados)],
  ];

  resumoData.forEach(([label, value]) => {
    doc.text(label, 14, currentY);
    doc.text(value, 80, currentY);
    currentY += 6;
  });

  currentY += 10;

  // ═══════════════════════════════════════════════════════════════
  // DETALHAMENTO MENSAL
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DETALHAMENTO MENSAL', 14, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Agrupar transações válidas por mês
  const transacoesValidas = resultado.transacoes.filter(
    (t) => t.is_validated && t.valor > 0 && t.mesAno
  );

  const totalPorMes: Record<string, number> = {};
  transacoesValidas.forEach((t) => {
    const mesAno = t.mesAno!;
    if (!totalPorMes[mesAno]) totalPorMes[mesAno] = 0;
    totalPorMes[mesAno] += t.valor;
  });

  const mesesOrdenados = Object.keys(totalPorMes).sort();

  mesesOrdenados.forEach((mesAno) => {
    const pontos = '.'.repeat(40);
    doc.text(`${mesAno} ${pontos} ${formatarValor(totalPorMes[mesAno])}`, 14, currentY);
    currentY += 6;
  });

  currentY += 6;
  const timestamp = new Date(resultado.timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Timestamp: ${timestamp}`, 14, currentY);
  doc.setTextColor(0);
  currentY += 12;

  // ═══════════════════════════════════════════════════════════════
  // ENTRADAS CONSIDERADAS
  // ═══════════════════════════════════════════════════════════════
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Entradas consideradas nos respectivos meses:', 14, currentY);
  currentY += 8;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);

  // Agrupar transações por mês
  const transacoesPorMes: Record<string, typeof transacoesValidas> = {};
  transacoesValidas.forEach((t) => {
    const mesAno = t.mesAno!;
    if (!transacoesPorMes[mesAno]) transacoesPorMes[mesAno] = [];
    transacoesPorMes[mesAno].push(t);
  });

  mesesOrdenados.forEach((mesAno) => {
    // Nova página se necessário
    if (currentY > 270) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(mesAno, 14, currentY);
    currentY += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);

    const txs = transacoesPorMes[mesAno];
    txs.forEach((tx) => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }

      const linha = `- ${tx.data} | ${formatarValor(tx.valor)} | ${tx.descricao.slice(0, 80)}`;
      const linhas = doc.splitTextToSize(linha, pageWidth - 28);
      linhas.forEach((l: string) => {
        doc.text(l, 14, currentY);
        currentY += 4;
      });
    });

    currentY += 4;
  });

  // ═══════════════════════════════════════════════════════════════
  // RODAPÉ
  // ═══════════════════════════════════════════════════════════════
  const pageCount = doc.getNumberOfPages();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Gerado por HOKMA - Sistema de Apuração de Renda | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════════════════════════════
  const nomeArquivo = `apuracao_renda_${Date.now()}.pdf`;
  doc.save(nomeArquivo);
}
