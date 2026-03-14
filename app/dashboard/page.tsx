'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, CreditCard, LogOut, Loader2 } from 'lucide-react';
import { UploadArea } from '@/components/UploadArea';
import { ProcessingModal } from '@/components/ProcessingModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { extrairTextoPdf } from '@/lib/pdfExtractor';
import { executarOcr } from '@/lib/ocrWorker';
import { hashPdf } from '@/lib/hashPdf';
import { useIncomeAnalysisPersistence } from '@/hooks/useIncomeAnalysisPersistence';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [cpf, setCpf] = useState('');
  const { saveResult } = useIncomeAnalysisPersistence();
  const router = useRouter();

  const [progressState, setProgressState] = useState({
    percentual: 0,
    fase: '',
    paginaAtual: 0,
    totalPaginas: 0,
  });

  const handleProcess = async (file: File) => {
    if (!nomeCliente.trim()) {
      toast.error('Informe o nome do cliente antes de processar.');
      return;
    }

    setIsProcessing(true);
    setProgressState({ percentual: 0, fase: 'Iniciando...', paginaAtual: 0, totalPaginas: 0 });

    try {
      // 1. Hash SHA-256
      setProgressState({ percentual: 5, fase: 'Gerando hash SHA-256...', paginaAtual: 0, totalPaginas: 0 });
      const fileBuffer = await file.slice().arrayBuffer();
      const hash = await hashPdf(fileBuffer);

      // 2. Extração via PDF.js por coordenadas Y/X
      setProgressState({ percentual: 10, fase: 'Extraindo texto do PDF...', paginaAtual: 0, totalPaginas: 0 });
      let texto = await extrairTextoPdf(file);

      // 3. Fallback OCR para PDFs escaneados
      if (!texto || texto.trim().length < 50) {
        toast.info('PDF escaneado detectado. Iniciando OCR — isso pode levar alguns minutos...');
        texto = await executarOcr(file, (progresso) => {
          setProgressState({
            percentual: progresso.percentual,
            fase: progresso.fase,
            paginaAtual: progresso.paginaAtual || 0,
            totalPaginas: progresso.total,
          });
        });

        // Log para debug (remover depois)
        console.log('📝 Texto extraído pelo OCR (primeiros 2000 caracteres):');
        console.log(texto.substring(0, 2000));
        console.log(`📏 Total de caracteres: ${texto.length}`);
      }

      if (!texto || texto.trim().length < 50) {
        throw new Error('Não foi possível extrair texto legível deste arquivo.');
      }

      // 4. Motor de apuração
      setProgressState({ percentual: 90, fase: 'Processando motor de apuração...', paginaAtual: 0, totalPaginas: 0 });
      const response = await fetch('/api/apuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textoExtrato: texto,
          nomeCliente: nomeCliente.trim(),
          cpf: cpf.trim(),
          hashPdf: hash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro no processamento do extrato');
      }

      const result = await response.json();

      setProgressState({ percentual: 100, fase: 'Finalizado!', paginaAtual: 0, totalPaginas: 0 });

      if (result.transacoes.length === 0) {
        toast.warning('Nenhuma transação financeira reconhecida no documento.');
      } else {
        toast.success(`Extrato processado! ${result.transacoes.length} transações encontradas.`);
      }

      saveResult(result, { nomeCliente: nomeCliente.trim(), cpf: cpf.trim() });
      router.push('/analysis');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Falha ao processar arquivo.');
    } finally {
      setIsProcessing(false);
      setProgressState({ percentual: 0, fase: '', paginaAtual: 0, totalPaginas: 0 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-screen-xl flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span className="font-bold text-sm">HOKMA</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[180px]">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <main className="container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 text-xs font-medium text-primary">
            Motor v3.0.0 · Zero IA · 100% Determinístico
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Nova <span className="gradient-text">Apuração de Renda</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Informe os dados do cliente, faça upload do extrato bancário e obtenha a análise em segundos.
          </p>
        </div>

        {/* Formulário de identificação do cliente */}
        <div className="w-full max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Identificação do Cliente
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-1.5 text-foreground/80">
                <User className="h-3.5 w-3.5" />
                Nome completo <span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Ex: João da Silva Santos"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                disabled={isProcessing}
                className="bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                Usado para detectar autotransferências no extrato.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf" className="flex items-center gap-1.5 text-foreground/80">
                <CreditCard className="h-3.5 w-3.5" />
                CPF <span className="text-muted-foreground text-xs font-normal ml-1">(opcional)</span>
              </Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                disabled={isProcessing}
                className="bg-background"
              />
              <p className="text-[11px] text-muted-foreground">
                Melhora a precisão na detecção de autotransferências.
              </p>
            </div>
          </div>
        </div>

        {/* Modal de progresso */}
        <ProcessingModal
          isOpen={isProcessing}
          fase={progressState.fase}
          percentual={progressState.percentual}
          paginaAtual={progressState.paginaAtual}
          totalPaginas={progressState.totalPaginas}
        />

        {/* Área de upload */}
        <UploadArea onProcess={handleProcess} isProcessing={isProcessing} />
      </main>
    </div>
  );
}
