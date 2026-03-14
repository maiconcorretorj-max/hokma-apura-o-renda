// OCR Web Worker Dedicado — Tesseract.js em thread separado
// Este worker roda em paralelo sem bloquear a UI

import { createWorker } from 'tesseract.js';

export interface OcrMessage {
  type: 'process' | 'cancel';
  pageNumber?: number;
  imageData?: ImageData;
  width?: number;
  height?: number;
}

export interface OcrResponse {
  type: 'progress' | 'result' | 'error';
  pageNumber?: number;
  text?: string;
  progress?: number;
  error?: string;
}

let currentWorker: Awaited<ReturnType<typeof createWorker>> | null = null;
let isCancelled = false;

self.onmessage = async (event: MessageEvent<OcrMessage>) => {
  const { type, pageNumber, imageData, width, height } = event.data;

  if (type === 'cancel') {
    isCancelled = true;
    if (currentWorker) {
      await currentWorker.terminate();
      currentWorker = null;
    }
    return;
  }

  if (type === 'process' && pageNumber !== undefined && imageData && width && height) {
    try {
      isCancelled = false;

      // Criar worker Tesseract
      if (!currentWorker) {
        currentWorker = await createWorker('por', 1, {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
              self.postMessage({
                type: 'progress',
                pageNumber,
                progress: m.progress,
              } as OcrResponse);
            }
          },
        });
      }

      if (isCancelled) {
        self.postMessage({
          type: 'error',
          pageNumber,
          error: 'Cancelado pelo usuário',
        } as OcrResponse);
        return;
      }

      // Reconhecer texto
      const { data } = await currentWorker.recognize(imageData);

      if (isCancelled) {
        self.postMessage({
          type: 'error',
          pageNumber,
          error: 'Cancelado pelo usuário',
        } as OcrResponse);
        return;
      }

      self.postMessage({
        type: 'result',
        pageNumber,
        text: data.text,
      } as OcrResponse);
    } catch (error) {
      self.postMessage({
        type: 'error',
        pageNumber,
        error: error instanceof Error ? error.message : 'Erro no OCR',
      } as OcrResponse);
    }
  }
};
