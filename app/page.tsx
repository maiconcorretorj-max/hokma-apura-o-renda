'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Shield, Zap, FileCheck, Building2,
  ArrowRight, CheckCircle, Lock, Cpu, Database,
  Upload, Eye, RefreshCw, Save, TrendingUp,
  ChevronRight, Star, Hexagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { Section } from '@/components/ui/section';

// ── DATA ────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Cpu,
    title: '8 Regras em Cascata',
    desc: 'Motor completamente determinístico. Zero inteligência artificial, zero probabilidades — apenas resultados que você pode auditar linha a linha.',
  },
  {
    icon: Shield,
    title: 'Auditoria SHA-256',
    desc: 'Cada PDF recebe uma impressão digital criptográfica única. Qualquer alteração no documento original é detectada instantaneamente.',
  },
  {
    icon: Building2,
    title: '14 Bancos Homologados',
    desc: 'Itaú, Bradesco, Nubank, Santander, Caixa, BB, Inter, Neon, Mercado Pago, Revolut, PicPay, C6 Bank e mais.',
  },
  {
    icon: Eye,
    title: 'Revisão Interativa',
    desc: 'Ative ou desative transações individualmente. Exclua por palavras-chave. As métricas são recalculadas instantaneamente.',
  },
  {
    icon: RefreshCw,
    title: 'OCR Automático',
    desc: 'PDFs escaneados processados com Tesseract.js via Web Workers paralelos. Resolução alta para máxima precisão de leitura.',
  },
  {
    icon: Database,
    title: 'Histórico Completo',
    desc: 'Todos os relatórios salvos no Supabase com hash, timestamp, versão do algoritmo e lista completa de transações.',
  },
];

const STEPS = [
  { num: '01', icon: Upload,   title: 'Upload do PDF',       desc: 'Arraste o extrato bancário. Hash SHA-256 gerado automaticamente.' },
  { num: '02', icon: Cpu,      title: 'Extração de Texto',   desc: 'Motor extrai por coordenadas Y/X preservando a ordem real.' },
  { num: '03', icon: BarChart3, title: 'Classificação',      desc: '8 regras em cascata: débitos, apostas, estornos e créditos.' },
  { num: '04', icon: Eye,      title: 'Revisão Interativa',  desc: 'Ajuste manualmente com controles explícitos ao vivo.' },
  { num: '05', icon: Save,     title: 'Relatório Auditável', desc: 'Total numérico puro salvo com trilha criptográfica.' },
];

const BANCOS = [
  'Itaú', 'Bradesco', 'Nubank', 'Santander', 'Caixa Econômica',
  'Banco do Brasil', 'Banco Inter', 'Neon', 'Mercado Pago',
  'Revolut', 'PicPay', 'C6 Bank', 'BTG Pactual', 'Sicoob',
];

const RULES = [
  { label: 'Débito',                  desc: 'Valor ≤ 0 é excluído automaticamente',                        color: 'text-destructive' },
  { label: 'Apostas / Jogos',         desc: 'BETANO, BLAZE, FORTUNE TIGER e mais 20+ keywords',            color: 'text-orange-500' },
  { label: 'Estornos / Investimentos', desc: 'CDB, poupança, resgate, tarifa, IOF e similares',            color: 'text-orange-500' },
  { label: 'Sem Keyword de Crédito',  desc: 'Transações sem PIX, TED, DOC, SALÁRIO, etc.',                 color: 'text-orange-500' },
  { label: 'Autotransferência',       desc: 'Nome do cliente detectado na descrição (≥70% tokens)',         color: 'text-orange-500' },
  { label: 'Wash Trading',            desc: 'Crédito e débito de mesmo valor no mesmo dia',                 color: 'text-amber-500' },
  { label: 'Vínculo Familiar',        desc: 'Match parcial do nome — sinalizado para revisão',             color: 'text-amber-500' },
  { label: 'Crédito Válido',          desc: 'Passou todas as regras — entra no cálculo da renda',          color: 'text-primary' },
];

