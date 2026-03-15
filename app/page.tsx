'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BarChart3, Shield, Zap, FileCheck, Building2,
  ArrowRight, CheckCircle, Lock, Cpu, Database,
  Eye, RefreshCw, Save, ChevronRight, Hexagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { Section } from '@/components/ui/section';

// ── DATA ────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Cpu,
    title: '8 Regras em Cascata',
    desc: 'Motor completamente determinístico. Zero inteligência artificial, zero probabilidades — apenas resultados que você pode auditar linha a linha.',
    className: "md:col-span-2 md:row-span-2", // Large Bento Cell
  },
  {
    icon: Shield,
    title: 'Auditoria SHA-256',
    desc: 'Cada PDF recebe uma impressão digital criptográfica única.',
    className: "md:col-span-1",
  },
  {
    icon: Building2,
    title: '14 Bancos',
    desc: 'Itaú, Bradesco, Nubank e mais homologados nativamente.',
    className: "md:col-span-1",
  },
  {
    icon: Eye,
    title: 'Revisão Interativa',
    desc: 'Ative ou desative transações na hora. Filtre palavras.',
    className: "md:col-span-1",
  },
  {
    icon: RefreshCw,
    title: 'OCR Automático',
    desc: 'PDFs escaneados processados com Tesseract.js em background.',
    className: "md:col-span-2", // Wide feature
  },
  {
    icon: Database,
    title: 'Histórico Completo',
    desc: 'Total rastreabilidade criptográfica das apurações salvas no banco Supabase.',
    className: "md:col-span-1",
  },
];

const STEPS = [
  { num: '01', title: 'Upload do PDF',       desc: 'Arraste o extrato. Hash gerado.' },
  { num: '02', title: 'Extração de Texto',   desc: 'Motor extrai por coordenadas X/Y.' },
  { num: '03', title: 'Classificação',      desc: 'Regras purificam dados brutos.' },
  { num: '04', title: 'Revisão Visual',  desc: 'Ajuste manual com recálculo online.' },
  { num: '05', title: 'Relatório', desc: 'Aprovação e salvamento da matriz.' },
];

const BANCOS = [
  'Itaú', 'Bradesco', 'Nubank', 'Santander', 'Caixa',
  'Banco do Brasil', 'Inter', 'Neon', 'PicPay', 'C6 Bank'
];

