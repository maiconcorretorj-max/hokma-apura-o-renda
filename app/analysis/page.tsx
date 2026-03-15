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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const totalTransacoesVisiveis = result.transacoes.filter(
    (t) => t.valor > 0 && t.classificacao !== 'ignorar_sem_keyword' && t.classificacao !== 'ignorar_estorno'
  ).length;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleVoltar} className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold truncate">
                  {meta.nomeCliente || 'Revisão de Apuração'}
                </h2>
                {meta.cpf && (
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {meta.cpf}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileCheck className="h-3 w-3 shrink-0" />
                <span className="truncate">SHA-256: {result.hashPdf?.substring(0, 16)}…</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              Motor v{result.versaoAlgoritmo}
            </span>
            <Button
              onClick={handleDownloadPdf}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button
              onClick={handleSaveReport}
              disabled={isSaving || !isSupabaseConfigured}
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto pt-8 px-4 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Síntese Financeira</h1>
            {meta.nomeCliente && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <User className="h-3.5 w-3.5" />
                {meta.nomeCliente}
                {meta.cpf && <span className="ml-1 text-muted-foreground/60">· {meta.cpf}</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{filters.metricas.mesesConsiderados || result.mesesConsiderados} {(filters.metricas.mesesConsiderados || result.mesesConsiderados) === 1 ? 'mês' : 'meses'} analisados</span>
            <span>·</span>
            <span>{totalTransacoesVisiveis} transações revisáveis</span>
          </div>
        </div>

        {/* Cards de métricas */}
        <IncomeSummary metricas={filters.metricas} />

        <Separator />

        {/* Detalhamento interativo */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Detalhamento de Transações</h2>
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
    </main>
  );
}
