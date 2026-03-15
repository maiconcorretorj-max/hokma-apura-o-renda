'use client';

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
}: ProcessingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 space-y-5">

        {/* Barra de progresso + % no topo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Progresso
            </span>
            <span className="text-2xl font-extrabold text-primary tabular-nums">
              {percentual}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentual}%` }}
            />
          </div>
        </div>

        {/* Status central */}
        <div className="text-center py-2 space-y-1">
          <h3 className="text-base font-semibold text-foreground">Em progresso</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {fase || 'Processando...'}
          </p>
        </div>

        {/* Rodapé informativo */}
        <p className="text-xs text-center text-muted-foreground border-t border-border pt-4">
          Isso pode levar alguns minutos dependendo do tamanho do extrato
        </p>
      </div>
    </div>
  );
}
