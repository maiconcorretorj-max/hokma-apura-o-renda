'use client';

// OCR via Tesseract.js com Web Workers paralelos
// Usado quando pdfjs retorna texto vazio (PDF escaneado)

const MAX_WORKERS = 4;

export async function executarOcr(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;

  const { createWorker } = await import('tesseract.js');

  // Renderizar página como canvas e extrair texto
  async function processarPagina(pageNum: number): Promise<string> {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const worker = await createWorker('por');
    const { data } = await worker.recognize(canvas);
    await worker.terminate();

    return data.text;
  }

  // Processar em lotes de MAX_WORKERS paralelos
  const resultados: string[] = new Array(numPages).fill('');
  for (let i = 0; i < numPages; i += MAX_WORKERS) {
    const lote = [];
    for (let j = i; j < Math.min(i + MAX_WORKERS, numPages); j++) {
      lote.push({ idx: j, promise: processarPagina(j + 1) });
    }
    const textos = await Promise.all(lote.map((l) => l.promise));
    for (let k = 0; k < lote.length; k++) {
      resultados[lote[k].idx] = textos[k];
    }
  }

  return resultados.join('\n');
}
