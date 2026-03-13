'use client';

import { useState, useCallback, useRef } from 'react';
import { UploadCloud, FileText, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UploadAreaProps {
  onProcess: (file: File) => void;
  isProcessing: boolean;
}

export function UploadArea({ onProcess, isProcessing }: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        toast.error('Por favor, envie apenas arquivos PDF.');
      }
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        toast.error('Por favor, envie apenas arquivos PDF.');
      }
    }
  }, []);

  const handleSubmit = () => {
    if (file) {
      if (file.size > 15 * 1024 * 1024) { // 15MB limit
        toast.error('Arquivo muito grande. Limite de 15MB.');
        return;
      }
      onProcess(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-primary bg-primary/5'
            : file 
              ? 'border-primary/50 bg-card'
              : 'border-border hover:border-primary/50 bg-card hover:bg-muted/10'
        } p-12 text-center shadow-sm hover:shadow-md cursor-pointer`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleChange}
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold mb-1">Upload do Extrato</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Arraste um PDF do extrato bancário ou clique para selecionar. Todo o processamento é seguro.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-4 w-full max-w-md border border-primary/20">
              <FileText className="w-8 h-8 text-primary shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <p className="font-semibold truncate text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Documento PDF
                </p>
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-md">
              <Button
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                disabled={isProcessing}
              >
                Trocar
              </Button>
              <Button
                className="flex-1 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmit();
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extraindo...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Processar Extrato
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground/80">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Itaú, Bradesco, NB, Santander
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          100% Determinístico
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Inteligência Local
        </div>
      </div>
    </div>
  );
}
