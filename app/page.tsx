'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Shield, Zap, FileCheck, Building2,
  ChevronRight, ArrowRight, CheckCircle, Lock,
  Cpu, Database, Upload, Eye, RefreshCw, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';

const BANCOS = [
  'Itaú', 'Bradesco', 'Nubank', 'Santander', 'Caixa Econômica',
  'Banco do Brasil', 'Banco Inter', 'Neon', 'Mercado Pago',
  'Revolut', 'PicPay', 'C6 Bank', 'BTG Pactual', 'Sicoob',
];

const FEATURES = [
  {
    icon: Cpu,
    title: '8 Regras em Cascata',
    desc: 'Motor determinístico com oito regras de classificação aplicadas em sequência. Zero inteligência artificial, zero probabilidades.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  {
    icon: Shield,
    title: 'Auditoria SHA-256',
    desc: 'Cada PDF recebe um hash criptográfico único. Qualquer alteração no documento é detectada automaticamente.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20',
  },
  {
    icon: Building2,
    title: '14 Bancos Suportados',
    desc: 'Itaú, Bradesco, Nubank, Santander, Caixa, BB, Inter, Neon, Mercado Pago, Revolut e mais. Multi-formato.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
  },
  {
    icon: Eye,
    title: 'Revisão Manual Interativa',
    desc: 'Interface com toggles por transação e exclusão por palavras-chave. Recalcula métricas em tempo real.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
  },
  {
    icon: Database,
    title: 'Persistência Completa',
    desc: 'Todos os relatórios salvos no Supabase com transações completas, hash e versão do algoritmo.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
  },
  {
    icon: RefreshCw,
    title: 'OCR Automático',
    desc: 'PDFs escaneados? Sem problema. Tesseract.js processa via Web Workers paralelos com escala 2x.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/20',
  },
];

const STEPS = [
  { num: '01', icon: Upload, title: 'Upload do PDF', desc: 'Arraste ou selecione o extrato bancário. Limite de 15MB.' },
  { num: '02', icon: Cpu, title: 'Extração Automática', desc: 'PDF.js extrai o texto por coordenadas Y/X. OCR como fallback para documentos escaneados.' },
  { num: '03', icon: BarChart3, title: 'Classificação', desc: '8 regras em cascata: débitos, apostas, estornos, autotransferências, vínculos familiares e créditos válidos.' },
  { num: '04', icon: Eye, title: 'Revisão Interativa', desc: 'Ative/desative transações individualmente. Exclua por palavras-chave. Métricas recalculadas ao vivo.' },
  { num: '05', icon: Save, title: 'Relatório Auditável', desc: 'Total apurado, média mensal, divisão por 6 e 12 meses. Tudo salvo com hash e timestamp.' },
];

