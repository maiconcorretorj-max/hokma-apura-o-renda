'use client';

// OCR otimizado com Tesseract.js
// Workers internos do Tesseract rodam em threads separados

// Detecta número de núcleos da CPU (mínimo 2, máximo 6)
const MAX_WORKERS = typeof navigator !== 'undefined'
  ? Math.min(Math.max(navigator.hardwareConcurrency || 2, 2), 6)
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
    percentual: 10,
    fase: `Inicializando ${numWorkers} worker(s) Tesseract...`,
    paginaAtual: 0,
  });

  const workers = await Promise.all(
    Array.from({ length: numWorkers }, async () => {
      const worker = await createWorker('por', 1);
      return worker;
    })
  );

  const resultados: string[] = new Array(numPages).fill('');
  let paginasProcessadas = 0;

  // Processar uma página
  const processarPagina = async (pageNum: number, workerIndex: number) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const worker = workers[workerIndex];
    const { data } = await worker.recognize(canvas);

    paginasProcessadas++;
    const percentual = 10 + Math.round((paginasProcessadas / numPages) * 90);

    onProgress?.({
      atual: paginasProcessadas,
      total: numPages,
      percentual,
      fase: `Processando OCR: ${paginasProcessadas}/${numPages}`,
      paginaAtual: pageNum,
    });

    return { pageNum, text: data.text };
  };

  // Distribuir páginas entre workers (processamento paralelo)
  const promises: Promise<{ pageNum: number; text: string }>[] = [];
  for (let i = 0; i < numPages; i++) {
    const workerIndex = i % workers.length;
    promises.push(processarPagina(i + 1, workerIndex));
  }

  const results = await Promise.all(promises);

  // Ordenar resultados
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
