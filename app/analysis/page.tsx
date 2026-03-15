'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, FileCheck, Loader2, User, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { useIncomeAnalysisPersistence } from '@/hooks/useIncomeAnalysisPersistence';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { IncomeSummary } from '@/components/IncomeSummary';
import { FiltersPanel } from '@/components/FiltersPanel';
import { TransactionAccordion } from '@/components/TransactionAccordion';
import { supabase, isSupabaseConfigured, getCurrentUserId } from '@/lib/supabaseClient';
import { gerarPdfApuracao } from '@/lib/pdfExporter';
import { exportarParaCSV } from '@/lib/csvExporter';
import { Section } from '@/components/ui/section';

export default function AnalysisPage() {
  const router = useRouter();
  const { result, meta, isLoaded, clearResult } = useIncomeAnalysisPersistence();
  const [isSaving, setIsSaving] = useState(false);

  // Redirecionar se não houver resultado na sessão
  useEffect(() => {
    if (isLoaded && !result) {
      router.replace('/');
    }
  }, [isLoaded, result, router]);

  const filters = useTransactionFilters(result?.transacoes || []);

  if (!isLoaded || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const handleSaveReport = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase não configurado. Verifique as variáveis de ambiente.');
      return;
    }

    setIsSaving(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const { error } = await supabase.from('income_reports').insert({
        user_id: userId,
        cliente_nome: meta.nomeCliente || 'DESCONHECIDO',
        cpf: meta.cpf || null,
        pdf_hash: result.hashPdf,
        total_apurado: filters.metricas.totalApurado,
        media_mensal: filters.metricas.mediaMensal,
        divisao_6: filters.metricas.divisao6Meses,
        divisao_12: filters.metricas.divisao12Meses,
        maior_mes: filters.metricas.maiorMes,
        menor_mes: filters.metricas.menorMes,
        meses_considerados: filters.metricas.mesesConsiderados || result.mesesConsiderados,
        transacoes_json: filters.transactions,
        versao_algoritmo: result.versaoAlgoritmo,
        timestamp_processamento: result.timestamp,
      });

      if (error) throw error;
      toast.success('Relatório salvo com sucesso no banco de dados!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar relatório. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoltar = () => {
    clearResult();
    router.push('/dashboard');
  };

  const handleDownloadPdf = () => {
    if (!result || !meta.nomeCliente) {
      toast.error('Dados insuficientes para gerar o PDF.');
      return;
    }

    try {
      gerarPdfApuracao(result, {
        nomeCliente: meta.nomeCliente,
        cpf: meta.cpf,
      });
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    }
  };
  
  const handleDownloadCsv = () => {
    if (!result || !meta.nomeCliente) {
      toast.error('Dados insuficientes para gerar o CSV.');
      return;
    }

    try {
      exportarParaCSV(result, meta.nomeCliente);
      toast.success('CSV gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      toast.error('Erro ao gerar CSV. Tente novamente.');
    }
  };

  const totalTransacoesVisiveis = result.transacoes.filter(
    (t) => t.valor > 0 && t.classificacao !== 'ignorar_sem_keyword' && t.classificacao !== 'ignorar_estorno'
  ).length;

  return (
    <main className="min-h-screen bg-background pb-20 selection:bg-brand/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm animate-appear">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleVoltar} className="shrink-0 hover:bg-muted/50 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight truncate text-foreground">
                  {meta.nomeCliente || 'Revisão de Apuração'}
                </h2>
                {meta.cpf && (
                  <Badge variant="outline" className="text-[10px] shrink-0 border-border/50 bg-secondary/30">
                    {meta.cpf}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-0.5">
                <FileCheck className="h-3 w-3 shrink-0 text-brand" />
                <span className="truncate">SHA-256: {result.hashPdf?.substring(0, 16)}…</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-semibold tracking-wider text-muted-foreground bg-muted/30 border border-border/40 px-2 py-1 rounded-md">
              v{result.versaoAlgoritmo}
            </span>
            <Button
              onClick={handleDownloadPdf}
              variant="outline"
              size="sm"
              className="border-border/60 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={handleDownloadCsv}
              variant="outline"
              size="sm"
              className="border-border/60 shadow-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button
              onClick={handleSaveReport}
              disabled={isSaving || !isSupabaseConfigured}
              size="sm"
              className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-brand/20 shadow-md transition-all"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Matriz
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto pt-10 px-6 space-y-10 animate-appear delay-100">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Síntese Financeira</h1>
            {meta.nomeCliente && (
              <p className="text-[15px] font-medium text-muted-foreground flex items-center gap-2 mt-2">
                <User className="h-4 w-4 text-brand" />
                {meta.nomeCliente}
                {meta.cpf && <span className="text-muted-foreground/50">— {meta.cpf}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold tracking-wide text-muted-foreground bg-secondary/30 border border-border/50 px-4 py-2 rounded-xl">
            <span className="text-foreground">{filters.metricas.mesesConsiderados || result.mesesConsiderados}</span>
            <span>{(filters.metricas.mesesConsiderados || result.mesesConsiderados) === 1 ? 'mês' : 'meses'}</span>
            <span className="text-border/80 text-lg mx-1">&middot;</span>
            <span className="text-foreground">{totalTransacoesVisiveis}</span>
            <span>transações revisáveis</span>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="bg-card/30 rounded-3xl p-2 sm:p-4 border border-border/40 shadow-sm">
          <IncomeSummary metricas={filters.metricas} />
        </div>

        <Separator className="bg-border/60" />

        {/* Detalhamento interativo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Detalhamento Interativo</h2>
          </div>
          
          <div className="bg-card shadow-sm border border-border/60 rounded-2xl overflow-hidden p-6 gap-6 flex flex-col">
            <FiltersPanel
              keywordInput={filters.keywordInput}
              setKeywordInput={filters.setKeywordInput}
              exclusionKeywords={filters.exclusionKeywords}
              addKeyword={filters.addKeyword}
              removeKeyword={filters.removeKeyword}
            />
            <TransactionAccordion
              transactions={filters.transactions}
              onToggle={filters.toggleTransaction}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