const METRICS = [
  { label: 'Bancos Suportados', value: '14+' },
  { label: 'Regras de Classificação', value: '8' },
  { label: 'Algoritmo Versão', value: 'v3.0' },
  { label: 'Zero IA Utilizada', value: '100%' },
];

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  const handleCTA = () => {
    router.push(isLoggedIn ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-screen-xl mx-auto flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                <div className="bg-primary rounded-[1px] w-full h-full" />
                <div className="bg-primary/40 rounded-[1px] w-full h-full" />
                <div className="bg-primary/40 rounded-[1px] w-full h-full" />
                <div className="bg-primary rounded-[1px] w-full h-full" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight">Motor de Apuração</span>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#bancos" className="hover:text-foreground transition-colors">Bancos</a>
            <a href="#seguranca" className="hover:text-foreground transition-colors">Segurança</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button size="sm" asChild>
                <Link href="/dashboard">Acessar Plataforma <ArrowRight className="h-3.5 w-3.5 ml-1.5" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">Começar <ChevronRight className="h-3.5 w-3.5 ml-1" /></Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="container max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: text */}
            <div className="space-y-8">
              <div>
                <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 text-xs px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 animate-pulse inline-block" />
                  Motor v3.0 · Zero IA · 14 Bancos Homologados
                </Badge>

                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                  Apuração de Renda{' '}
                  <span className="gradient-text">Automatizada</span>{' '}
                  e Auditável
                </h1>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Analise extratos bancários com precisão absoluta. Motor determinístico com 8 regras de classificação em cascata — sem inteligência artificial, sem probabilidades, 100% confiável.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleCTA} className="font-semibold text-base h-12 px-8 shadow-lg shadow-primary/20">
                  {isLoggedIn ? 'Acessar Plataforma' : 'Começar Gratuitamente'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 border-border">
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 pt-2">
                {['SHA-256 Auditado', 'Zero Dados Vazados', 'Código Determinístico'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl" />
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                {/* Mockup header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <span className="text-[11px] text-muted-foreground bg-muted/50 rounded px-3 py-0.5">
                      Síntese Financeira — João da Silva
                    </span>
                  </div>
                </div>

                {/* Mockup content */}
                <div className="p-5 space-y-4">
                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Apurado', value: 'R$ 24.850,00', highlight: true },
                      { label: 'Média Mensal', value: 'R$ 4.141,00', highlight: true },
                      { label: 'Divisão por 6 Meses', value: 'R$ 4.141,00', highlight: false },
                      { label: 'Divisão por 12 Meses', value: 'R$ 2.070,00', highlight: false },
                    ].map((m) => (
                      <div key={m.label} className={`rounded-xl p-3 border ${m.highlight ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'}`}>
                        <p className="text-[10px] text-muted-foreground mb-1">{m.label}</p>
                        <p className={`text-sm font-bold tabular-nums ${m.highlight ? 'text-primary' : ''}`}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Transactions */}
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-muted/30 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                      <span>Março 2025</span>
                      <span className="text-primary">R$ 8.500,00</span>
                    </div>
                    {[
                      { desc: 'PIX Recebido - Empresa XYZ Ltda', val: 'R$ 5.000,00', tag: 'CRÉDITO VÁLIDO', active: true },
                      { desc: 'TED - Pagamento Freelance', val: 'R$ 2.300,00', tag: 'CRÉDITO VÁLIDO', active: true },
                      { desc: 'Salário - Consultoria ABC', val: 'R$ 1.200,00', tag: 'CRÉDITO VÁLIDO', active: true },
                      { desc: 'PIX Enviado - Conta Própria', val: 'R$ 800,00', tag: 'AUTOTRANSFERÊNCIA', active: false },
                    ].map((tx, i) => (
                      <div key={i} className={`flex items-center justify-between px-3 py-2.5 border-t border-border text-[11px] ${!tx.active ? 'opacity-50' : ''}`}>
                        <div className="min-w-0 flex-1 pr-2">
                          <p className={`font-medium truncate ${!tx.active ? 'line-through text-muted-foreground' : ''}`}>{tx.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${tx.active ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive'}`}>
                            {tx.tag}
                          </span>
                          <span className="font-semibold tabular-nums text-foreground">{tx.val}</span>
                          <div className={`w-4 h-4 rounded-full border flex-shrink-0 ${tx.active ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 pt-1">
                    <span>Motor v3.0.0-interactive · SHA-256 auditado</span>
                    <span className="text-green-400/80">● Processado</span>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-green-500/30 rounded-xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-green-400">Análise Concluída</p>
                    <p className="text-[9px] text-muted-foreground">6 meses · 47 transações</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── METRICS BAR ────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/20">
        <div className="container max-w-screen-xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {METRICS.map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">{m.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-border text-muted-foreground text-xs">
              Funcionalidades
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Tudo que você precisa para{' '}
              <span className="gradient-text">apurar renda</span> com precisão
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Uma plataforma completa construída para profissionais de crédito que precisam de resultados confiáveis e auditáveis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`group relative p-6 rounded-2xl border bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${f.border}`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-5`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6 bg-muted/10 border-y border-border">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-border text-muted-foreground text-xs">
              Como Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Do PDF ao relatório em{' '}
              <span className="gradient-text">segundos</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Cinco etapas automatizadas, da extração do texto até o relatório final com todas as métricas.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-0px)] w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative z-10 flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/60">{step.num}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BANKS ──────────────────────────────────────────────── */}
      <section id="bancos" className="py-24 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-border text-muted-foreground text-xs">
              Compatibilidade
            </Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              <span className="gradient-text">14 bancos</span> homologados
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Parsers dedicados para cada banco. Formato diário, mensal, PDF textual e OCR para documentos escaneados.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {BANCOS.map((banco) => (
              <div
                key={banco}
                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full text-sm font-medium hover:border-primary/30 hover:bg-primary/5 transition-all cursor-default"
              >
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {banco}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {['Parser por coordenadas Y/X', 'OCR com Tesseract.js', 'Inferência por saldo (Bradesco)', 'Detecção automática de formato'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ───────────────────────────────────────────── */}
      <section id="seguranca" className="py-24 px-6 bg-muted/10 border-y border-border">
        <div className="container max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-border text-muted-foreground text-xs">
                Segurança & Auditoria
              </Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                Rastreável do início{' '}
                <span className="gradient-text">ao fim</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Cada apuração gera um registro imutável com hash SHA-256 do documento original, timestamp, versão do algoritmo e a lista completa de todas as transações com suas classificações.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Lock, title: 'Hash SHA-256 do PDF', desc: 'Garante que o documento não foi alterado após a análise.' },
                  { icon: FileCheck, title: 'Registro completo de transações', desc: 'Todas as transações, inclusive as excluídas, ficam salvas com o motivo da exclusão.' },
                  { icon: Cpu, title: 'Versão do algoritmo registrada', desc: 'v3.0.0-interactive gravada em cada relatório para reprodutibilidade futura.' },
                ].map((s) => (
                  <div key={s.title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <s.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-0.5">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit log mockup */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/30">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">Registro de Auditoria</span>
              </div>
              <div className="p-5 font-mono text-xs space-y-3">
                {[
                  { key: 'timestamp', val: '2025-03-13T14:32:17Z', color: 'text-muted-foreground' },
                  { key: 'pdf_hash', val: 'a3f7c2d8e1b4...9f2a', color: 'text-green-400' },
                  { key: 'algoritmo', val: '3.0.0-interactive', color: 'text-blue-400' },
                  { key: 'total_apurado', val: 'R$ 24.850,00', color: 'text-primary' },
                  { key: 'media_mensal', val: 'R$ 4.141,67', color: 'text-primary' },
                  { key: 'meses_analisados', val: '6', color: 'text-muted-foreground' },
                  { key: 'transacoes_brutas', val: '47', color: 'text-muted-foreground' },
                  { key: 'creditos_validos', val: '23', color: 'text-green-400' },
                  { key: 'excluidos', val: '24', color: 'text-orange-400' },
                  { key: 'cliente', val: 'João da Silva Santos', color: 'text-muted-foreground' },
                ].map((row) => (
                  <div key={row.key} className="flex gap-2">
                    <span className="text-muted-foreground/50 w-36 shrink-0">{row.key}:</span>
                    <span className={row.color}>{row.val}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50 text-muted-foreground/40 text-[10px]">
                  ✓ Salvo em Supabase · Imutável
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container max-w-screen-xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Comece a apurar com{' '}
              <span className="gradient-text">precisão absoluta</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              A ferramenta que profissionais de crédito confiam para análise determinística de renda. Zero IA, 100% auditável.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleCTA} className="font-semibold text-base h-12 px-10 shadow-xl shadow-primary/20">
                {isLoggedIn ? 'Acessar Plataforma' : 'Criar Conta Gratuita'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground/60">
              Sem cartão de crédito. Sem compromisso.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="container max-w-screen-xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-0.5 w-2.5 h-2.5">
                  <div className="bg-primary rounded-[1px]" />
                  <div className="bg-primary/40 rounded-[1px]" />
                  <div className="bg-primary/40 rounded-[1px]" />
                  <div className="bg-primary rounded-[1px]" />
                </div>
              </div>
              <span className="text-sm font-semibold">Motor de Apuração de Renda</span>
              <span className="text-xs text-muted-foreground/60 ml-1">v3.0.0</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground/60">
              <span>Zero IA · Zero Heurísticas · 100% Determinístico</span>
              <span>© 2025 Kaizen Axis</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