// ── COMPONENT ───────────────────────────────────────────────

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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-brand/20">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group animate-appear">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand text-brand-foreground shadow-sm group-hover:scale-105 transition-transform">
              <Hexagon className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight text-foreground">HOKMA</span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Motor Determinístico</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 animate-appear delay-100">
            {[['#funcionalidades', 'Funcionalidades'], ['#motor', 'Motor'], ['#seguranca', 'Segurança']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 animate-appear delay-200">
            {isLoggedIn ? (
              <Button onClick={handleCTA}>
                Painel <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button onClick={handleCTA} className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-sm">
                  Criar conta <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <Section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
        {/* Launch UI Signature Glow */}
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl opacity-30" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand to-[#9089fc] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath:"polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>

        <div className="container max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left Col */}
            <div className="space-y-10 animate-appear">
              <Badge variant="outline" className="px-3 py-1 rounded-full bg-brand/5 text-brand border-brand/20 backdrop-blur-sm animate-pulse-slow">
                <span className="flex h-2 w-2 rounded-full bg-brand mr-2" />
                Motor v3.0 Homologado
              </Badge>

              <h1 className="text-5xl lg:text-[4.5rem] font-bold tracking-tight leading-[1.05] text-foreground">
                Apure rendimentos com <span className="text-brand block">precisão absoluta.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed font-medium">
                Analise extratos bancários de forma 100% determinística. Sem heurísticas ocultas ou caixas-pretas limitantes. Auditável via SHA-256.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" onClick={handleCTA} className="h-14 px-8 text-base bg-brand text-brand-foreground hover:bg-brand/90 transition-transform hover:scale-[1.02] shadow-xl shadow-brand/20">
                  {isLoggedIn ? 'Acessar o Painel' : 'Apurar Rendimentos'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="secondary" className="h-14 px-8 text-base border-border bg-secondary/50" asChild>
                  <a href="#motor">Entender o Motor</a>
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-brand" /> Zero setup necessário</span>
                <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-brand" /> Banco de Dados Isolado</span>
              </div>
            </div>

            {/* Right Col / Showcase Mockup */}
            <div className="relative hidden lg:block perspective-1000 animate-appear-zoom delay-200">
              <Card className="border-border shadow-mockup bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden -rotate-y-[6deg] rotate-x-[4deg] transition-all duration-700 hover:rotate-0 hover:scale-[1.02]">
                <div className="border-b border-border/50 bg-muted/40 px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <div className="w-3 h-3 rounded-full bg-brand/60" />
                  </div>
                  <div className="text-[10px] font-mono font-medium tracking-wide text-muted-foreground mr-10">
                    hokma.app / interface
                  </div>
                </div>
                <CardContent className="p-6">
                  {/* Mockup Top Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-5 rounded-2xl bg-brand/5 border border-brand/10">
                      <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-2">Média Mensal</p>
                      <p className="text-3xl font-bold tracking-tight text-foreground">R$ 5.413,33</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50">
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Total Apurado</p>
                      <p className="text-3xl font-bold tracking-tight text-foreground">R$ 32.480,00</p>
                    </div>
                  </div>

                  {/* Mockup Rows */}
                  <div className="space-y-2.5">
                    {[
                      { l: 'PIX Recebido — Startup Tech', v: '+ R$ 5.500,00', b: 'VÁLIDO', valid: true },
                      { l: 'TED — Honorários Adv', v: '+ R$ 3.800,00', b: 'VÁLIDO', valid: true },
                      { l: 'PIX Transf Mesmo CPF', v: '+ R$ 2.000,00', b: 'AUTOTRANSF.', valid: false },
                    ].map((row, i) => (
                      <div key={i} className={`flex items-center justify-between p-3.5 rounded-xl border border-border/60 ${row.valid ? 'bg-card' : 'bg-muted/30 opacity-70'}`}>
                        <div className="flex flex-col gap-1.5">
                          <span className={`text-sm font-semibold text-foreground ${row.valid ? '' : 'line-through text-muted-foreground'}`}>{row.l}</span>
                          <Badge variant={row.valid ? "default" : "secondary"} className={`w-max text-[9px] h-4.5 px-1.5 uppercase tracking-wider font-bold ${row.valid ? 'bg-brand/10 text-brand hover:bg-brand/20' : ''}`}>{row.b}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold tabular-nums text-sm ${row.valid ? 'text-foreground' : 'text-muted-foreground'}`}>{row.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-5 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-brand" /> Criptografia Ponta a Ponta</span>
                    <span className="px-2 py-1 bg-secondary rounded-md text-[10px]">Modo Analista</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </Section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="border-y border-border bg-secondary/20 py-16 animate-appear delay-300">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 text-center divide-x divide-border/50">
            {[
              { v: '14+',  l: 'Bancos integrados nativamente' },
              { v: '8',    l: 'Regras de purificação de dados' },
              { v: 'v3.0', l: 'Algoritmo de reconciliação' },
              { v: '0%',   l: 'Alucinações de inteligência artificial' },
            ].map(({ v, l }, idx) => (
              <div key={l} className={idx === 0 ? "border-l-0" : ""}>
                <div className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3">{v}</div>
                <div className="text-sm font-medium text-muted-foreground max-w-[150px] mx-auto leading-relaxed">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <Section id="funcionalidades" className="bg-background">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-20 space-y-5 max-w-3xl mx-auto animate-appear">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Tudo construído com <span className="text-brand">excelência</span>.</h2>
            <p className="text-xl text-muted-foreground font-medium">
              A arquitetura foi redesenhada focando na velocidade extrema de leitura e usabilidade impecável para peritos contábeis.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <Card key={f.title} className="bg-card/50 hover:bg-card border-border/60 hover:border-brand/30 transition-all duration-300 shadow-sm hover:shadow-md animate-appear" style={{ animationDelay: `${i * 100}ms` }}>
                <CardHeader className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center border border-border/50 shadow-sm">
                    <f.icon className="h-6 w-6 text-brand" />
                  </div>
                  <CardTitle className="text-xl leading-tight font-bold text-foreground">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-muted-foreground leading-relaxed font-medium">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── MOTOR PIPELINE ─────────────────────────────────── */}
      <Section id="motor" className="bg-secondary/30 border-t border-border">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-20 space-y-5 animate-appear">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">O Pipeline <span className="text-brand">HOKMA</span></h2>
            <p className="text-xl text-muted-foreground max-w-2xl font-medium">
              Do arquivo bruto até a matriz numérica, os dados passam por enrijecimento matemático inflexível.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {STEPS.map((step, idx) => (
              <Card key={step.num} className="bg-card border-border/60 group hover:border-brand/40 transition-colors shadow-sm relative animate-appear" style={{ animationDelay: `${idx * 150}ms` }}>
                <CardHeader className="space-y-5 pb-5">
                  <div className="w-12 h-12 rounded-xl bg-secondary border border-border/50 flex items-center justify-center group-hover:bg-brand group-hover:text-brand-foreground group-hover:border-brand transition-all duration-300">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold">{step.num}. {step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-20" />

          {/* AS 8 REGRAS */}
          <div className="space-y-12 animate-appear">
            <h3 className="text-3xl font-bold text-center text-foreground tracking-tight">Matriz de Algoritmos (8 Regras)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RULES.map((r, i) => (
                <div key={r.label} className="p-6 rounded-2xl border border-border/60 bg-card/40 hover:bg-card relative overflow-hidden transition-colors shadow-sm">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                    <span className="font-mono text-6xl font-black">{i + 1}</span>
                  </div>
                  <p className={`text-sm uppercase tracking-wider font-bold mb-3 ${r.color}`}>{r.label}</p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA BOTTOM ─────────────────────────────────────── */}
      <Section className="relative overflow-hidden bg-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent opacity-80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container max-w-4xl mx-auto text-center space-y-10 relative z-10 animate-appear">
          <Hexagon className="w-16 h-16 text-brand mx-auto opacity-80" />
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-background">
            Auditoria na ponta dos dedos.
          </h2>
          <p className="text-xl md:text-2xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
            Abandone planilhas manuais. Adote um motor capaz de unificar todos os padrões bancários com rastreabilidade criptográfica.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
             <Button
                size="lg"
                onClick={handleCTA}
                className="h-14 px-10 text-lg font-bold bg-brand text-brand-foreground hover:bg-brand/90 transition-transform hover:scale-[1.02] shadow-xl shadow-brand/20"
              >
                {isLoggedIn ? 'Abrir Sistema' : 'Comece a Apurar Hoje'}
                <ArrowRight className="h-5 w-5 ml-2.5" />
              </Button>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background py-12 px-6">
        <div className="container max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Hexagon className="h-6 w-6 text-brand" />
            <span className="font-bold tracking-tight text-foreground text-lg">HOKMA <span className="text-muted-foreground font-medium text-sm ml-1">v3.0</span></span>
          </div>
          <p className="text-sm text-muted-foreground font-medium text-center">
            Zero IA &middot; 100% Determinístico &middot; © {new Date().getFullYear()}
          </p>
          <div className="flex gap-8 text-sm font-semibold">
             <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground transition-colors">Funcionalidades</a>
             <a href="#motor" className="text-muted-foreground hover:text-foreground transition-colors">Motor</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
