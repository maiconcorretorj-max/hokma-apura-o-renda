'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  History,
  Trash2,
  ExternalLink,
  Search,
  TrendingUp,
  FileText,
  Calendar,
  User,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useHistory, type HistoricoItem } from '@/hooks/useHistory';
import { useAuth } from '@/hooks/useAuth';
import { useIncomeAnalysisPersistence } from '@/hooks/useIncomeAnalysisPersistence';
import { toast } from 'sonner';

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarData(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HistoricoPage() {
  useAuth(true);
  const { carregarHistorico, excluirApuracao } = useHistory();
  const { saveResult } = useIncomeAnalysisPersistence();
  const router = useRouter();

  const [itens, setItens] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarHistorico()
      .then(setItens)
      .finally(() => setLoading(false));
  }, [carregarHistorico]);

  const itensFiltrados = itens.filter((item) =>
    item.nome_cliente.toLowerCase().includes(busca.toLowerCase()) ||
    item.cpf.includes(busca) ||
    item.banco.toLowerCase().includes(busca.toLowerCase())
  );

  const handleExcluir = async (id: string) => {
    setExcluindo(id);
    try {
      await excluirApuracao(id);
      setItens((prev) => prev.filter((i) => i.id !== id));
      toast.success('Apuração excluída do histórico.');
    } catch {
      toast.error('Erro ao excluir apuração.');
    } finally {
      setExcluindo(null);
    }
  };

  const handleVerDetalhes = (item: HistoricoItem) => {
    saveResult(item.resultado_json, {
      nomeCliente: item.nome_cliente,
      cpf: item.cpf,
    });
    router.push('/analysis');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <History className="h-4 w-4 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {itens.length} apuração{itens.length !== 1 ? 'ões' : ''} registrada{itens.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Busca */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, banco..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Vazio */}
        {!loading && itensFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Inbox className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">
              {busca ? 'Nenhum resultado encontrado' : 'Nenhuma apuração realizada ainda'}
            </p>
            <p className="text-sm text-muted-foreground">
              {busca
                ? 'Tente outros termos de busca.'
                : 'Suas apurações aparecerão aqui após o processamento.'}
            </p>
          </div>
        )}

        {/* Lista */}
        {!loading && itensFiltrados.length > 0 && (
          <div className="space-y-3">
            {itensFiltrados.map((item) => (
              <div
                key={item.id}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Info principal */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">
                        {item.nome_cliente}
                      </span>
                      {item.banco && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {item.banco}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      {item.cpf && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 shrink-0" />
                          <span>{item.cpf}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3 shrink-0 text-primary" />
                        <span className="font-semibold text-foreground">
                          {formatarMoeda(item.renda_total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span>{item.total_transacoes} transações</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{formatarData(item.criado_em)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1.5"
                      onClick={() => handleVerDetalhes(item)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver detalhes
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleExcluir(item.id)}
                      disabled={excluindo === item.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
