'use client';

// Extração de texto de PDF usando pdfjs com coordenadas Y/X
// Preserva a ordem de leitura de tabelas bancárias

export async function extrairTextoPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  
  // Worker via CDN para evitar problemas de bundle
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const paginasTexto: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const Y_TOLERANCE = 5;
    const linesMap = new Map<number, Array<{ x: number; text: string }>>();

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const str = item.str.trim();
      if (!str) continue;

      // transform = [scaleX, skewX, skewY, scaleY, X, Y]
      const x = item.transform[4];
      const y = item.transform[5];

      // Agrupar por Y com tolerância
      let foundY: number | null = null;
      for (const [existingY] of linesMap) {
        if (Math.abs(existingY - y) <= Y_TOLERANCE) {
          foundY = existingY;
          break;
        }
      }

      const key = foundY ?? y;
      if (!linesMap.has(key)) {
        linesMap.set(key, []);
      }
      linesMap.get(key)!.push({ x, text: str });
    }

    // Ordenar: Y decrescente (PDFs têm origem inferior esquerdo)
    const sortedYs = Array.from(linesMap.keys()).sort((a, b) => b - a);

    const linhas = sortedYs.map((y) => {
      const items = linesMap.get(y)!;
      // Ordenar X crescente (esq → dir)
      items.sort((a, b) => a.x - b.x);
      return items.map((i) => i.text).join(' ');
    });

    paginasTexto.push(linhas.join('\n'));
  }

  return paginasTexto.join('\n');
}