// ── COMPONENT ───────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function HokmaLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  const handleCTA = () => router.push(isLoggedIn ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-muted/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container flex h-16 items-center justify-between px-6 max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Hexagon className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-lg tracking-tight text-foreground">HOKMA</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[['#funcionalidades', 'Bento Grid'], ['#motor', 'Engine'], ['#seguranca', 'Auditoria']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-semibold tracking-tight text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Button onClick={handleCTA} className="font-semibold tracking-tight rounded-full px-6">
                Painel <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-foreground font-semibold tracking-tight">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button onClick={handleCTA} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-semibold tracking-tight rounded-full px-6 transition-transform hover:scale-105">
                  Começar Livre <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO Premium ───────────────────────────────────── */}
      <Section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-32 flex flex-col items-center justify-center min-h-[85vh]">
        {/* Subtle Radial Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/15 via-background to-background opacity-70 -z-10 blur-3xl" />
        
        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="container max-w-4xl mx-auto text-center space-y-8"
        >
          <Badge variant="outline" className="px-4 py-1.5 rounded-full border-muted/50 bg-secondary/50 backdrop-blur-md text-foreground shadow-sm font-semibold tracking-wide gap-2 mx-auto">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse-slow" />
            Nova Interface Zinc & Violet
          </Badge>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.1] mx-auto max-w-3xl">
            Sua renda auditada com <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">foco laser.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed tracking-tight">
            Motor determinístico sem IA. Apuração instantânea com rastreabilidade SHA-256 e design focado no essencial para peritos modernos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
            <Button size="lg" onClick={handleCTA} className="h-14 px-10 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/25 rounded-full">
              {isLoggedIn ? 'Acessar o Painel' : 'Iniciar Apuração Pessoal'}
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-full border-muted/60 bg-transparent hover:bg-secondary/50" asChild>
              <a href="#motor">Entender o Pipeline</a>
            </Button>
          </div>
        </motion.div>

        {/* Social Proof Logos */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
          className="container max-w-5xl mx-auto mt-24 border-t border-muted/40 pt-10"
        >
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Processamento Nativo Impecável
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {BANCOS.slice(0, 6).map(banco => (
              <span key={banco} className="text-lg md:text-xl font-bold tracking-tighter text-foreground">{banco}</span>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── BENTO GRID FEATURES ─────────────────────────────── */}
      <Section id="funcionalidades" className="bg-secondary/20 py-24 border-y border-muted/40">
        <div className="container max-w-screen-xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16 space-y-4 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">
              Desenhado para o <span className="text-primary">Performance</span>.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-medium tracking-tight">
              Bento grid com os recursos vitais que transformam PDFs caóticos em matrizes ricas.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6 auto-rows-[250px]"
          >
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} className={`h-full ${f.className}`}>
                <Card className="h-full bg-card/40 backdrop-blur-md border-muted/50 hover:bg-card hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col justify-end group p-6 shadow-sm hover:shadow-xl hover:-translate-y-1">
                  <div className="mb-auto mt-2">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-transform">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-muted-foreground font-medium text-base tracking-tight leading-relaxed">{f.desc}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── MOTOR PIPELINE PREMIUM ───────────────────────────── */}
      <Section id="motor" className="bg-background py-24">
        <div className="container max-w-screen-xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="mb-16 space-y-4 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">Pipeline <span className="text-primary">Inflexível</span></h2>
            <p className="text-lg md:text-xl text-muted-foreground mx-auto max-w-2xl font-medium tracking-tight">
              Transformação bruta linear em cinco checkpoints absolutos.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-5 gap-6">
            {STEPS.map((step, idx) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative flex flex-col"
              >
                <div className="text-6xl font-black text-muted/30 absolute -top-4 -left-2 tracking-tighter select-none z-0">
                  {step.num}
                </div>
                <div className="relative z-10 p-6 rounded-2xl bg-secondary/30 border border-muted/40 h-full flex flex-col shadow-sm">
                  <h4 className="text-lg font-bold tracking-tight mb-2 text-foreground mt-4">{step.title}</h4>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed flex-1">{step.desc}</p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-4 border-t-2 border-dashed border-muted/60 z-20" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA BOTTOM ─────────────────────────────────────── */}
      <Section className="relative overflow-hidden bg-zinc-950 text-white py-32 border-t border-zinc-900 border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-primary/30 via-zinc-950 to-transparent opacity-60 pointer-events-none" />
        
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="container max-w-3xl mx-auto text-center space-y-10 relative z-10"
        >
          <Hexagon className="w-16 h-16 text-primary mx-auto opacity-90" />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
            Excelência Auditada.
          </h2>
          <p className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed tracking-tight">
            Pare de depender do Excel. Inicie análises bancárias precisas com o motor Hokma V3.
          </p>
          <div className="pt-8">
             <Button
                size="lg"
                onClick={handleCTA}
                className="h-14 px-12 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 rounded-full shadow-2xl shadow-primary/30"
              >
                {isLoggedIn ? 'Acessar o Workstation' : 'Entrar Agora (Gratuito)'}
                <ArrowRight className="h-5 w-5 ml-2.5" />
              </Button>
          </div>
        </motion.div>
      </Section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="bg-zinc-950 py-12 px-6">
        <div className="container max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Hexagon className="h-6 w-6 text-primary" />
            <span className="font-extrabold tracking-tighter text-white text-xl">HOKMA <span className="text-zinc-600 font-medium text-sm ml-2">v3.0</span></span>
          </div>
          <p className="text-sm text-zinc-500 font-medium text-center tracking-tight">
            Métricas precisas &middot; Não é IA &middot; © {new Date().getFullYear()}
          </p>
          <div className="flex gap-8 text-sm font-semibold tracking-tight">
             <a href="#funcionalidades" className="text-zinc-500 hover:text-white transition-colors">Bento Grid</a>
             <a href="#motor" className="text-zinc-500 hover:text-white transition-colors">Engine</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
