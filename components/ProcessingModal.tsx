'use client';

import { Loader2 } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  fase: string;
  percentual: number;
  paginaAtual?: number;
  totalPaginas?: number;
}

export function ProcessingModal({
  isOpen,
  fase,
  percentual,
  paginaAtual,
  totalPaginas,
}: ProcessingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 space-y-6">
        {/* Spinner */}
        <div className="flex justify-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary tabular-nums">
                {percentual}%
              </span>
            </div>
          </div>
        </div>

        {/* Fase atual */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{fase}</h3>
          {totalPaginas && totalPaginas > 0 && (
            <p className="text-sm text-muted-foreground">
              Processando página {paginaAtual || 0} de {totalPaginas}
            </p>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
              style={{ width: `${percentual}%` }}
            />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Isso pode levar alguns minutos dependendo do tamanho do PDF
          </p>
        </div>
      </div>
    </div>
  );
}
