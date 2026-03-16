'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, Shield, LayoutDashboard,
  Clock, FileSearch, TrendingUp, ChevronRight, Hexagon,
  Menu, AlertTriangle, X, Lock as LockIcon, Star, Database, Zap,
  SearchCode, GitMerge, RefreshCwOff, FileDown, ShieldCheck, FileWarning
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

/* ─── SCROLL CANVAS ANIMATION & PRELOADER ────────────────────────────── */
const TOTAL_FRAMES = 80;
const S3_BASE_URL = "https://buildix-user-images.s3.us-east-2.amazonaws.com/scroll-animations/temp-1773615647215/f2d53568-a23c-4d16-9552-8552b27b84a1/frame_";

function LoadingScreen({ onComplete }: { onComplete: (images: HTMLImageElement[]) => void }) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [loadingText, setLoadingText] = useState('Lendo PDFs brutos 0%...');
  const [images] = useState<HTMLImageElement[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let count = 0;
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, '0');
      img.src = `${S3_BASE_URL}${frameNum}.jpg`;

      img.onload = () => {
        count++;
        setLoadedCount(count);
        const percent = Math.floor((count / TOTAL_FRAMES) * 100);

        if (percent < 30) setLoadingText(`Lendo PDFs brutos ${percent}%...`);
        else if (percent < 60) setLoadingText(`Aplicando regras de OCR ${percent}%...`);
        else if (percent < 90) setLoadingText(`Mapeando transações ${percent}%...`);
        else setLoadingText(`Finalizando matriz ${percent}%...`);

        if (count === TOTAL_FRAMES) {
          setTimeout(() => {
            setFinished(true);
            onComplete(images);
          }, 500); // give it a tiny delay for smoothness
        }
      };
      images.push(img);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (finished) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col justify-center items-center transition-opacity duration-500",
        "bg-gradient-to-br from-[#050505] to-[#1e3a8a]"
      )}
    >
      <div className="mb-4 relative">
        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full animate-pulse" />
        <Hexagon className="text-white relative z-10 animate-[spin_4s_linear_infinite] w-16 h-16" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight uppercase font-sans">HOKMA</h2>
      <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full bg-white transition-all duration-100 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ width: `${(loadedCount / TOTAL_FRAMES) * 100}%` }}
        />
      </div>
      <p className="text-white/80 mt-3 text-xs font-mono tracking-widest uppercase">{loadingText}</p>
    </div>
  );
}

