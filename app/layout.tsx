import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'HOKMA — Sistema de Apuração de Renda',
  description: 'Analise extratos bancários com precisão absoluta. Motor v3.0 determinístico com 8 regras de classificação — 100% auditável, zero IA.',
  keywords: ['HOKMA', 'apuração de renda', 'extrato bancário', 'análise financeira', 'crédito', 'determinístico'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
