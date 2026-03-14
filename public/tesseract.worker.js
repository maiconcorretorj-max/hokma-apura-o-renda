// Web Worker dedicado para Tesseract OCR
// Roda em thread completamente separado da UI

importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');

let worker = null;

self.onmessage = async function(e) {
  const { type, imageData, pageNum } = e.data;

  if (type === 'init') {
    try {
      // Criar worker Tesseract apenas uma vez
      worker = await Tesseract.createWorker('por', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            self.postMessage({
              type: 'progress',
              pageNum,
              progress: m.progress
            });
          }
        }
      });
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }

  if (type === 'recognize' && worker && imageData) {
    try {
      const { data } = await worker.recognize(imageData);
      self.postMessage({
        type: 'result',
        pageNum,
        text: data.text
      });
    } catch (error) {
      self.postMessage({
        type: 'error',
        pageNum,
        error: error.message
      });
    }
  }

  if (type === 'terminate' && worker) {
    await worker.terminate();
    worker = null;
    self.postMessage({ type: 'terminated' });
  }
};
