'use client';

/**
 * useIncomeAnalysisPersistence
 * Salva em sessionStorage (síncrono — disponível imediatamente na navegação)
 * e também persiste em IndexedDB como backup.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { type ApuracaoResult } from '@/types/transaction';

// ── Chaves de storage ─────────────────────────────────────────
const SS_RESULT = '@apuracao/result';
const SS_META   = '@apuracao/meta';

const DB_NAME   = 'hokma_apuracao';
const DB_STORE  = 'session';
const DB_RESULT = 'result';
const DB_META   = 'meta';

export interface ApuracaoMeta {
  nomeCliente: string;
  cpf: string;
}

// ── IndexedDB helpers (best-effort, sem bloquear o fluxo) ─────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function idbSet(db: IDBDatabase, key: string, val: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, 'readwrite');
    const req = tx.objectStore(DB_STORE).put(val, key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

function idbGet<T>(db: IDBDatabase, key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

function idbDel(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(DB_STORE, 'readwrite');
    const req = tx.objectStore(DB_STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

// ── Hook ──────────────────────────────────────────────────────

export function useIncomeAnalysisPersistence() {
  const [result,   setResult]   = useState<ApuracaoResult | null>(null);
  const [meta,     setMeta]     = useState<ApuracaoMeta>({ nomeCliente: '', cpf: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const dbRef = useRef<IDBDatabase | null>(null);

  // ── Inicialização ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    // 1. sessionStorage (síncrono — carrega imediatamente)
    try {
      const sr = sessionStorage.getItem(SS_RESULT);
      const sm = sessionStorage.getItem(SS_META);
      if (sr && !cancelled) setResult(JSON.parse(sr));
      if (sm && !cancelled) setMeta(JSON.parse(sm));
    } catch { /* ignore */ }

    // Marca como carregado imediatamente após sessionStorage
    if (!cancelled) setIsLoaded(true);

    // 2. IndexedDB (assíncrono — atualiza se tiver dados mais recentes)
    openDB()
      .then(async (db) => {
        if (cancelled) return;
        dbRef.current = db;

        const idbResult = await idbGet<ApuracaoResult>(db, DB_RESULT).catch(() => null);
        const idbMeta   = await idbGet<ApuracaoMeta>(db, DB_META).catch(() => null);

        if (!cancelled && idbResult) setResult(idbResult);
        if (!cancelled && idbMeta)   setMeta(idbMeta);
      })
      .catch(() => { /* IndexedDB indisponível — sessionStorage suficiente */ });

    return () => { cancelled = true; };
  }, []);

  // ── Salvar ────────────────────────────────────────────────
  // Sempre síncrono via sessionStorage → sem race condition na navegação
  const saveResult = useCallback((newResult: ApuracaoResult, newMeta?: ApuracaoMeta) => {
    // Estado React
    setResult(newResult);
    if (newMeta) setMeta(newMeta);

    // sessionStorage — síncrono, disponível imediatamente
    try {
      sessionStorage.setItem(SS_RESULT, JSON.stringify(newResult));
      if (newMeta) sessionStorage.setItem(SS_META, JSON.stringify(newMeta));
    } catch { /* ignore quota errors */ }

    // IndexedDB — assíncrono, best-effort
    if (dbRef.current) {
      const db = dbRef.current;
      idbSet(db, DB_RESULT, newResult).catch(() => {});
      if (newMeta) idbSet(db, DB_META, newMeta).catch(() => {});
    }
  }, []);

  // ── Limpar ────────────────────────────────────────────────
  const clearResult = useCallback(() => {
    setResult(null);
    setMeta({ nomeCliente: '', cpf: '' });

    try {
      sessionStorage.removeItem(SS_RESULT);
      sessionStorage.removeItem(SS_META);
    } catch { /* ignore */ }

    if (dbRef.current) {
      const db = dbRef.current;
      idbDel(db, DB_RESULT).catch(() => {});
      idbDel(db, DB_META).catch(() => {});
    }
  }, []);

  return { result, meta, saveResult, clearResult, isLoaded };
}
