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
  { num: '01', icon: Upload,   title: 'Upload do PDF',       desc: 'Arraste o extrato bancário. Hash SHA-256 gerado automaticamente para auditoria.' },
  { num: '02', icon: Cpu,      title: 'Extração de Texto',   desc: 'Motor extrai por coordenadas Y/X preservando a ordem real das tabelas bancárias.' },
  { num: '03', icon: BarChart3, title: 'Classificação',      desc: '8 regras em cascata: débitos, apostas, estornos, autotransferências e créditos válidos.' },
  { num: '04', icon: Eye,      title: 'Revisão Interativa',  desc: 'Ajuste manualmente com controles explícitos. Exclua por palavra-chave e atualize ao vivo.' },
  { num: '05', icon: Save,     title: 'Relatório Auditável', desc: 'Total, média mensal, divisão por 6 e 12 meses. Salvo no banco com trilha completa.' },
];

const BANCOS = [
  'Itaú', 'Bradesco', 'Nubank', 'Santander', 'Caixa Econômica',
  'Banco do Brasil', 'Banco Inter', 'Neon', 'Mercado Pago',
  'Revolut', 'PicPay', 'C6 Bank', 'BTG Pactual', 'Sicoob',
];

const RULES = [
  { label: 'Débito',                  desc: 'Valor ≤ 0 é excluído automaticamente',                        color: 'text-red-600' },
  { label: 'Apostas / Jogos',         desc: 'BETANO, BLAZE, FORTUNE TIGER e mais 20+ keywords',            color: 'text-orange-600' },
  { label: 'Estornos / Investimentos', desc: 'CDB, poupança, resgate, tarifa, IOF e similares',            color: 'text-orange-600' },
  { label: 'Sem Keyword de Crédito',  desc: 'Transações sem PIX, TED, DOC, SALÁRIO, etc.',                 color: 'text-orange-600' },
  { label: 'Autotransferência',       desc: 'Nome do cliente detectado na descrição (≥70% tokens)',         color: 'text-orange-600' },
  { label: 'Wash Trading',            desc: 'Crédito e débito de mesmo valor no mesmo dia',                 color: 'text-amber-600' },
  { label: 'Vínculo Familiar',        desc: 'Match parcial do nome — sinalizado para revisão',             color: 'text-amber-600' },
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
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <Hexagon className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight">HOKMA</span>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Motor Determinístico</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[['#funcionalidades', 'Funcionalidades'], ['#motor', 'Motor'], ['#seguranca', 'Segurança']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button onClick={handleCTA}>
                Painel <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button onClick={handleCTA}>
                  Criar conta <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-24 pb-32 px-6 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div></div>

        <div className="container max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Col */}
            <div className="space-y-8">
              <Badge variant="secondary" className="px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 transition-colors">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                Motor v3.0 · 14 Bancos Homologados
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
                Apurar renda com <span className="text-primary break-words">precisão absoluta.</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Analise extratos bancários de forma 100% determinística. Sem "inteligência artificial" probabilística, apenas classificação matemática, manual e auditável em base SHA-256.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" onClick={handleCTA} className="h-12 px-8 text-base">
                  {isLoggedIn ? 'Acessar o Painel' : 'Começar a Apurar agora'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                  <a href="#motor">Como o motor funciona</a>
                </Button>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Setup em 0s</span>
                <span className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> RLS Supabase</span>
                <span className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Gratuito para testes</span>
              </div>
            </div>

            {/* Right Col / Showcase */}
            <div className="relative hidden lg:block perspective-1000">
              <Card className="border-border shadow-2xl bg-card rounded-2xl overflow-hidden rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-700 hover:rotate-0">
                <div className="border-b bg-muted/50 px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/60" />
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mr-10">
                    hokma.app/analise_determinador
                  </div>
                </div>
                <CardContent className="p-6">
                  {/* Mockup Top Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                      <p className="text-xs text-primary font-medium mb-1">Média Mensal</p>
                      <p className="text-2xl font-bold tracking-tight">R$ 5.413,33</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted border">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Total Apurado</p>
                      <p className="text-2xl font-bold tracking-tight">R$ 32.480,00</p>
                    </div>
                  </div>

                  {/* Mockup Rows */}
                  <div className="space-y-3">
                    {[
                      { l: 'PIX Recebido — Empresa Ltda', v: 'R$ 5.500,00', b: 'CRÉDITO VÁLIDO', valid: true },
                      { l: 'TED — Consultoria Extra', v: 'R$ 3.800,00', b: 'CRÉDITO VÁLIDO', valid: true },
                      { l: 'PIX — Cliente B', v: 'R$ 1.900,00', b: 'CRÉDITO VÁLIDO', valid: true },
                      { l: 'PIX Transf Mesmo CPF', v: 'R$ 2.000,00', b: 'AUTOTRANSFERÊNCIA', valid: false },
                    ].map((row, i) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${row.valid ? 'bg-card' : 'bg-muted/50 opacity-60'}`}>
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-medium ${row.valid ? '' : 'line-through'}`}>{row.l}</span>
                          <Badge variant={row.valid ? "default" : "destructive"} className="w-max text-[10px] h-5">{row.b}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold tabular-nums text-sm">{row.v}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> SHA-256 Validado</span>
                    <span>Modo Interativo</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="border-y bg-muted/40 py-12">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
            {[
              { v: '14+',  l: 'Bancos integrados' },
              { v: '8',    l: 'Regras explícitas' },
              { v: 'v3.0', l: 'Versão do motor' },
              { v: '0%',   l: 'Limitações de IA' },
            ].map(({ v, l }, idx) => (
              <div key={l} className={idx === 0 ? "border-l-0" : ""}>
                <div className="text-4xl font-bold tracking-tight text-foreground mb-2">{v}</div>
                <div className="text-sm font-medium text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O essencial em excelência.</h2>
            <p className="text-lg text-muted-foreground">
              Desenhado focado na produtividade do analista de crédito e perito contábil.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <Card key={f.title} className="bg-card hover:border-primary/50 transition-colors shadow-none">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="leading-tight">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOTOR PIPELINE ─────────────────────────────────── */}
      <section id="motor" className="py-24 px-6 bg-muted/30 border-t">
        <div className="container max-w-screen-xl mx-auto">
          <div className="mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O Pipeline de <br/><span className="text-primary">Resolução HOKMA</span></h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Do arquivo bruto até as métricas finais numéricas, cada transação é enrijecida pelas 8 regras fundamentais do motor.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            {STEPS.map((step, idx) => (
              <Card key={step.num} className="bg-card shadow-sm border-border group hover:border-primary/40 transition-colors relative">
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-[28px] -right-4 w-4 h-[2px] bg-border z-10" />
                )}
                <CardHeader className="space-y-4 pb-4">
                  <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors group-hover:border-primary">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">{step.num}. {step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-16" />

          {/* AS 8 REGRAS */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-center">Tabela de Algoritmos (8 Regras)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RULES.map((r, i) => (
                <div key={r.label} className="p-4 rounded-xl border bg-card relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="font-mono text-4xl font-black">{i + 1}</span>
                  </div>
                  <p className={`text-sm font-bold mb-2 ${r.color}`}>{r.label}</p>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ─────────────────────────────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary -z-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent -z-10" />
        
        <div className="container max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <Hexagon className="w-12 h-12 text-primary-foreground/90 mx-auto fill-primary-foreground/20" />
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary-foreground">
            Apurar não precisa ser complexo.
          </h2>
          <p className="text-xl text-primary-foreground/80 font-medium">
            Desfrute agora mesmo de um sistema confiável, focado em performance e desenvolvido estruturalmente para não esconder variáveis entre os cálculos.
          </p>
          <div className="pt-4 flex justify-center">
             <Button
                size="lg"
                onClick={handleCTA}
                variant="secondary"
                className="h-14 px-10 text-lg font-bold shadow-xl shadow-black/10"
              >
                {isLoggedIn ? 'Acessar a Plataforma' : 'Criar Conta de Graça'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t bg-card py-8 px-6">
        <div className="container max-w-screen-xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hexagon className="h-5 w-5 text-primary fill-primary/20" />
            <span className="font-bold tracking-tight">HOKMA v3.0</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Zero IA · 100% Determinístico · © {new Date().getFullYear()}
          </p>
          <div className="flex gap-4 text-sm font-medium">
             <a href="#funcionalidades" className="text-muted-foreground hover:text-foreground">Funcionalidades</a>
             <a href="#motor" className="text-muted-foreground hover:text-foreground">Motor</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
