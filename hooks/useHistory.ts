'use client';

import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { type ApuracaoResult } from '@/types/transaction';

export interface HistoricoItem {
  id: string;
  nome_cliente: string;
  cpf: string;
  banco: string;
  periodo_inicio: string;
  periodo_fim: string;
  renda_total: number;
  total_transacoes: number;
  hash_pdf: string;
  resultado_json: ApuracaoResult;
  criado_em: string;
}

export function useHistory() {
  /**
   * Salva uma apuração no histórico do Supabase.
   */
  const salvarApuracao = useCallback(
    async (
      result: ApuracaoResult,
      meta: { nomeCliente: string; cpf: string }
    ): Promise<void> => {
      if (!isSupabaseConfigured || !supabase) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Determina período a partir das transações
      const datas = result.transacoes
        .map((t) => t.data)
        .filter(Boolean)
        .sort();
      const periodoInicio = datas[0] ?? '';
      const periodoFim = datas[datas.length - 1] ?? '';

      await supabase.from('historico_apuracoes').insert({
        user_id: user.id,
        nome_cliente: meta.nomeCliente,
        cpf: meta.cpf,
        banco: '',
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        renda_total: (result.mediaMensal ?? 0) / 100, // mediaMensal está em centavos
        total_transacoes: result.transacoes.length,
        hash_pdf: result.hashPdf ?? '',
        resultado_json: result,
      });
    },
    []
  );

  /**
   * Carrega todo o histórico do usuário logado.
   */
  const carregarHistorico = useCallback(async (): Promise<HistoricoItem[]> => {
    if (!isSupabaseConfigured || !supabase) return [];

    const { data, error } = await supabase
      .from('historico_apuracoes')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }

    return (data ?? []) as HistoricoItem[];
  }, []);

  /**
   * Exclui uma apuração do histórico.
   */
  const excluirApuracao = useCallback(async (id: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) return;
    await supabase.from('historico_apuracoes').delete().eq('id', id);
  }, []);

  return { salvarApuracao, carregarHistorico, excluirApuracao };
}
