'use client';

/**
 * useIncomeAnalysisPersistence
 * Salva e restaura a sessão de Apuração de Renda no IndexedDB.
 * Interface compatível com o uso existente em dashboard e analysis pages.
 */

import { useState, useEffect, useCallback } from 'react';
import { type ApuracaoResult } from '@/types/transaction';

const DB_NAME = 'hokma_apuracao';
const STORE_NAME = 'income_session';
const RESULT_KEY = 'result';
const META_KEY = 'meta';

export interface ApuracaoMeta {
  nomeCliente: string;
  cpf: string;
}

// ── IndexedDB helpers ─────────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbGet<T>(db: IDBDatabase, key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

function dbSet(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

function dbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useIncomeAnalysisPersistence() {
  const [result, setResult] = useState<ApuracaoResult | null>(null);
  const [meta, setMeta] = useState<ApuracaoMeta>({ nomeCliente: '', cpf: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Inicializar DB e restaurar sessão
  useEffect(() => {
    let cancelled = false;

    openDB()
      .then(async (database) => {
        if (cancelled) return;
        setDb(database);

        const [storedResult, storedMeta] = await Promise.all([
          dbGet<ApuracaoResult>(database, RESULT_KEY),
          dbGet<ApuracaoMeta>(database, META_KEY),
        ]);

        if (!cancelled) {
          if (storedResult) setResult(storedResult);
          if (storedMeta) setMeta(storedMeta);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        // Fallback para sessionStorage se IndexedDB não disponível
        try {
          const stored = sessionStorage.getItem('@apuracao/result');
          if (stored) setResult(JSON.parse(stored));
          const storedMeta = sessionStorage.getItem('@apuracao/meta');
          if (storedMeta) setMeta(JSON.parse(storedMeta));
        } catch {
          // ignore
        }
        if (!cancelled) setIsLoaded(true);
      });

    return () => { cancelled = true; };
  }, []);

  const saveResult = useCallback(
    async (newResult: ApuracaoResult, newMeta?: ApuracaoMeta) => {
      setResult(newResult);
      if (newMeta) setMeta(newMeta);

      if (db) {
        await Promise.all([
          dbSet(db, RESULT_KEY, newResult),
          newMeta ? dbSet(db, META_KEY, newMeta) : Promise.resolve(),
        ]);
      } else {
        // Fallback sessionStorage
        sessionStorage.setItem('@apuracao/result', JSON.stringify(newResult));
        if (newMeta) sessionStorage.setItem('@apuracao/meta', JSON.stringify(newMeta));
      }
    },
    [db]
  );

  const clearResult = useCallback(async () => {
    setResult(null);
    setMeta({ nomeCliente: '', cpf: '' });

    if (db) {
      await Promise.all([
        dbDelete(db, RESULT_KEY),
        dbDelete(db, META_KEY),
      ]);
    } else {
      sessionStorage.removeItem('@apuracao/result');
      sessionStorage.removeItem('@apuracao/meta');
    }
  }, [db]);

  return { result, meta, saveResult, clearResult, isLoaded };
}
