'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Shield, Zap, FileCheck, Building2,
  ArrowRight, CheckCircle, Lock, Cpu, Database,
  Upload, Eye, RefreshCw, Save, TrendingUp,
  ChevronRight, Star,
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
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Shield,
    title: 'Auditoria SHA-256',
    desc: 'Cada PDF recebe uma impressão digital criptográfica única. Qualquer alteração no documento original é detectada instantaneamente.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Building2,
    title: '14 Bancos Homologados',
    desc: 'Itaú, Bradesco, Nubank, Santander, Caixa, BB, Inter, Neon, Mercado Pago, Revolut, PicPay, C6 Bank e mais.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Eye,
    title: 'Revisão Interativa',
    desc: 'Ative ou desative transações individualmente. Exclua por palavras-chave. As métricas são recalculadas instantaneamente.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: RefreshCw,
    title: 'OCR Automático',
    desc: 'PDFs escaneados processados com Tesseract.js via Web Workers paralelos. Resolução 2x para máxima precisão de leitura.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Database,
    title: 'Histórico Completo',
    desc: 'Todos os relatórios salvos no Supabase com hash, timestamp, versão do algoritmo e lista completa de transações.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
];

const STEPS = [
  { num: '01', icon: Upload, title: 'Upload do PDF', desc: 'Arraste o extrato bancário. Hash SHA-256 gerado automaticamente para auditoria.' },
  { num: '02', icon: Cpu, title: 'Extração de Texto', desc: 'PDF.js extrai por coordenadas Y/X preservando a ordem real das tabelas bancárias.' },
  { num: '03', icon: BarChart3, title: 'Classificação', desc: '8 regras em cascata: débitos, apostas, estornos, autotransferências e créditos válidos.' },
  { num: '04', icon: Eye, title: 'Revisão Interativa', desc: 'Ajuste manualmente com toggles. Exclua por palavra-chave. Métricas ao vivo.' },
  { num: '05', icon: Save, title: 'Relatório Auditável', desc: 'Total, média mensal, divisão por 6 e 12 meses. Salvo no banco com trilha completa.' },
];

const BANCOS = [
  'Itaú', 'Bradesco', 'Nubank', 'Santander', 'Caixa Econômica',
  'Banco do Brasil', 'Banco Inter', 'Neon', 'Mercado Pago',
  'Revolut', 'PicPay', 'C6 Bank', 'BTG Pactual', 'Sicoob',
];

