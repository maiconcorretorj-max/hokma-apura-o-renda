'use client';

// OCR otimizado com Tesseract.js
// Workers internos do Tesseract rodam em threads separados

// Detecta número de núcleos da CPU (mínimo 2, máximo 8)
const MAX_WORKERS = typeof navigator !== 'undefined'
  ? Math.min(Math.max(navigator.hardwareConcurrency || 2, 2), 8)
  : 4;

export interface OcrProgressCallback {
  (progresso: {
    atual: number;
    total: number;
    percentual: number;
    fase: string;
    paginaAtual?: number;
  }): void;
}

export async function executarOcr(
  file: File,
  onProgress?: OcrProgressCallback
): Promise<string> {
  onProgress?.({ atual: 0, total: 100, percentual: 0, fase: 'Carregando PDF...', paginaAtual: 0 });

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  onProgress?.({
    atual: 0,
    total: numPages,
    percentual: 5,
    fase: `Preparando ${numPages} página(s) para OCR...`,
    paginaAtual: 0,
  });

  // Criar workers Tesseract (já rodam em threads separados internamente)
  const { createWorker } = await import('tesseract.js');
  const numWorkers = Math.min(MAX_WORKERS, numPages);

  onProgress?.({
    atual: 0,
    total: numPages,
    percentual: 8,
    fase: `Inicializando ${numWorkers} worker(s) Tesseract...`,
    paginaAtual: 0,
  });

  // Criar workers com OEM 1 (LSTM only) - mais rápido que OEM 3 (default)
  const workers = await Promise.all(
    Array.from({ length: numWorkers }, async () => {
      const worker = await createWorker('por', 1); // 1 = LSTM_ONLY (mais rápido)
      return worker;
    })
  );

  const resultados: string[] = new Array(numPages).fill('');
  let paginasProcessadas = 0;

  // Processar uma página com escala 2.5x (alta qualidade para melhor acurácia OCR)
  const processarPagina = async (pageNum: number, workerIndex: number) => {
    const page = await pdf.getPage(pageNum);
    // 2.5x: necessário para máxima legibilidade de extratos pequenos
    const viewport = page.getViewport({ scale: 2.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const worker = workers[workerIndex];
    const { data } = await worker.recognize(canvas);

    paginasProcessadas++;
    const percentual = 10 + Math.round((paginasProcessadas / numPages) * 88);

    onProgress?.({
      atual: paginasProcessadas,
      total: numPages,
      percentual,
      fase: `OCR: ${paginasProcessadas}/${numPages} páginas`,
      paginaAtual: pageNum,
    });

    return { pageNum, text: data.text };
  };

  // Processar em batches para evitar sobrecarga de memória em documentos grandes
  const BATCH_SIZE = numWorkers * 2; // Processar 2x workers em paralelo por rodada
  const results: { pageNum: number; text: string }[] = [];

  for (let i = 0; i < numPages; i += BATCH_SIZE) {
    const batch = Array.from(
      { length: Math.min(BATCH_SIZE, numPages - i) },
      (_, j) => processarPagina(i + j + 1, (i + j) % workers.length)
    );
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }

  // Ordenar resultados por número de página
  results.forEach(({ pageNum, text }) => {
    resultados[pageNum - 1] = text;
  });

  // Limpar workers
  await Promise.all(workers.map((w) => w.terminate()));

  onProgress?.({
    atual: numPages,
    total: numPages,
    percentual: 100,
    fase: 'OCR concluído!',
    paginaAtual: numPages,
  });

  return resultados.join('\n\n');
}
