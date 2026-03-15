'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface IncomeSummaryProps {
  metricas: {
    totalApurado: number;
    mediaMensal: number;
    divisao6Meses: number;
    divisao12Meses: number;
    maiorMes: number;
    menorMes: number;
  };
}

export function IncomeSummary({ metricas }: IncomeSummaryProps) {
  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  // Meta de Renda (Mock)
  const META_MENSAL = 10000 * 100; // R$ 10.000,00 em centavos
  const progressoBruto = (metricas.mediaMensal / META_MENSAL) * 100;
  const progressoVisual = Math.min(progressoBruto, 100);
  const isMetaAlcancada = progressoVisual >= 100;

  const cards = [
    { label: 'Total Apurado', value: metricas.totalApurado, highlight: true },
    { label: 'Média Mensal', value: metricas.mediaMensal, highlight: true, hasProgress: true },
    { label: 'Divisão por 6 Meses', value: metricas.divisao6Meses },
    { label: 'Divisão por 12 Meses', value: metricas.divisao12Meses },
    { label: 'Maior Mês', value: metricas.maiorMes },
    { label: 'Menor Mês', value: metricas.menorMes },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, idx) => (
        <Card 
          key={idx} 
          className={`animate-appear group overflow-hidden ${
            card.highlight 
              ? 'border-primary/20 bg-primary/5 shadow-md shadow-primary/5' 
              : 'border-muted/50 bg-card/40 backdrop-blur-xl shadow-sm hover:border-muted/80'
          } transition-all duration-300`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <CardContent className="p-6 relative">
            <p className="text-[13px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
              {card.label}
            </p>
            <p className={`text-3xl font-extrabold tracking-tighter ${card.highlight ? 'text-primary' : 'text-foreground'}`}>
              {formatCurrency(card.value)}
            </p>

            {/* Regra Crítica: Progresso visual limitado a exatamente 100% */}
            {card.hasProgress && (
              <div className="mt-5 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block">
                <div className="flex justify-between text-[11px] font-bold tracking-tight uppercase">
                  <span className="text-muted-foreground">Progresso da Meta</span>
                  <span className={isMetaAlcancada ? 'text-emerald-500' : 'text-primary'}>
                    {progressoVisual.toFixed(1)}% {isMetaAlcancada && '🎉'}
                  </span>
                </div>
                {/* Custom Progress styling via wrapper class or direct style overriding Tailwind limitations on Shadcn Progress component */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                  <div
                    className={`h-full w-full flex-1 transition-all duration-1000 ease-in-out ${isMetaAlcancada ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary'}`}
                    style={{ transform: `translateX(-${100 - progressoVisual}%)` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
