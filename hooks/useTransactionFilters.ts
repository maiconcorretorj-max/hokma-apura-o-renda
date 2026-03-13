'use client';

import { useState, useMemo } from 'react';
import { type Transacao } from '@/types/transaction';

export function useTransactionFilters(initialTransactions: Transacao[]) {
  const [userOverrides, setUserOverrides] = useState<Record<string, boolean>>({});
  const [exclusionKeywords, setExclusionKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = (keyword: string) => {
    const upper = keyword.trim().toUpperCase();
    if (upper && !exclusionKeywords.includes(upper)) {
      setExclusionKeywords((prev) => [...prev, upper]);
    }
    setKeywordInput('');
  };

  const removeKeyword = (keyword: string) => {
    setExclusionKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const toggleTransaction = (id: string, currentState: boolean) => {
    setUserOverrides((prev) => ({
      ...prev,
      [id]: !currentState,
    }));
  };

  const filteredTransactions = useMemo(() => {
    return initialTransactions.map((tx) => {
      // Começamos com is_validated base
      let is_active = tx.is_validated;
      let excludedByKeyword = false;

      // Aplicar exclusões por keyword
      if (exclusionKeywords.length > 0) {
        const descUpper = tx.descricao.toUpperCase();
        if (exclusionKeywords.some((kw) => descUpper.includes(kw))) {
          is_active = false;
          excludedByKeyword = true;
        }
      }

      // Overrides do usuário sempre têm prioridade máxima
      if (userOverrides[tx.id] !== undefined) {
        is_active = userOverrides[tx.id];
        // Se o usuário ligou manualmente, não importa a keyword
        if (is_active) excludedByKeyword = false; 
      }

      return {
        ...tx,
        is_validated: is_active,
        _excludedByKeyword: excludedByKeyword, // flag interna para a UI
      };
    });
  }, [initialTransactions, userOverrides, exclusionKeywords]);

  const activeTransactions = useMemo(() => {
    return filteredTransactions.filter((tx) => tx.is_validated);
  }, [filteredTransactions]);

  const metricasRecalculadas = useMemo(() => {
    const totalPorMes: Record<string, number> = {};
    
    for (const tx of activeTransactions) {
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
      maiorMes: valores.length > 0 ? Math.max(...valores) : 0,
      menorMes: valores.length > 0 ? Math.min(...valores) : 0,
    };
  }, [activeTransactions]);

  return {
    transactions: filteredTransactions,
    userOverrides,
    exclusionKeywords,
    keywordInput,
    setKeywordInput,
    addKeyword,
    removeKeyword,
    toggleTransaction,
    metricas: metricasRecalculadas,
  };
}
