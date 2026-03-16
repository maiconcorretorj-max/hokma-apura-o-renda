import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'HOKMA — Sistema de Apuração de Renda',
  description: 'Analise extratos bancários com precisão absoluta. Motor v3.0 determinístico com 8 regras de classificação — 100% auditável, zero IA.',
  keywords: ['HOKMA', 'apuração de renda', 'extrato bancário', 'análise financeira', 'crédito', 'determinístico'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", inter.variable, firaCode.variable)}>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