function CanvasScrollHero({ images }: { images: HTMLImageElement[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const [t1Style, setT1Style] = useState({ opacity: 1, transform: `translateY(-50%)`, pointerEvents: 'auto' as any });
  const [t2Style, setT2Style] = useState({ opacity: 0, transform: `translateY(46px) scale(0.95)`, pointerEvents: 'none' as any });
  const [t3Style, setT3Style] = useState({ opacity: 0, transform: `translateY(100px)`, pointerEvents: 'none' as any });

  const drawCover = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset dimensions for DPI sharpness (basic setup)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let renderWidth, renderHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      renderHeight = canvas.height;
      renderWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - renderWidth) / 2;
      offsetY = 0;
    } else {
      renderWidth = canvas.width;
      renderHeight = img.height * (canvas.width / img.width);
      offsetX = 0;
      offsetY = (canvas.height - renderHeight) / 2;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
  };

  useEffect(() => {
    if (images.length === 0) return;

    // draw first frame immediately
    drawCover(images[0]);

    const handleScroll = () => {
      if (!heroRef.current) return;
      const maxScroll = heroRef.current.offsetHeight - window.innerHeight;
      let fraction = window.scrollY / maxScroll;
      if (fraction < 0) fraction = 0;
      if (fraction > 1) fraction = 1;

      // Ensure we lock to the last frame even if exactly 1.0 isn't hit
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.ceil(fraction * (TOTAL_FRAMES - 1)));
      
      requestAnimationFrame(() => {
        if (images[frameIndex]) drawCover(images[frameIndex]);

        // Frame 1: Fades out between 0% and 25%
        if (fraction <= 0.25) {
          const localFrac = fraction / 0.25;
          setT1Style({
            opacity: 1 - localFrac,
            transform: `translateY(calc(-50% - ${localFrac * 100}px))`,
            pointerEvents: 'auto'
          });
        } else {
          setT1Style({ opacity: 0, transform: `translateY(-150%)`, pointerEvents: 'none' });
        }

        // Frame 2: Fades in 30%, peaks 50%, fades out 75%
        if (fraction > 0.25 && fraction <= 0.75) {
          let localFrac;
          if (fraction <= 0.5) {
            localFrac = (fraction - 0.25) / 0.25; // 0 to 1
            setT2Style({
              opacity: localFrac,
              transform: `translateY(calc(-50% + ${50 - (localFrac * 50)}px)) scale(${0.95 + (localFrac * 0.05)})`,
              pointerEvents: 'none'
            });
          } else {
            localFrac = 1 - ((fraction - 0.5) / 0.25); // 1 to 0
            setT2Style({
              opacity: localFrac,
              transform: `translateY(calc(-50% - ${(1 - localFrac) * 50}px)) scale(${0.95 + (localFrac * 0.05)})`,
              pointerEvents: 'none'
            });
          }
        } else {
          setT2Style({ opacity: 0, transform: `translateY(50px) scale(0.95)`, pointerEvents: 'none' });
        }

        // Frame 3: Fades in after 70%
        if (fraction > 0.7) {
          const localFrac = Math.min(1, (fraction - 0.7) / 0.3);
          setT3Style({
            opacity: localFrac,
            transform: `translateY(${100 - (localFrac * 100)}px)`,
            pointerEvents: 'auto'
          });
        } else {
          setT3Style({ opacity: 0, transform: `translateY(100px)`, pointerEvents: 'none' });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [images]);

  return (
    <section id="scroll-hero" ref={heroRef} style={{ height: '400vh', position: 'relative' }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-bg-deep">
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-x-0 bottom-0 top-[80px] bg-gradient-to-t from-bg-deep to-transparent z-[1] opacity-20" />
        <div className="absolute inset-0 mt-14 bg-[radial-gradient(circle_at_right_top,rgba(37,99,235,0.15),transparent_50%)] z-[1] transition-all" />

        {/* Text Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="max-w-7xl mx-auto px-6 w-full relative h-full">
            
            {/* 1st State */}
            <div
              className="absolute top-[54%] md:top-[52%] -translate-y-1/2 max-w-3xl transform transition-all ease-out duration-100 origin-left"
              style={t1Style}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-light font-mono text-xs tracking-widest mb-4 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue" />
                </span>
                Motor v3.0 · Determinístico
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-black tracking-tighter leading-[1.05] text-white mb-5 drop-shadow-2xl">
                Automatize sua apuração de forma confiável.
              </h1>

              <div className="bg-black/20 backdrop-blur-[2px] rounded-2xl p-2 -ml-2 mb-8 max-w-xl">
                <p className="text-base sm:text-lg text-zinc-300 font-light leading-relaxed">
                  A plataforma definitiva para auditores e correspondentes jurídicos. <strong className="text-white font-medium">Precisão de 99.9%</strong>. Nenhuma IA adivinhando números.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <a href="#pricing" className="group flex items-center justify-center gap-3 px-8 py-4 text-base font-bold bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all hover:-translate-y-1 w-full sm:w-auto">
                  Iniciar Teste de 7 Dias
                  <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5 shrink-0" />
                </a>
                <div className="flex items-center gap-3 px-6 py-4 sm:py-0 bg-black/40 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none rounded-full sm:rounded-none border border-white/5 sm:border-none text-sm font-mono text-zinc-400 sm:mt-0 h-full">
                  <span className="relative flex h-3 w-3 items-center justify-center shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-30"></span>
                    <Menu className="text-zinc-500 w-4 h-4 animate-bounce" />
                  </span>
                  Role para processar
                </div>
              </div>
            </div>

            {/* 2nd State */}
            <div
              className="absolute top-[55%] md:top-1/2 -translate-y-1/2 left-6 max-w-xl transform transition-all ease-out duration-100"
              style={t2Style}
            >
              <p className="font-mono text-sm tracking-widest text-brand-light mb-4 uppercase">Extração de Dados Brutos</p>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Lendo matrizes complexas sem <span className="text-red-400 italic font-serif">erro humano</span>.
              </h2>
              <div className="bg-bg-panel/80 backdrop-blur-md border border-white/10 rounded-xl p-5 font-mono text-xs text-zinc-400 shadow-2xl space-y-2">
                <div className="flex justify-between"><span className="text-brand-light">&gt;&gt; Analisando Extrato_Itaú.pdf</span> <span>[SHA-256 verificado]</span></div>
                <div className="flex justify-between"><span>Extraindo tabela pg 1-45...</span> <span className="text-emerald-400">OK</span></div>
                <div className="flex justify-between"><span>Filtrando transferências PIX...</span> <span className="text-emerald-400">OK</span></div>
                <div className="flex justify-between"><span>Identificando Wash Trading...</span> <span className="text-emerald-400">12 detectados</span></div>
              </div>
            </div>

            {/* 3rd State */}
            <div
              className="absolute bottom-20 left-6 max-w-2xl transform transition-all ease-out duration-100"
              style={t3Style}
            >
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-4">
                Resultado <span className="text-brand-light">Auditável</span>.
              </h2>
              <p className="text-xl text-zinc-300 font-light mb-8 border-l-2 border-brand-blue pl-4">Exporte relatórios formatados nativamente. Cada centavo mapeado, justificado e rastreável.</p>
            </div>

          </div>
        </div>

        {/* Fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg-deep to-transparent z-10 pointer-events-none" />
      </div>
    </section>
  );
}

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
      scrolled ? 'bg-bg-deep/90 backdrop-blur-xl border-b border-white/10 py-5 shadow-2xl' : 'bg-transparent py-8'
    )}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-10 w-full">
        {/* Logo - Force left */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-blue transform rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:bg-brand-light transition-colors duration-300">
              <Hexagon className="text-white fill-white -rotate-45 w-5 h-5" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-white">HOKMA</span>
          </Link>
        </div>

        {/* Desktop Nav - Absolute Center */}
        <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 bg-brand-blue/20 backdrop-blur-2xl px-10 py-3.5 rounded-full border border-blue-400/20 shadow-[0_0_30px_rgba(37,99,235,0.15)]">
          {[['#problema','O Problema'],['#solucao','Motor OCR'],['#features','Vantagens'],['#pricing','Planos']].map(([h,l]) => (
            <a key={h} href={h} className="text-sm font-semibold text-blue-50 hover:text-white hover:scale-105 transition-all">{l}</a>
          ))}
        </nav>

        {/* CTA - Force Right */}
        <div className="hidden md:flex flex-1 justify-end items-center gap-5">
          {isLoggedIn ? (
            <button onClick={onCTA} className="flex items-center gap-2 px-7 py-3 bg-brand-blue hover:bg-brand-light text-white font-bold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
              Dashboard <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors px-2">Login</Link>
              <a href="#pricing" className="flex items-center gap-2 px-7 py-3 bg-brand-blue hover:bg-brand-light text-white font-bold rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105">
                Testar Grátis <ChevronRight className="h-4 w-4" />
              </a>
            </>
          )}
        </div>

        <button className="lg:hidden text-white relative z-10" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 px-6 py-6 flex flex-col gap-5 z-20">
          {['#problema','#solucao','#features','#pricing'].map((h, i) => (
            <a key={h} href={h} onClick={() => setMenuOpen(false)} className="text-lg font-medium text-zinc-300">{['O Problema','Motor OCR','Vantagens','Planos'][i]}</a>
          ))}
          <div className="h-px bg-white/10" />
          <button onClick={onCTA} className="w-full py-4 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-light transition-colors">
            {isLoggedIn ? 'Acessar Dashboard' : 'Testar Grátis'}
          </button>
        </div>
      )}
    </header>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function HokmaLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);

  // Scroll Animation States
  const [imagesLoaded, setImagesLoaded] = useState<HTMLImageElement[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => { if (data.session) setIsLoggedIn(true); });
  }, []);

  useEffect(() => {
    if (!isReady) document.body.classList.add('overflow-hidden');
    else document.body.classList.remove('overflow-hidden');
    return () => document.body.classList.remove('overflow-hidden');
  }, [isReady]);

  const onCTA = () => router.push(isLoggedIn ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen bg-bg-deep text-white font-sans selection:bg-brand-blue/30 selection:text-white">

      {/* Loading Overlay */}
      {!isReady && (
        <LoadingScreen 
          onComplete={(imgs) => { 
            setImagesLoaded(imgs); 
            setIsReady(true); 
          }} 
        />
      )}

      {/* Navbar */}
      <NavBar isLoggedIn={isLoggedIn} onCTA={onCTA} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Hero Canvas Sequence */}
      {isReady && <CanvasScrollHero images={imagesLoaded} />}

      {/* ── KPI STRIP ───────────────────────────────────────────────── */}
      <section className="relative z-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-mono text-4xl md:text-5xl font-bold text-white mb-2">35h</span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Salvas por mês/auditor</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-mono text-4xl md:text-5xl font-bold text-brand-light mb-2">99.9%</span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Precisão determinística</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-mono text-4xl md:text-5xl font-bold text-white mb-2">15+</span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bancos suportados</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-mono text-4xl md:text-5xl font-bold text-white mb-2">0</span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Uso de IA "Adivinhona"</span>
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ──────────────────────────────────────────────────── */}
      <section id="problema" className="py-32 relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-dark/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl mb-16">
            <p className="font-mono text-sm text-brand-light tracking-widest uppercase mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> O Risco do Manual
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
              A auditoria artesanal é o elo fraco do seu processo judicial.
            </h2>
            <p className="text-xl text-zinc-400 font-light">
              Digitar linha por linha no Excel consome dias e expõe o cliente a erros críticos e irrastreáveis. Um zero a menos invalida toda a estrutura.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 rounded-2xl hover:bg-white/[0.08] transition-colors group">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Horas Desperdiçadas</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">Passar dias formatando extratos de múltiplos bancos com layouts diferentes drena a produtividade que deveria estar na análise jurídica.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl hover:bg-white/[0.08] transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10">
                <FileWarning className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Erro Humano</h3>
              <p className="text-zinc-400 leading-relaxed text-sm relative z-10">Fadiga ocular resulta em erros de digitação. Um simples ponto deslocado compromete a credibilidade da peça perante o juiz.</p>
            </div>
            <div className="glass-panel p-8 rounded-2xl hover:bg-white/[0.08] transition-colors group">
              <div className="w-14 h-14 bg-brand-blue/10 text-brand-light rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileSearch className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">PDFs Impossíveis</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">Scans borrados, tabelas em múltiplas páginas, quebras de linha estranhas. Planilhas baseadas em "copiar e colar" quebram instantaneamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIPELINE (Solução) ────────────────────────────────────────── */}
      <section id="solucao" className="py-32 bg-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Transformando caos de dados em <span className="text-brand-light">matrizes estruturadas.</span>
              </h2>
              <p className="text-xl text-zinc-400 font-light mb-12">
                Zero "Mágica de IA". Utilizamos OCR avançado e um motor de regras puramente matemático. Você sabe exatamente o porquê de cada classificação.
              </p>

              <div className="space-y-8">
                {[
                  { n: '01', t: 'Upload & Fingerprint', d: 'Geração automática de hash SHA-256 para evitar duplicidade. Detecção automática do banco emissor.' },
                  { n: '02', t: 'Classificação por 8 Regras', d: 'Filtra estornos, apostas (BETs), autotransferências e loops financeiros de Wash Trading com precisão milimétrica.' },
                  { n: '03', t: 'Dashboard & Acordeão', d: 'Visualização de fluxo de caixa mensal, toggles manuais para ajustes finos e exportação limpa em PDF ou CSV.' }
                ].map(s => (
                  <div key={s.n} className="flex gap-6 group cursor-default">
                    <div className="flex-shrink-0 w-12 h-12 bg-bg-panel border border-white/10 rounded-xl font-mono font-bold text-lg text-zinc-500 flex items-center justify-center group-hover:border-brand-blue group-hover:text-brand-light transition-all shadow-[0_0_0_rgba(37,99,235,0)] group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      {s.n}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{s.t}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake Terminal */}
            <div className="bg-[#0D0D12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
              <div className="bg-[#1A1A24] border-b border-white/5 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-4 font-mono text-xs text-zinc-500">hokma_engine_v3.exe</span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed text-zinc-300">
                <p className="text-zinc-500 mb-4">&gt; Inicializando análise de extrato...</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400 w-4 h-4" /> PIX RECEBIDO - ALFA LTDA</span>
                    <span className="text-emerald-400 font-bold">+R$ 8.500,00</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400 w-4 h-4" /> SALÁRIO MARÇO</span>
                    <span className="text-emerald-400 font-bold">+R$ 4.200,00</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 opacity-50 relative">
                    <div className="absolute inset-0 top-1/2 h-px bg-red-500 w-full" />
                    <span className="flex items-center gap-3"><X className="text-red-400 w-4 h-4" /> TRANSF. MESMA TITULARIDADE</span>
                    <span className="text-zinc-500">IGNORADO</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 opacity-50 relative">
                    <div className="absolute inset-0 top-1/2 h-px bg-red-500 w-full" />
                    <span className="flex items-center gap-3"><X className="text-red-400 w-4 h-4" /> BETANO APOSTAS</span>
                    <span className="text-zinc-500">IGNORADO</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 bg-brand-blue/10 rounded px-2 mt-2 border border-brand-blue/30">
                    <span className="flex items-center gap-3 text-brand-light"><AlertTriangle className="w-4 h-4" /> PIX - MARIA SILVA (VÍNCULO?)</span>
                    <span className="text-amber-400 font-bold">+R$ 1.500,00</span>
                  </div>
                </div>
              </div>
              <div className="bg-brand-blue text-white p-6 mt-4 flex justify-between items-center">
                <div>
                  <p className="font-mono text-xs text-white/70 uppercase tracking-widest mb-1">Renda Apurada (Mês)</p>
                  <p className="font-mono text-3xl font-bold">R$ 14.200,00</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── BANCO MARQUEE ─────────────────────────────────────────────── */}
      <div className="py-12 border-b border-white/5 bg-bg-deep overflow-hidden relative">
        <p className="text-center font-mono text-xs tracking-widest uppercase text-zinc-600 mb-8">Formatos Mapeados Natos</p>
        <div className="absolute left-0 inset-y-0 w-40 z-10 bg-gradient-to-r from-bg-deep to-transparent pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-40 z-10 bg-gradient-to-l from-bg-deep to-transparent pointer-events-none" />
        <div 
          className="flex w-max items-center opacity-40 hover:opacity-100 transition-opacity duration-500"
          style={{ animation: 'scroll 120s linear infinite' }}
        >
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-24 items-center px-12 shrink-0">
              <span className="font-bold text-3xl shrink-0 text-[#00B1EA]">Mercado Pago</span>
              <span className="font-bold text-3xl shrink-0 text-[#FF7A00]">Inter</span>
              <span className="font-bold text-3xl shrink-0 text-[#8A05BE]">Nubank</span>
              <span className="font-bold text-3xl shrink-0 text-[#00E5FF]">Neon</span>
              <span className="font-bold text-3xl shrink-0 text-[#1FB141]">PagBank</span>
              <span className="font-bold text-3xl shrink-0 text-[#F39200]">CAIXA Econômica</span>
              <span className="font-bold text-3xl shrink-0 text-[#CC092F]">Bradesco</span>
              <span className="font-bold text-3xl shrink-0 text-[#FCEB00] drop-shadow-[0_2px_10px_rgba(252,235,0,0.15)]">Banco do Brasil</span>
              <span className="font-bold text-3xl shrink-0 text-[#EC7000]">Itaú</span>
              <span className="font-bold text-3xl shrink-0 text-[#EC0000]">Santander</span>
              <span className="font-bold text-3xl shrink-0 text-[#11C76F]">PicPay</span>
              <span className="font-bold text-3xl shrink-0 text-white">InfinitePay</span>
              <span className="font-bold text-3xl shrink-0 text-[#00FF5E]">Next</span>
              <span className="font-bold text-3xl shrink-0 text-white">C6 Bank</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES GRID ─────────────────────────────────────────────── */}
      <section id="features" className="py-32 bg-bg-panel">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Ferramentas projetadas com rigor técnico.</h2>
            <p className="text-xl text-zinc-400 font-light">Não somos um "resumidor de PDF". Somos um motor de extração focado exclusivamente na apuração legal de renda.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { i: SearchCode, t: 'OCR Nativo Implacável', d: 'PDFs escaneados ou imagens tortas? Utilizamos processamento paralelo local para extrair caracteres com alta fidelidade, sem vazamento de dados.' },
              { i: GitMerge, t: 'Deduplicação Inteligente', d: 'Cliente enviou extratos sobrepostos? O sistema identifica hashes de transações e ignora duplicatas automaticamente, salvando sua base de cálculo.' },
              { i: RefreshCwOff, t: 'Anti Wash Trading', d: 'Detecta padrões de dinheiro que "entra e sai" entre contas do mesmo titular para inflar renda artificialmente, marcando-os em vermelho.' },
              { i: FileDown, t: 'Exportação Definitiva', d: 'Gere um laudo PDF pronto para anexar ao processo, ou um CSV limpo para jogar no seu Excel caso queira fazer modelagens extras.' },
            ].map((f, i) => (
              <div key={i} className="bg-bg-deep border border-white/5 p-8 hover:border-brand-blue/30 transition-all duration-300 group">
                <div className="mb-6 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-brand-light group-hover:bg-brand-blue/10 transition-colors">
                  <f.i className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{f.t}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
            <div className="bg-bg-deep border border-white/5 p-8 hover:border-brand-blue/30 transition-all duration-300 group lg:col-span-2">
              <div className="mb-6 bg-white/5 w-12 h-12 rounded-lg flex items-center justify-center text-zinc-400 group-hover:text-brand-light group-hover:bg-brand-blue/10 transition-colors">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">Privacidade By Design (LGPD)</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Os extratos financeiros dos seus clientes são processados na memória do seu navegador (Client-Side). Nenhum dado bancário sensível ou valor financeiro é persistido em nossos bancos de dados para treinamento de modelos. Assim que você fecha a aba, os dados somem. Segurança total exigida pela OAB e LGPD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────── */}
      <section id="pricing" className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-panel to-bg-deep pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Retorno Absoluto sobre Investimento.</h2>
            <p className="text-xl text-zinc-400 font-light">Assinatura transparente. Sem taxas ocultas por página lida.</p>
            
            <div className="inline-flex bg-white/5 border border-white/10 rounded-full p-1.5 mt-10">
              <button onClick={() => setIsAnnual(false)} className={cn('px-8 py-3 rounded-full text-sm font-bold transition-all', !isAnnual ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white')}>Mensal</button>
              <button onClick={() => setIsAnnual(true)} className={cn('px-8 py-3 rounded-full flex items-center gap-2 text-sm font-bold transition-all', isAnnual ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white')}>
                Anual <span className="text-[10px] bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">-16% OFF</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Essencial */}
            <div className="bg-bg-panel border border-white/10 p-10 rounded-3xl flex flex-col hover:border-white/20 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-2">Essencial</h3>
              <p className="text-zinc-500 text-sm mb-8">Para auditores independentes.</p>
              
              <div className="mb-10 flex items-baseline">
                <span className="text-zinc-400 text-xl font-mono">R$ </span>
                <span className="font-mono font-black text-6xl text-white tracking-tighter">{isAnnual ? '499' : '49'}</span>
                <span className="text-white text-2xl font-bold">,90</span>
                <span className="text-zinc-500 ml-2 font-mono text-sm">/{isAnnual ? 'ano' : 'mês'}</span>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {['Apurações ilimitadas', 'OCR Nativo v3', 'Filtro em 8 Regras', 'Exportação em PDF'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm"><CheckCircle2 className="w-5 h-5 text-zinc-600" /> {f}</li>
                ))}
              </ul>
              <button onClick={onCTA} className="w-full py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold transition-colors">Assinar Essencial</button>
            </div>

            {/* Workstation */}
            <div className="glow-effect bg-[#0c142e] border border-brand-blue/50 p-10 rounded-3xl flex flex-col relative shadow-[0_0_50px_rgba(37,99,235,0.1)] transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-brand-blue text-white font-bold text-xs px-5 py-2 rounded-full tracking-widest uppercase shadow-[0_0_20px_rgba(37,99,235,0.5)]">Recomendado</span>
              </div>
              <h3 className="text-2xl font-bold text-brand-light mb-2 flex items-center gap-2">
                <Zap className="fill-brand-light w-6 h-6 border-0" /> Workstation
              </h3>
              <p className="text-blue-200/50 text-sm mb-8">Escritórios e alta demanda.</p>
              
              <div className="mb-10 flex items-baseline">
                <span className="text-brand-light text-xl font-mono">R$ </span>
                <span className="font-mono font-black text-6xl text-white tracking-tighter">{isAnnual ? '899' : '89'}</span>
                <span className="text-white text-2xl font-bold">,90</span>
                <span className="text-blue-200/50 ml-2 font-mono text-sm">/{isAnnual ? 'ano' : 'mês'}</span>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {['7 Dias de Teste Grátis', 'Tudo do Essencial', 'PDFs sem limite de páginas', 'Exportação em CSV (Cru)', 'Suporte Prioritário WhatsApp'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-white text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-brand-blue" /> {f}</li>
                ))}
              </ul>
              <button onClick={onCTA} className="w-full py-4 rounded-xl bg-brand-blue hover:bg-brand-light text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-1">
                Iniciar Teste Grátis
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-mono text-zinc-500">
            <span className="flex items-center gap-2"><LockIcon className="w-4 h-4" /> Pagamento seguro Stripe</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Cancele a qualquer momento</span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-brand-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-black/40 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 drop-shadow-lg">
            Abandone as planilhas hoje.
          </h2>
          <p className="text-xl text-blue-100 font-medium mb-12 max-w-2xl mx-auto">
            Eleve o patamar de confiança das suas apurações. Teste na prática, com seus próprios PDFs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onCTA} className="px-10 py-5 text-lg font-black bg-bg-deep text-white rounded-full shadow-2xl hover:scale-105 transition-all w-full sm:w-auto">
              Começar 7 Dias Grátis
            </button>
            <button className="px-10 py-5 text-lg font-bold border-2 border-white/20 hover:bg-white/10 text-white rounded-full transition-all w-full sm:w-auto">
              Falar com Vendas
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="bg-bg-deep pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-brand-blue transform rotate-45 flex items-center justify-center">
                  <Hexagon className="text-white fill-white -rotate-45 w-4 h-4" />
                </div>
                <span className="font-black text-xl text-white tracking-tighter">HOKMA</span>
              </div>
              <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-6">
                Software de auditoria e apuração de renda desenvolvido para correspondentes jurídicos e peritos exigentes.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Produto</h4>
              <ul className="space-y-4">
                <li><a href="#solucao" className="text-zinc-500 hover:text-white transition-colors text-sm">Como Funciona</a></li>
                <li><a href="#features" className="text-zinc-500 hover:text-white transition-colors text-sm">Vantagens</a></li>
                <li><a href="#pricing" className="text-zinc-500 hover:text-white transition-colors text-sm">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Termos de Serviço</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Política de Privacidade</a></li>
                <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Contato de Suporte</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-zinc-600">© 2026 Hokma Fintech Ltda. CNPJ: 00.000.000/0001-00</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
