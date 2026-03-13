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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {cards.map((card, idx) => (
        <Card key={idx} className={card.highlight ? 'border-primary/50 bg-primary/5 shadow-lg shadow-primary/5' : 'glass'}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">{card.label}</p>
            <p className={`text-2xl font-bold tracking-tight ${card.highlight ? 'gradient-text' : 'text-foreground'}`}>
              {formatCurrency(card.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
