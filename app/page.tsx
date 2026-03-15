'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, Shield, LayoutDashboard,
  Clock, FileSearch, TrendingUp, ChevronRight, Hexagon,
  Menu, AlertTriangle, X, Lock as LockIcon, Star, Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

/* ─── Framer-motion variants ───────────────────────────────────────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
};
const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

/* ─── Navbar ────────────────────────────────────────────────────────── */
function NavBar({ isLoggedIn, onCTA, menuOpen, setMenuOpen }: {
  isLoggedIn: boolean; onCTA: () => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <header className={cn(
      'fixed top-0 z-50 w-full transition-all duration-500',
      scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl shadow-black/70' : 'bg-transparent py-5'
    )}>
      <div className="max-w-screen-xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-blue-500 transform rotate-45 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:bg-blue-400 transition-colors duration-300">
            <Hexagon className="h-4 w-4 text-white fill-white -rotate-45" />
          </div>
          <span className="font-bold text-xl tracking-tighter text-white">HOKMA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 bg-white/5 backdrop-blur-md px-8 py-2.5 rounded-full border border-white/10">
          {[['#como-funciona','Como Funciona'],['#features','Vantagens'],['#pricing','Preços']].map(([h,l]) => (
            <a key={h} href={h} className="text-sm font-medium text-zinc-400 hover:text-blue-400 transition-colors">{l}</a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <button onClick={onCTA} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5">
              Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4">Entrar</Link>
              <button onClick={onCTA} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg shadow-blue-600/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5">
                Começar Grátis <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 px-6 py-6 flex flex-col gap-5">
          {['#como-funciona','#features','#pricing'].map((h, i) => (
            <a key={h} href={h} onClick={() => setMenuOpen(false)} className="text-lg font-medium text-zinc-300">{['Como Funciona','Vantagens','Preços'][i]}</a>
          ))}
          <div className="h-px bg-white/10" />
          <button onClick={onCTA} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">
            {isLoggedIn ? 'Acessar Dashboard' : 'Iniciar Teste de 7 Dias'}
          </button>
        </motion.div>
      )}
    </header>
  );
}

/* ─── Hero Scroll Sequence ──────────────────────────────────────────── */
/* ─── 40 hero frames ─────────────────────────────────────────────────── */
// Frames are stored in public/images/ (ezgif-frame-001.png … 040.png)
const HERO_IMAGES: string[] = Array.from({ length: 40 }, (_, i) => {
  const n = String(i + 1).padStart(3, '0');
  return `/images/ezgif-frame-${n}.png`;
});

// Labels shown on the step dots (every 5th frame gets a label)
const HERO_LABELS = ['Upload', '', '', '', 'Processando', '', '', '', '', 'Dashboard', '', '', '', '', 'Acordeão', '', '', '', '', 'Métricas', '', '', '', '', 'Exportar', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];

function HeroSequence({ isLoggedIn, onCTA }: { isLoggedIn: boolean; onCTA: () => void }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const fn = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const h = wrapperRef.current.offsetHeight;
      const p = Math.max(0, Math.min(1, (-rect.top) / (h - window.innerHeight)));
      setIdx(Math.round(p * (HERO_IMAGES.length - 1)));
    };
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: `${HERO_IMAGES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-blue-700/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
          {/* Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a5f15_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f15_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
        </div>

        <div className="max-w-screen-xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-16 pt-20">
          {/* LEFT: Copy */}
          <motion.div
            initial="hidden" animate="visible" variants={stagger}
            className="w-full lg:w-[45%] flex flex-col items-start"
          >
            <motion.div variants={fadeUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-blue-500/40 bg-blue-500/10 text-blue-400 font-mono text-xs tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                Motor v3.0 · Determinístico
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-6">
              Apure rendimentos em{' '}
              <span className="relative inline-block text-blue-400">
                segundos
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-blue-500/40 rounded-full blur-sm" />
              </span>, não em horas.
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-zinc-400 font-light leading-relaxed mb-10 max-w-lg">
              A plataforma definitiva para auditores e correspondentes jurídicos.{' '}
              <span className="text-white font-medium">Precisão de 99.9%</span>. Nenhuma IA adivinhando números.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={onCTA}
                className="group flex items-center justify-center gap-2 px-8 py-4 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-700/40 hover:shadow-blue-500/60 transition-all hover:-translate-y-0.5 animate-glow-pulse"
              >
                {isLoggedIn ? 'Acessar Workspace' : 'Iniciar Teste de 7 Dias Grátis'}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold border border-white/15 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
              >
                Ver como funciona ↓
              </button>
            </motion.div>

            {/* Bank marquee */}
            <motion.div variants={fadeUp} className="mt-14 w-full max-w-[420px] overflow-hidden relative opacity-50 hover:opacity-100 transition-opacity duration-500">
              {/* Fade masks */}
              <div className="absolute left-0 inset-y-0 w-12 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
              <div className="absolute right-0 inset-y-0 w-12 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />
              {/* Track — duplicated for seamless loop */}
              <div className="flex gap-10 items-center animate-scroll whitespace-nowrap w-max">
                {[...Array(2)].flatMap((_, d) =>
                  ['Nubank','Itaú','Bradesco','Caixa','Santander','Inter','Neon','C6 Bank'].map((b) => (
                    <span key={`${d}-${b}`} className="font-bold text-base text-zinc-300">{b}</span>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Mockup Frame */}
          <div className="hidden lg:flex w-[55%] flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[780px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.15)] bg-zinc-950"
            >
              {/* Browser chrome */}
              <div className="h-10 bg-zinc-900 border-b border-white/10 flex items-center px-4 gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="flex-1 text-center font-mono text-xs text-zinc-500">hokma.app/dashboard</span>
              </div>

              {/* Sequence frames — real images from public/images/ */}
              <div className="relative h-[420px] bg-zinc-950 overflow-hidden">
                {HERO_IMAGES.map((src, i) => (
                  <motion.div
                    key={src}
                    animate={{ opacity: idx === i ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                    style={{ pointerEvents: idx === i ? 'auto' : 'none' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Frame ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Step progress dots — show milestone every ~5 frames */}
            <div className="flex items-center gap-2 mt-5">
              {Array.from({ length: 8 }, (_, i) => {
                const mileIdx = Math.floor((i / 7) * (HERO_IMAGES.length - 1));
                const isActive = idx >= mileIdx && (i === 7 || idx < Math.floor(((i + 1) / 7) * (HERO_IMAGES.length - 1)));
                return (
                  <motion.div
                    key={i}
                    animate={{ backgroundColor: isActive ? '#3b82f6' : '#27272a', width: isActive ? 24 : 8 }}
                    transition={{ duration: 0.25 }}
                    className="h-2 rounded-full"
                    style={{ boxShadow: isActive ? '0 0 10px rgba(59,130,246,0.6)' : 'none' }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function HokmaLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => { if (data.session) setIsLoggedIn(true); });
  }, []);

  const onCTA = () => router.push(isLoggedIn ? '/dashboard' : '/login');

  /* helper: section wrapper */
  const Sec = ({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) => (
    <section id={id} className={`py-28 ${className}`}>
      <div className="max-w-screen-xl mx-auto px-6">{children}</div>
    </section>
  );

  /* Reusable section heading */
  const SectionHead = ({ label, title, sub }: { label?: string; title: string; sub?: string }) => (
    <div className="text-center mb-16 max-w-3xl mx-auto">
      {label && <p className="font-mono text-xs tracking-widest uppercase text-blue-400 mb-4">{label}</p>}
      <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">{title}</h2>
      {sub && <p className="text-xl text-zinc-400 font-light">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-blue-500/30">

      {/* Google fonts */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');` }} />

      <NavBar isLoggedIn={isLoggedIn} onCTA={onCTA} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* HERO */}
      <HeroSequence isLoggedIn={isLoggedIn} onCTA={onCTA} />

      {/* ── KPI STRIP ───────────────────────────────────────────────── */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-screen-xl mx-auto px-6 py-6 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { v: '35h/mês', l: 'Salvas por auditor' },
            { v: '99,9%',   l: 'Precisão comprovada' },
            { v: '15+',     l: 'Bancos suportados' },
          ].map((m, i) => (
            <div key={i} className="flex flex-col items-center py-6 md:py-0 gap-1">
              <span className="font-mono text-4xl font-bold text-blue-400">{m.v}</span>
              <span className="text-sm font-medium uppercase tracking-widest text-zinc-500">{m.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEMA ──────────────────────────────────────────────────── */}
      <Sec id="problema" className="bg-zinc-950">
        <SectionHead title="Ainda faz apurações na mão?" sub="A auditoria artesanal consome horas preciosas e expõe você a erros críticos e irrastreáveis." />
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: 'Horas desperdiçadas', desc: 'Digitar linha por linha no Excel consome dezenas de horas por cliente. 35h/mês em média perdidas por auditor.', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/40' },
            { icon: AlertTriangle, title: 'Erro humano inevitável', desc: 'Um simples erro de digitação invalida toda a estrutura de apuração — potencialmente comprometendo um processo judicial.', color: 'text-red-400', bg: 'bg-red-500/10', border: 'hover:border-red-500/40' },
            { icon: FileSearch, title: 'PDFs impossíveis', desc: 'Scans borrados, tabelas fora de ordem, formatos trocados entre bancos — qualquer planilha manual quebra aqui.', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/40' },
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className={`p-8 bg-zinc-900 border border-white/5 ${c.border} transition-all duration-300 hover:-translate-y-2 group`}
            >
              <div className={`w-14 h-14 ${c.bg} ${c.color} flex items-center justify-center mb-6 rounded-xl`}>
                <c.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{c.title}</h3>
              <p className="text-zinc-400 font-light leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </Sec>

      {/* ── PIPELINE ──────────────────────────────────────────────────── */}
      <Sec id="como-funciona" className="bg-black border-y border-white/5">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Steps */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="font-mono text-xs tracking-widest uppercase text-blue-400 mb-4">Pipeline de Processamento</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
              Transformando caos em <span className="text-blue-400">matrizes rastreáveis.</span>
            </h2>
            <p className="text-xl text-zinc-400 font-light mb-12">Zero IA generativa. Cada decisão é mapeada e auditável com log de motivo.</p>
            <div className="space-y-8">
              {[
                { title: 'Upload do PDF', desc: 'SHA-256 gerado automaticamente. Banco detectado por fingerprint.' },
                { title: 'Classificação em 8 Regras', desc: 'Filtra estornos, apostas (BETs), autotransferências e wash trading com precisão matemática.' },
                { title: 'Dashboard + Exportação', desc: 'Acordeão mensal, toggles manuais e exportação em PDF ou CSV.' },
              ].map((s, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex-shrink-0 w-12 h-12 bg-zinc-900 border border-white/10 group-hover:border-blue-500 group-hover:bg-blue-600 font-mono font-bold text-xl flex items-center justify-center rounded-xl transition-all duration-300">
                    <span className="group-hover:text-white text-zinc-400 transition-colors">0{i + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{s.title}</h4>
                    <p className="text-zinc-400 font-light leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Animated demo card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.08)]">
              <div className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Processando extrato Nubank — Mar 2025</span>
              </div>

              <div className="p-6 space-y-3 font-mono text-sm">
                {[
                  { icon: '✓', text: 'PIX RECEBIDO — EMPRESA ALFA LTDA', val: '+R$ 8.500', c: 'text-emerald-400', d: '0.3s' },
                  { icon: '✓', text: 'SALÁRIO MARÇO/2025', val: '+R$ 4.200', c: 'text-emerald-400', d: '0.9s' },
                  { icon: '✕', text: 'TRANSFERÊNCIA PARA CONTA PRÓPRIA', val: 'R$ 2.000', c: 'text-red-400', d: '1.5s', line: true },
                  { icon: '✕', text: 'BETANO APOSTAS ONLINE', val: 'R$ 300', c: 'text-red-400', d: '2.1s', line: true },
                  { icon: '⚠', text: 'PIX — MARIA SILVA (VÍNCULO?)', val: '+R$ 1.500', c: 'text-yellow-400', d: '2.7s' },
                ].map((t, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between border-b border-white/5 pb-3 animate-tx-slide',
                      t.line && 'opacity-50 line-through'
                    )}
                    style={{ animationDelay: t.d, animationFillMode: 'both' }}
                  >
                    <span className="flex gap-3 items-center">
                      <span className={t.c}>{t.icon}</span>
                      <span className="text-zinc-300">{t.text}</span>
                    </span>
                    <span className={cn('font-bold', t.c)}>{t.val}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 px-6 py-4 flex justify-between items-center bg-blue-950/30 animate-tx-slide" style={{ animationDelay: '3.5s', animationFillMode: 'both' }}>
                <span className="font-mono text-sm text-zinc-400">Renda Apurada:</span>
                <span className="font-mono text-xl font-bold text-white">R$ 14.200,00 <span className="text-blue-400 text-sm">÷6 = R$2.367</span></span>
              </div>
            </div>
          </motion.div>
        </div>
      </Sec>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <Sec id="features" className="bg-zinc-950">
        <SectionHead label="Vantagens" title="Auditoria levada a sério." sub="Ferramentas de engenharia projetadas com rigor técnico e legal." />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { n: '01', t: '15+ Bancos Mapeados', d: 'Itaú, Bradesco, Nubank, Santander, C6, Neon, PicPay, Revolut e mais. Atualizações constantes.' },
            { n: '02', t: 'OCR Nativo Integrado', d: 'PDFs escaneados? Tesseract em Web Workers extrai strings com precisão sem digitação manual.' },
            { n: '03', t: 'Motor Determinístico', d: '100% auditável. Sem heurísticas. Resultado consistente, repetível e rastreável.' },
            { n: '04', t: 'Deduplicação Automática', d: 'Fingerprint SHA-256 elimina duplicatas de PDFs com comprovantes sobrepostos.' },
            { n: '05', t: 'Anti Wash Trading', d: 'Detecta loops financeiros "entra e sai" no mesmo dia que inflam a renda artificialmente.' },
            { n: '06', t: 'Exportação Profissional', d: 'Relatório PDF nativo formatado, ou CSV estruturado com todas as classificações e motivos.' },
          ].map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="p-8 bg-zinc-900 border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <p className="font-mono text-3xl font-bold text-blue-500/50 group-hover:text-blue-500 transition-colors mb-5">{f.n}</p>
              <h4 className="text-xl font-bold text-white mb-3">{f.t}</h4>
              <p className="text-zinc-400 font-light leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </Sec>

      {/* ── BANKS MARQUEE ─────────────────────────────────────────────── */}
      <div className="py-12 border-y border-white/5 bg-black overflow-hidden relative">
        <p className="text-center font-mono text-xs tracking-widest uppercase text-zinc-600 mb-8">Bancos Suportados</p>
        <div className="absolute left-0 inset-y-8 w-32 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute right-0 inset-y-8 w-32 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />
        <div className="flex gap-14 items-center animate-scroll whitespace-nowrap w-max opacity-50 hover:opacity-100 transition-opacity duration-500">
          {[...Array(2)].flatMap((_, d) => [
            { name: 'Nubank', color: '#8A05BE' },
            { name: 'Itaú', color: '#EC7000' },
            { name: 'Bradesco', color: '#CC092F' },
            { name: 'CAIXA', color: '#F39200' },
            { name: 'Banco do Brasil', color: '#F8D117' },
            { name: 'Inter', color: '#FF7A00' },
            { name: 'Mercado Pago', color: '#009EE3' },
            { name: 'PagBank', color: '#90c53e' },
            { name: 'Next', color: '#00FF5F' },
            { name: 'C6 Bank', color: '#E0E0E0' },
            { name: 'Neon', color: '#00E5FF' },
            { name: 'PicPay', color: '#11C76F' },
            { name: 'Santander', color: '#EC0000' },
            { name: 'InfinitePay', color: '#FFFFFF' },
          ].map(b => (
            <span key={`${d}-${b.name}`} className="font-bold text-lg tracking-tight" style={{ color: b.color }}>
              {b.name}
            </span>
          )))}
        </div>
      </div>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <Sec id="pricing" className="bg-zinc-950">
        <SectionHead title="Investimento único. Retorno absoluto." sub="Assinatura fixa, sem limite de páginas ou tarifas escondidas." />

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-zinc-900 border border-white/10 rounded-full p-1.5">
            {(['Mensal', 'Anual'] as const).map((l, i) => (
              <button
                key={l}
                onClick={() => setIsAnnual(i === 1)}
                className={cn(
                  'px-7 py-2.5 rounded-full text-sm font-semibold transition-all',
                  (i === 1) === isAnnual ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
                )}
              >
                {l} {i === 1 && <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase font-bold">-16%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Essencial */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-zinc-900 border border-white/10 p-10 rounded-2xl flex flex-col hover:border-white/20 transition-colors">
            <h3 className="text-xl font-bold text-zinc-300 mb-2">Plano Essencial</h3>
            <p className="text-zinc-500 font-light mb-8 leading-relaxed">Análise de extratos para operações menores.</p>
            <div className="mb-10">
              <motion.div key={isAnnual ? 'a' : 'm'} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <span className="text-zinc-400 text-xl">R$ </span>
                <span className="font-mono font-bold text-5xl text-white">{isAnnual ? '499' : '49'}</span>
                <span className="text-white text-2xl font-bold">,90</span>
                <span className="text-zinc-500 ml-2">/{isAnnual ? 'ano' : 'mês'}</span>
              </motion.div>
            </div>
            <ul className="flex-1 space-y-4 mb-10">
              {['Apurações ilimitadas', 'Motor OCR 3.0', 'Filtro em 8 regras', 'Exportação PDF'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-400"><CheckCircle2 className="w-5 h-5 text-zinc-600 shrink-0" /> {f}</li>
              ))}
            </ul>
            <button onClick={onCTA} className="w-full py-4 rounded-xl border border-white/15 hover:bg-white/5 font-bold transition-colors">Assinar Essencial</button>
          </motion.div>

          {/* Premium */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="relative bg-zinc-900 border border-blue-500/50 p-10 rounded-2xl flex flex-col shadow-[0_0_40px_rgba(59,130,246,0.08)]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-blue-700/40">Mais Popular</span>
            </div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl" />
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Star className="w-5 h-5 text-blue-400 fill-blue-400" /> Premium Workstation</h3>
            <p className="text-zinc-400 font-light mb-8 leading-relaxed">Fluxo ilimitado, suporte VIP e relatórios completos.</p>
            <div className="mb-10">
              <motion.div key={isAnnual ? 'a2' : 'm2'} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <span className="text-blue-400 text-xl">R$ </span>
                <span className="font-mono font-bold text-5xl text-white">{isAnnual ? '499' : '49'}</span>
                <span className="text-white text-2xl font-bold">,90</span>
                <span className="text-zinc-500 ml-2">/{isAnnual ? 'ano' : 'mês'}</span>
              </motion.div>
            </div>
            <ul className="flex-1 space-y-4 mb-10">
              {['7 Dias de Teste Grátis', 'PDFs sem limite de páginas', 'Suporte Prioritário VIP', 'Exportação PDF + CSV', 'Atualizações garantidas'].map((f) => (
                <li key={f} className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> {f}</li>
              ))}
            </ul>
            <button onClick={onCTA} className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-700/40 hover:shadow-blue-500/50 transition-all animate-glow-pulse">
              Iniciar Teste de 7 Dias
            </button>
          </motion.div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm font-mono text-zinc-500">
          <span className="flex items-center gap-2"><LockIcon className="w-4 h-4" /> Pagamento seguro via Stripe</span>
          <span className="flex items-center gap-2 text-emerald-500"><CheckCircle2 className="w-4 h-4" /> 7 diasgrátis</span>
          <span>Cancele quando quiser</span>
        </div>
      </Sec>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-700/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Pronto para a nova era da auditoria?</h2>
          <p className="text-xl text-zinc-400 font-light mb-12">Abandone as planilhas. Eleve o patamar de confiança das suas apurações agora.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onCTA} className="px-10 py-4 text-base font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all hover:-translate-y-0.5">
              Começar 7 Dias Grátis
            </button>
            <button className="px-10 py-4 text-base font-semibold border border-white/15 hover:bg-white/5 text-zinc-300 rounded-full transition-all">
              Falar com a equipe
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="bg-zinc-950 py-12 border-t border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 transform rotate-45 flex items-center justify-center">
              <Hexagon className="h-3 w-3 text-white fill-white -rotate-45" />
            </div>
            <span className="font-bold text-base text-white tracking-tighter">HOKMA</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-blue-400 transition-colors">Termos</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
            <a href="mailto:contato@hokma.app" className="hover:text-blue-400 transition-colors">Suporte</a>
          </div>
          <p className="font-mono text-xs text-zinc-600">© {new Date().getFullYear()} Hokma Fintech Ltda.</p>
        </div>
      </footer>
    </div>
  );
}
