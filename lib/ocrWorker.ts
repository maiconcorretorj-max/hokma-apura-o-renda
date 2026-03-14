'use client';

// OCR com Web Workers DEDICADOS em threads separados
// Processamento 100% paralelo sem travar a UI

// Detecta número de núcleos da CPU (mínimo 4, máximo 8)
const MAX_WORKERS = typeof navigator !== 'undefined'
  ? Math.min(Math.max(navigator.hardwareConcurrency || 4, 4), 8)
  : 6;

export interface OcrProgressCallback {
  (progresso: {
    atual: number;
    total: number;
    percentual: number;
    fase: string;
    paginaAtual?: number;
  }): void;
}

// Wrapper para Worker dedicado
class TesseractWorker {
  private worker: Worker;
  private ready = false;
  private messageQueue: Array<(value: any) => void> = [];

  constructor() {
    this.worker = new Worker('/tesseract.worker.js');
    this.worker.onmessage = (e) => {
      const resolver = this.messageQueue.shift();
      if (resolver) resolver(e.data);
    };
  }

  async init(): Promise<void> {
    this.worker.postMessage({ type: 'init' });
    const response = await this.waitForMessage();
    if (response.type === 'ready') {
      this.ready = true;
    }
  }

  async recognize(imageData: ImageData, pageNum: number): Promise<string> {
    if (!this.ready) throw new Error('Worker não inicializado');

    this.worker.postMessage({ type: 'recognize', imageData, pageNum });
    const response = await this.waitForMessage();

    if (response.type === 'result') {
      return response.text;
    }
    throw new Error(response.error || 'Erro no OCR');
  }

  async terminate(): Promise<void> {
    this.worker.postMessage({ type: 'terminate' });
    await this.waitForMessage();
    this.worker.terminate();
  }

  private waitForMessage(): Promise<any> {
    return new Promise((resolve) => {
      this.messageQueue.push(resolve);
    });
  }
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
    fase: `Renderizando ${numPages} página(s)...`,
    paginaAtual: 0,
  });

  // Renderizar todas as páginas primeiro (rápido)
  const canvases: Array<{ pageNum: number; imageData: ImageData }> = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;
    canvases.push({
      pageNum: i,
      imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
    });

    onProgress?.({
      atual: i,
      total: numPages,
      percentual: 5 + Math.round((i / numPages) * 10),
      fase: `Renderizando página ${i}/${numPages}...`,
      paginaAtual: i,
    });
  }

  onProgress?.({
    atual: 0,
    total: numPages,
    percentual: 15,
    fase: 'Iniciando Web Workers dedicados...',
    paginaAtual: 0,
  });

  // Criar workers dedicados
  const numWorkers = Math.min(MAX_WORKERS, numPages);
  const workers: TesseractWorker[] = [];
  for (let i = 0; i < numWorkers; i++) {
    const w = new TesseractWorker();
    await w.init();
    workers.push(w);
  }

  const resultados: string[] = new Array(numPages).fill('');
  let paginasProcessadas = 0;

  // Processar em paralelo com workers dedicados
  const processarPagina = async (
    { pageNum, imageData }: { pageNum: number; imageData: ImageData },
    workerIndex: number
  ) => {
    const worker = workers[workerIndex];
    const text = await worker.recognize(imageData, pageNum);

    paginasProcessadas++;
    const percentual = 15 + Math.round((paginasProcessadas / numPages) * 85);

    onProgress?.({
      atual: paginasProcessadas,
      total: numPages,
      percentual,
      fase: `OCR: ${paginasProcessadas}/${numPages}`,
      paginaAtual: pageNum,
    });

    return { pageNum, text };
  };

  // Distribuir páginas entre workers
  const promises: Promise<{ pageNum: number; text: string }>[] = [];
  canvases.forEach((canvas, index) => {
    const workerIndex = index % workers.length;
    promises.push(processarPagina(canvas, workerIndex));
  });

  const results = await Promise.all(promises);

  // Ordenar por número de página
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
