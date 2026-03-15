'use client';

import { type Transacao } from '@/types/transaction';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionRowProps {
  tx: Transacao & { _excludedByKeyword?: boolean };
  onToggle: (id: string, currentState: boolean) => void;
}

const BADGE_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  credito_valido: { label: 'CRÉDITO VÁLIDO', variant: 'default' },
  possivel_vinculo_familiar: { label: 'VÍNCULO FAMILIAR', variant: 'secondary' },
  ignorar_autotransferencia: { label: 'AUTOTRANSFERÊNCIA', variant: 'destructive' },
  ignorar_aposta: { label: 'APOSTAS/JOGOS', variant: 'destructive' },
};

export function TransactionRow({ tx, onToggle }: TransactionRowProps) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const isActive = tx.is_validated;
  const config = BADGE_CONFIG[tx.classificacao] ?? { label: tx.classificacao, variant: 'outline' };

  return (
    <div
      className={`group flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 ${
        !isActive ? 'opacity-60 bg-muted/10' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 flex-1 min-w-0 pr-4">
        <div className="w-[85px] shrink-0 text-sm tabular-nums text-muted-foreground font-semibold">
          {tx.data}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-medium truncate ${!isActive ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {tx.descricao}
          </p>
          <div className="flex items-center gap-2 mt-1 sm:hidden">
            <span className={`text-sm font-semibold tabular-nums ${isActive ? 'text-brand' : ''}`}>
              {formatCurrency(tx.valor)}
            </span>
            <Badge variant={config.variant} className="text-[9px] px-1.5 py-0 uppercase tracking-widest font-bold">
              {config.label}
            </Badge>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 shrink-0 px-4">
          <Badge variant={config.variant} className="text-[10px] uppercase tracking-widest font-bold">
            {config.label}
          </Badge>
          {tx.custom_tag === 'washtrading' && (
            <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-widest">WASH TRADING</Badge>
          )}
          {tx._excludedByKeyword && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest border-destructive/50 text-destructive">KEYWORD</Badge>
                </TooltipTrigger>
                <TooltipContent>Excluído por palavra-chave</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="hidden sm:block w-[110px] text-right">
          <span className={`text-[15px] font-semibold tabular-nums tracking-tight ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
            {formatCurrency(tx.valor)}
          </span>
        </div>
        <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-brand' : 'text-muted-foreground'}`}>
            {isActive ? 'INCLUÍDO' : 'IGNORADO'}
          </span>
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggle(tx.id, isActive)}
            className="data-[state=checked]:bg-brand"
            title={isActive ? "Ignorar transação" : "Considerar transação no cálculo"}
          />
        </div>
      </div>
    </div>
  );
}
