'use client';

import { Card, CardContent } from '@/components/ui/card';

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

  const cards = [
    { label: 'Total Apurado', value: metricas.totalApurado, highlight: true },
    { label: 'Média Mensal', value: metricas.mediaMensal, highlight: true },
    { label: 'Divisão por 6 Meses', value: metricas.divisao6Meses },
    { label: 'Divisão por 12 Meses', value: metricas.divisao12Meses },
    { label: 'Maior Mês', value: metricas.maiorMes },
    { label: 'Menor Mês', value: metricas.menorMes },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {cards.map((card, idx) => (
        <Card 
          key={idx} 
          className={`animate-appear ${
            card.highlight 
              ? 'border-brand/30 bg-brand/5 shadow-md shadow-brand/5' 
              : 'border-border/60 bg-card/60 shadow-sm'
          }`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <CardContent className="p-6">
            <p className="text-[13px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              {card.label}
            </p>
            <p className={`text-3xl font-extrabold tracking-tight ${card.highlight ? 'text-brand' : 'text-foreground'}`}>
              {formatCurrency(card.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
