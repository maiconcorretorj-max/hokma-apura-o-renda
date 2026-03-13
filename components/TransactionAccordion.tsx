'use client';

import { useMemo } from 'react';
import { type Transacao } from '@/types/transaction';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TransactionRow } from './TransactionRow';

interface TransactionAccordionProps {
  transactions: Transacao[];
  onToggle: (id: string, currentState: boolean) => void;
}

export function TransactionAccordion({ transactions, onToggle }: TransactionAccordionProps) {
  // 1. Filtrar o que NÃO deve aparecer na UI (débitos, sem keyword, lixo, etc)
  const txVisiveis = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.valor <= 0) return false;
      if (tx.classificacao === 'ignorar_sem_keyword') return false;
      if (tx.classificacao === 'ignorar_estorno') return false;
      // Aparecem: credito_valido, possivel_vinculo_familiar, ignorar_autotransferencia, ignorar_aposta
      return true;
    });
  }, [transactions]);

  // 2. Agrupar por mesAno
  const agendamentosPorMes = useMemo(() => {
    const grupos: Record<string, typeof txVisiveis> = {};
    for (const tx of txVisiveis) {
      const mes = tx.mesAno || '0000-00';
      if (!grupos[mes]) grupos[mes] = [];
      grupos[mes].push(tx);
    }
    return grupos;
  }, [txVisiveis]);

  // 3. Ordenação dos meses (decrescente: mais recente primeiro)
  const mesesOrdenados = Object.keys(agendamentosPorMes).sort((a, b) => b.localeCompare(a));

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  if (txVisiveis.length === 0) {
    return (
      <div className="text-center p-12 form-border rounded-xl bg-card/50">
        <p className="text-muted-foreground">Nenhuma transação de crédito encontrada após filtragem básica.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-muted/40 font-semibold text-sm flex justify-between items-center text-muted-foreground">
        <span>Lista de Transações ({txVisiveis.length} registros visíveis)</span>
        <span className="hidden sm:inline">Excluídas por padrão: estornos, saídas, sem palavras-chave.</span>
      </div>
      
      <Accordion type="multiple" defaultValue={mesesOrdenados} className="w-full">
        {mesesOrdenados.map((mes) => {
          const txsMes = agendamentosPorMes[mes];
          const totalAtivoMes = txsMes.filter(t => t.is_validated).reduce((acc, t) => acc + t.valor, 0);

          // Formatar "2025-01" -> "Janeiro 2025" (rough fallback implementation instead of full intl if preferred, but Intl is better)
          let mesDisplay = mes;
          if (mes !== '0000-00') {
            const [y, m] = mes.split('-');
            const date = new Date(parseInt(y), parseInt(m) - 1, 1);
            mesDisplay = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
            mesDisplay = mesDisplay.charAt(0).toUpperCase() + mesDisplay.slice(1);
          } else {
            mesDisplay = 'Data Não Identificada';
          }

          return (
            <AccordionItem key={mes} value={mes} className="border-b last:border-0">
              <AccordionTrigger className="px-6 hover:bg-muted/50 data-[state=open]:bg-muted/30">
                <div className="flex justify-between w-full pr-4 items-center">
                  <span className="font-semibold text-foreground tracking-tight">{mesDisplay}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                      {txsMes.length} transações
                    </span>
                    <span className="font-bold text-primary">
                      {formatCurrency(totalAtivoMes)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0 border-t">
                <div className="divide-y">
                  {txsMes.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} onToggle={onToggle} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