const RULES = [
  { label: 'Débito', desc: 'Valor ≤ 0 é excluído automaticamente', color: 'text-red-400' },
  { label: 'Apostas / Jogos', desc: 'BETANO, BLAZE, FORTUNE TIGER e mais 20+ keywords', color: 'text-orange-400' },
  { label: 'Estornos / Investimentos', desc: 'CDB, poupança, resgate, tarifa, IOF e similares', color: 'text-orange-400' },
  { label: 'Sem Keyword de Crédito', desc: 'Transações sem PIX, TED, DOC, SALÁRIO, etc.', color: 'text-orange-400' },
  { label: 'Autotransferência', desc: 'Nome do cliente detectado na descrição (≥70% tokens)', color: 'text-orange-400' },
  { label: 'Wash Trading', desc: 'Crédito e débito de mesmo valor no mesmo dia', color: 'text-amber-400' },
  { label: 'Vínculo Familiar', desc: 'Match parcial do nome — sinalizado para revisão', color: 'text-yellow-400' },
  { label: 'Crédito Válido', desc: 'Passou todas as regras — entra no cálculo da renda', color: 'text-emerald-400' },
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
    <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container max-w-screen-xl mx-auto flex h-16 items-center justify-between px-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-primary rounded-xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-5 h-5" fill="none">
                  <rect x="4" y="4" width="12" height="12" rx="2" className="fill-primary" />
                  <rect x="20" y="4" width="12" height="12" rx="2" className="fill-primary opacity-60" />
                  <rect x="4" y="20" width="12" height="12" rx="2" className="fill-primary opacity-60" />
                  <rect x="20" y="20" width="12" height="12" rx="2" className="fill-primary" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg tracking-tight">HOKMA</span>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">Sistema de Apuração de Renda</span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[['#funcionalidades', 'Funcionalidades'], ['#motor', 'Motor'], ['#bancos', 'Bancos'], ['#seguranca', 'Segurança']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                {label}
              </a>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button size="sm" asChild className="shadow-lg shadow-primary/20">
                <Link href="/dashboard">Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-muted-foreground">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild className="shadow-lg shadow-primary/20">
                  <Link href="/login">Começar grátis <ChevronRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-primary/6 rounded-full blur-[160px]" />
          <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-violet-500/4 rounded-full blur-[120px]" />
          <div className="absolute bottom-[5%] left-[-5%] w-[350px] h-[350px] bg-blue-500/4 rounded-full blur-[100px]" />
        </div>

        <div className="container max-w-screen-xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-primary/5 px-4 py-1.5 rounded-full text-xs font-semibold gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Motor v3.0 · 8 Regras · 14 Bancos · Zero IA
                </Badge>

                <h1 className="text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05]">
                  <span className="gradient-text">HOKMA</span>
                  <br />
                  <span className="text-foreground/90">apura renda</span>
                  <br />
                  <span className="text-foreground/90">com precisão</span>
                  <br />
                  <span className="text-foreground/40 text-4xl md:text-5xl xl:text-6xl font-bold">absoluta.</span>
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                Analise extratos bancários de forma 100% determinística. Classificação automática, revisão manual interativa e relatórios auditáveis por hash SHA-256.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleCTA}
                  className="h-12 px-8 text-base font-bold shadow-xl shadow-primary/25"
                >
                  {isLoggedIn ? 'Acessar Dashboard' : 'Criar conta gratuita'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 border-border text-muted-foreground hover:text-foreground" asChild>
                  <a href="#motor">Como funciona</a>
                </Button>
              </div>

              {/* Trust row */}
              <div className="flex flex-wrap gap-5 pt-2">
                {[
                  { icon: CheckCircle, label: 'SHA-256 auditado', color: 'text-emerald-400' },
                  { icon: Lock, label: 'Zero dados compartilhados', color: 'text-blue-400' },
                  { icon: Star, label: '100% determinístico', color: 'text-amber-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className={`h-4 w-4 ${color}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />

              <Card className="relative border-border/60 shadow-2xl shadow-black/50 overflow-hidden bg-card/90 backdrop-blur-sm">
                {/* Window bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/20">
                  <div className="flex gap-1.5">
                    {['bg-red-500/50', 'bg-yellow-500/50', 'bg-green-500/50'].map((c) => (
                      <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                    ))}
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-[11px] text-muted-foreground/60 font-mono">
                      hokma.app/analysis · João da Silva Santos
                    </span>
                  </div>
                </div>

                <CardContent className="p-5 space-y-4 pt-5">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Apurado', value: 'R$ 32.480,00', highlight: true },
                      { label: 'Média Mensal', value: 'R$ 5.413,33', highlight: true },
                      { label: 'Divisão ÷ 6', value: 'R$ 5.413,33', highlight: false },
                      { label: 'Divisão ÷ 12', value: 'R$ 2.706,67', highlight: false },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className={`p-3 rounded-xl border ${m.highlight ? 'border-primary/30 bg-primary/8' : 'border-border bg-muted/20'}`}
                      >
                        <p className="text-[10px] text-muted-foreground mb-1">{m.label}</p>
                        <p className={`text-sm font-bold tabular-nums ${m.highlight ? 'gradient-text' : 'text-foreground'}`}>
                          {m.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Transaction list */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2.5 bg-muted/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Março 2025</span>
                      <span className="text-[11px] font-bold text-primary">R$ 11.200,00</span>
                    </div>
                    {[
                      { d: 'PIX — Empresa Alpha Ltda', v: 'R$ 5.500,00', c: 'CRÉDITO VÁLIDO', on: true },
                      { d: 'TED — Honorários Consultoria', v: 'R$ 3.800,00', c: 'CRÉDITO VÁLIDO', on: true },
                      { d: 'PIX — Salário Freelance', v: 'R$ 1.900,00', c: 'CRÉDITO VÁLIDO', on: true },
                      { d: 'PIX — João da Silva Santos', v: 'R$ 2.000,00', c: 'AUTOTRANSFERÊNCIA', on: false },
                    ].map((tx, i) => (
                      <div key={i} className={`flex items-center px-4 py-2.5 border-t border-border/50 text-[11px] gap-3 ${!tx.on ? 'opacity-40' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${!tx.on ? 'line-through' : ''}`}>{tx.d}</p>
                        </div>
                        <Badge
                          variant={tx.on ? 'default' : 'destructive'}
                          className={`text-[9px] px-1.5 py-0.5 shrink-0 ${tx.on ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : ''}`}
                        >
                          {tx.c}
                        </Badge>
                        <span className="font-bold tabular-nums shrink-0 w-[80px] text-right">{tx.v}</span>
                        <div className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${tx.on ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                          {tx.on && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 font-mono">
                    <span>v3.0.0-interactive · SHA-256: a3f7c2d8e1b4…</span>
                    <span className="text-emerald-400/70 font-semibold">● Auditado</span>
                  </div>
                </CardContent>
              </Card>

              {/* Floating badges */}
              <div className="absolute -bottom-5 -left-5 z-10">
                <Card className="border-emerald-500/30 bg-card shadow-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-400">+23 créditos válidos</p>
                      <p className="text-[9px] text-muted-foreground">de 47 transações brutas</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="absolute -top-5 -right-5 z-10">
                <Card className="border-primary/30 bg-card shadow-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-primary">100% auditável</p>
                      <p className="text-[9px] text-muted-foreground">Hash SHA-256 gravado</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────── */}
      <div className="border-y border-border bg-muted/15">
        <div className="container max-w-screen-xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { v: '14+', l: 'Bancos suportados' },
              { v: '8', l: 'Regras de classificação' },
              { v: 'v3.0', l: 'Versão do algoritmo' },
              { v: '0%', l: 'IA utilizada' },
            ].map(({ v, l }) => (
              <div key={l}>
                <div className="text-4xl font-black gradient-text mb-1">{v}</div>
                <div className="text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section id="funcionalidades" className="py-28 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-muted-foreground border-border text-xs">Funcionalidades</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Tudo para apurar renda com{' '}
              <span className="gradient-text">confiança total</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Construído para analistas de crédito, peritos e profissionais que precisam de resultados rastreáveis e reproduzíveis.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className={`group border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card ${f.border}`}
              >
                <CardHeader className="pb-3">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-3`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed text-sm">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOTOR / HOW IT WORKS ───────────────────────────── */}
      <section id="motor" className="py-28 px-6 border-y border-border bg-muted/10">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="text-muted-foreground border-border text-xs">Como Funciona</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Do PDF ao relatório em{' '}
              <span className="gradient-text">5 etapas</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Processo totalmente automatizado — com pontos de revisão manual para garantir precisão absoluta.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((step, idx) => (
              <Card key={step.num} className="border-border bg-card relative">
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-4 h-px bg-border z-10" />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/50 font-bold">{step.num}</span>
                  </div>
                  <CardTitle className="text-sm leading-tight">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">{step.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-16" />

          {/* 8 Rules */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black">As <span className="gradient-text">8 regras</span> de classificação</h3>
              <p className="text-muted-foreground text-sm">Aplicadas nesta ordem exata, em cascata, a cada transação extraída.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {RULES.map((r, i) => (
                <div key={r.label} className="flex gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 text-xs font-black text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold mb-0.5 ${r.color}`}>{r.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BANKS ──────────────────────────────────────────── */}
      <section id="bancos" className="py-28 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <Badge variant="outline" className="text-muted-foreground border-border text-xs">Compatibilidade</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              <span className="gradient-text">14 bancos</span> com parsers dedicados
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Cada banco tem seu parser específico. Formatos diários, mensais, PDFs textuais e documentos escaneados.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {BANCOS.map((banco) => (
              <div key={banco} className="group flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all cursor-default">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary/70 transition-colors" />
                {banco}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {['Extração por coordenadas Y/X', 'OCR paralelo (até 4 workers)', 'Inferência matemática por saldo', 'Normalização de datas em extenso'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ───────────────────────────────────────── */}
      <section id="seguranca" className="py-28 px-6 border-y border-border bg-muted/10">
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <Badge variant="outline" className="text-muted-foreground border-border text-xs">Auditoria & Segurança</Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                Cada apuração é{' '}
                <span className="gradient-text">100% rastreável</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                O HOKMA foi projetado para ambientes onde a confiabilidade é inegociável. Cada análise gera um registro imutável que permite reproduzir o resultado exato meses depois.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Lock, t: 'Hash SHA-256 do PDF original', d: 'Garante que o documento analisado é exatamente o que foi enviado.', c: 'text-primary' },
                  { icon: FileCheck, t: 'Registro completo de todas as transações', d: 'Inclusive as excluídas — com motivo de exclusão e classificação.', c: 'text-emerald-400' },
                  { icon: Zap, t: 'Versão do algoritmo registrada', d: 'v3.0.0-interactive gravada em cada relatório para reprodutibilidade.', c: 'text-amber-400' },
                ].map(({ icon: Icon, t, d, c }) => (
                  <div key={t} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${c}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-0.5">{t}</h4>
                      <p className="text-sm text-muted-foreground">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit log mockup */}
            <Card className="border-border bg-card overflow-hidden shadow-xl shadow-black/30">
              <CardHeader className="pb-3 bg-muted/20 border-b border-border flex-row items-center gap-3 space-y-0">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <CardTitle className="text-xs font-mono text-muted-foreground font-normal">
                  Registro de Auditoria — income_reports
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 font-mono text-xs space-y-2.5">
                {[
                  ['timestamp', '2025-03-13T14:32:17.000Z', 'text-muted-foreground'],
                  ['pdf_hash', 'a3f7c2d8e1b4f9a2…d8e1', 'text-emerald-400'],
                  ['algoritmo', '3.0.0-interactive', 'text-blue-400'],
                  ['cliente_nome', 'João da Silva Santos', 'text-muted-foreground'],
                  ['total_apurado', 'R$ 32.480,00 (3248000¢)', 'text-primary'],
                  ['media_mensal', 'R$ 5.413,33 (541333¢)', 'text-primary'],
                  ['meses_analisados', '6', 'text-muted-foreground'],
                  ['transacoes_brutas', '47', 'text-muted-foreground'],
                  ['creditos_validos', '23', 'text-emerald-400'],
                  ['excluidos_motor', '24', 'text-orange-400'],
                  ['user_id', 'uuid::auth.users', 'text-muted-foreground/50'],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex gap-2">
                    <span className="text-muted-foreground/40 w-40 shrink-0">{k}:</span>
                    <span className={c}>{v}</span>
                  </div>
                ))}
                <Separator className="my-2" />
                <p className="text-muted-foreground/30 text-[10px]">
                  Salvo em Supabase PostgreSQL · RLS ativo · Imutável
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-primary/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        </div>

        <div className="container max-w-screen-xl mx-auto relative">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-card/60 backdrop-blur-sm shadow-2xl shadow-black/30 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <CardHeader className="pb-4 pt-10">
              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
                    <rect x="4" y="4" width="12" height="12" rx="2" className="fill-primary" />
                    <rect x="20" y="4" width="12" height="12" rx="2" className="fill-primary opacity-60" />
                    <rect x="4" y="20" width="12" height="12" rx="2" className="fill-primary opacity-60" />
                    <rect x="20" y="20" width="12" height="12" rx="2" className="fill-primary" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-black tracking-tight">
                Comece a apurar com{' '}
                <span className="gradient-text">HOKMA</span>
              </CardTitle>
              <CardDescription className="text-base mt-3 max-w-md mx-auto">
                A plataforma que analistas de crédito confiam para resultados determinísticos, auditáveis e reproduzíveis.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-10 space-y-4">
              <Button size="lg" onClick={handleCTA} className="h-12 px-10 text-base font-bold shadow-xl shadow-primary/25">
                {isLoggedIn ? 'Acessar Dashboard' : 'Criar conta gratuita'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-xs text-muted-foreground/50">
                Sem cartão de crédito · Sem compromisso · 100% gratuito para começar
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="container max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <svg viewBox="0 0 36 36" className="w-full h-full" fill="none">
                <rect x="4" y="4" width="12" height="12" rx="2" className="fill-primary" />
                <rect x="20" y="4" width="12" height="12" rx="2" className="fill-primary opacity-50" />
                <rect x="4" y="20" width="12" height="12" rx="2" className="fill-primary opacity-50" />
                <rect x="20" y="20" width="12" height="12" rx="2" className="fill-primary" />
              </svg>
            </div>
            <div>
              <span className="font-black text-sm">HOKMA</span>
              <span className="text-xs text-muted-foreground ml-2">v3.0.0</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/50 text-center">
            Zero IA · Zero Heurísticas · 100% Determinístico · © 2025 Kaizen Axis
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground/50">
            <Link href="/login" className="hover:text-muted-foreground transition-colors">Entrar</Link>
            <a href="#funcionalidades" className="hover:text-muted-foreground transition-colors">Funcionalidades</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
