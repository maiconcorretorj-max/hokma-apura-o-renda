'use client';

import { useState, useEffect } from 'react';
import { type ApuracaoResult } from '@/types/transaction';

const STORAGE_KEY = '@apuracao/result';
const META_KEY = '@apuracao/meta';

export interface ApuracaoMeta {
  nomeCliente: string;
  cpf: string;
}

export function useIncomeAnalysisPersistence() {
  const [result, setResult] = useState<ApuracaoResult | null>(null);
  const [meta, setMeta] = useState<ApuracaoMeta>({ nomeCliente: '', cpf: '' });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse stored result', err);
      }
    }
    const storedMeta = sessionStorage.getItem(META_KEY);
    if (storedMeta) {
      try {
        setMeta(JSON.parse(storedMeta));
      } catch {
        // ignore parse error
      }
    }
    setIsLoaded(true);
  }, []);

  const saveResult = (newResult: ApuracaoResult, newMeta?: ApuracaoMeta) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newResult));
    setResult(newResult);
    if (newMeta) {
      sessionStorage.setItem(META_KEY, JSON.stringify(newMeta));
      setMeta(newMeta);
    }
  };

  const clearResult = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(META_KEY);
    setResult(null);
    setMeta({ nomeCliente: '', cpf: '' });
  };

  return { result, meta, saveResult, clearResult, isLoaded };
}
