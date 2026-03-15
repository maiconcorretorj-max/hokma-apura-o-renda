'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useInView, type Variants } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, Shield, Database, LayoutDashboard,
  Clock, Cpu, Settings, FileSearch, TrendingUp,
  ChevronRight, Hexagon, Star, Menu, Download, AlertTriangle, X,
  Lock as LockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

// --- Assets ---
// The prompt expects images sequentially in /images/. 
// Using fallbacks if actual images don't exist is a good idea.
const HERO_IMAGES = [
  '/images/01-upload.png',
  '/images/02-processando.png',
  '/images/03-dashboard.png',
  '/images/04-acordeao.png',
  '/images/05-metricas.png',
  '/images/06-export.png',
];

// --- Animations ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// --- Components ---

const NavBar = ({ isLoggedIn, handleCTA, mobileMenuOpen, setMobileMenuOpen }: any) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300 border-b",
      scrolled 
        ? "bg-[var(--background)]/80 backdrop-blur-xl border-[var(--border)] py-3 shadow-2xl" 
        : "bg-transparent border-transparent py-5"
    )}>
      <div className="container px-6 max-w-screen-xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-sm bg-[var(--accent)] text-[var(--background)] shadow-[0_0_15px_var(--accent-glow)] transform rotate-45 group-hover:rotate-180 transition-all duration-500">
            <Hexagon className="h-4 w-4 fill-current -rotate-45 group-hover:rotate-180 transition-all duration-500" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)] transition-colors">HOKMA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            ['#como-funciona', 'Como Funciona'], 
            ['#features', 'Vantagens'], 
            ['#pricing', 'Preços']
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Button onClick={handleCTA} className="bg-[var(--accent)] text-[var(--background)] hover:bg-[#D4B881] font-bold tracking-tight shadow-[0_0_20px_var(--accent-glow)] rounded-sm px-6 h-10 transition-all hover:translate-y-[-2px]">
              Dashboard <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-[var(--text-primary)] hover:bg-[var(--surface-alt)] font-medium tracking-tight rounded-sm px-5 h-10 transition-colors">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button onClick={handleCTA} className="bg-[var(--accent)] text-[var(--background)] hover:bg-[#D4B881] font-bold tracking-tight shadow-[0_0_20px_var(--accent-glow)] rounded-sm px-6 h-10 transition-all hover:translate-y-[-2px]">
                Começar Grátis <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-[var(--text-primary)]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-[var(--background)]/95 backdrop-blur-3xl border-b border-[var(--border)] py-6 px-6 flex flex-col gap-6 md:hidden shadow-2xl"
        >
          <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[var(--text-primary)]">Como Funciona</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[var(--text-primary)]">Vantagens</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-[var(--text-primary)]">Planos</a>
          <div className="h-px bg-[var(--border)] w-full" />
          <Button onClick={handleCTA} className="w-full bg-[var(--accent)] text-[var(--background)] font-bold h-12 rounded-sm shadow-[0_0_20px_var(--accent-glow)]">
            {isLoggedIn ? 'Acessar Dashboard' : 'Iniciar Teste de 7 Dias'}
          </Button>
        </motion.div>
      )}
    </header>
  );
};

// --- Hero Sequence Component ---
const ScrollSequenceHero = ({ isLoggedIn, handleCTA }: any) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const wrapperHeight = wrapperRef.current.offsetHeight;
      
      // Calculate progress between 0 and 1
      const progress = Math.max(0, Math.min(1, (-rect.top) / (wrapperHeight - window.innerHeight)));
      
      const rawIndex = progress * (HERO_IMAGES.length - 1);
      const newIndex = Math.round(rawIndex);
      setCurrentIndex(newIndex);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: `${HERO_IMAGES.length * 100}vh` }} className="relative">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <div className="container max-w-screen-xl mx-auto px-6 h-full flex flex-col lg:flex-row items-center justify-center gap-12">
          
          {/* Left Column: Copy */}
          <div className="w-full lg:w-[45%] flex flex-col items-start z-10">
            <Badge variant="outline" className="px-4 py-1.5 rounded-sm border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] font-mono-data tracking-wide flex items-center gap-2 shadow-[0_0_15px_var(--accent-glow)] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]"></span>
              </span>
              Motor v3.0 Inteligente
            </Badge>

            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.05] text-[var(--text-primary)] mb-6">
              Apure rendimentos em <br/>
              <span className="text-[var(--accent)] relative">
                segundos
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-[var(--accent)]/30 blur-sm"></div>
              </span>,<br/>
              não em horas.
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] font-light leading-relaxed mb-10 max-w-lg">
              A plataforma definitiva para auditores. Extração determinística de PDFs bancários com 
              <span className="text-[var(--text-primary)] font-medium"> precisão de 99.9%</span>. Nenhuma IA adivinhando números.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <Button
                  size="lg"
                  onClick={handleCTA}
                  className="group relative h-14 rounded-sm px-8 text-base font-bold bg-[var(--accent)] text-[var(--background)] hover:bg-[#D4B881] transition-all hover:translate-y-[-2px] shadow-[0_0_20px_var(--accent-glow)] w-full sm:w-auto"
                >
                  {isLoggedIn ? 'Acessar Workspace' : 'Iniciar Teste de 7 Dias Grátis'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-sm px-8 text-base font-medium border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--text-primary)] transition-all w-full sm:w-auto"
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver como funciona ↓
                </Button>
            </div>
            
            {/* Supported Banks Marquee */}
            <div className="mt-16 w-full overflow-hidden relative opacity-50 hover:opacity-100 transition-opacity max-w-[400px]">
               <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none"></div>
               <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none"></div>

               <div className="flex gap-8 items-center w-max animate-[scroll_20s_linear_infinite] grayscale hover:grayscale-0 transition-all font-display text-lg font-bold">
                 {[...Array(2)].map((_, arrayIndex) => (
                   <div key={arrayIndex} className="flex gap-8 items-center text-[var(--text-secondary)]">
                     <span>Itaú</span>
                     <span>Nubank</span>
                     <span>Bradesco</span>
                     <span>Santander</span>
                     <span>Caixa</span>
                     <span>Inter</span>
                     <span>Banco do Brasil</span>
                   </div>
                 ))}
               </div>
            </div>

          </div>

          {/* Right Column: Sequence Mockup */}
          <div className="hidden lg:flex w-[55%] items-center justify-center relative">
             <div className="w-[120%] max-w-[900px] h-[600px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl relative overflow-hidden flex flex-col">
                <div className="h-10 bg-[var(--surface-alt)] border-b border-[var(--border)] flex items-center px-4 gap-2">
                   <div className="w-3 h-3 rounded-full bg-[#E74C3C]/50" />
                   <div className="w-3 h-3 rounded-full bg-[#F39C12]/50" />
                   <div className="w-3 h-3 rounded-full bg-[#2ECC71]/50" />
                   <div className="flex-1 text-center font-mono-data text-xs text-[var(--text-muted)]">hokma.app/dashboard</div>
                </div>
                <div className="flex-1 relative bg-[var(--background)] flex items-center justify-center">
                  
                  {HERO_IMAGES.map((src, idx) => (
                    <motion.div 
                      key={src}
                      initial={false}
                      animate={{ opacity: currentIndex === idx ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center p-4"
                      style={{ pointerEvents: currentIndex === idx ? 'auto' : 'none' }}
                    >
                      {/* Using a placeholder text since /images/ might not exist locally */}
                      <div className="w-full h-full border border-[var(--border)] border-dashed rounded-lg flex flex-col items-center justify-center text-[var(--text-muted)] p-8">
                         <LayoutDashboard className="w-16 h-16 mb-4 opacity-50" />
                         <span className="font-mono-data text-sm">IMAGE: {src}</span>
                         <span className="text-xs opacity-50 mt-2">Replace with actual image in public/images/</span>
                      </div>
                    </motion.div>
                  ))}
                  
                </div>
             </div>

             {/* Step Indicators */}
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
               {HERO_IMAGES.map((_, idx) => (
                 <div 
                   key={idx} 
                   className={cn(
                     "w-2.5 h-2.5 rounded-full transition-colors duration-300",
                     currentIndex === idx ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]" : "bg-[var(--border)]"
                   )}
                 />
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function HokmaLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  const handleCTA = () => router.push(isLoggedIn ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen font-sans selection:bg-[var(--accent)]/30 overflow-hidden relative">
      
      {/* Global Grain Font and Styles included in globals.css */}
      <div className="grain pointer-events-none fixed inset-0 z-50"></div>

      <NavBar isLoggedIn={isLoggedIn} handleCTA={handleCTA} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* ── HERO SECTION (SCROLL SEQUENCE) ──────────────────── */}
      <ScrollSequenceHero isLoggedIn={isLoggedIn} handleCTA={handleCTA} />

      {/* ── PROBLEM / AGITATION ────────────────────────────── */}
      <section id="problema" className="py-32 relative bg-[var(--background)] border-t border-[var(--border)] z-20">
        <div className="container max-w-screen-xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-6">
              Ainda faz apurações na mão?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] font-light">
              A auditoria financeira artesanal é lenta, sujeita a falhas humanas e consome as horas mais preciosas da sua operação.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: 'Horas desperdiçadas', desc: 'Digitar linha por linha no Excel consome dezenas de horas por cliente. 35h/mês em média perdidas por auditor.', icon: Clock },
              { title: 'Erro humano inevitável', desc: 'No sistema arcaico, um simples erro de digitação compromete e invalida toda a arquitetura de apuração.', icon: AlertTriangle },
              { title: 'PDFs impossíveis', desc: 'Bancos mandam scans fotografados ou ilégiveis que quebram planilhas manuais. Nós extraímos via OCR.', icon: FileSearch },
            ].map((err, i) => (
               <motion.div 
                 key={err.title}
                 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                 className="bg-[var(--surface)] border-l-2 border-[var(--border)] hover:border-[var(--accent)] p-8 shadow-xl transition-all duration-300 group hover:-translate-y-2"
               >
                 <err.icon className="h-8 w-8 text-[var(--text-muted)] group-hover:text-[var(--accent)] mb-6 transition-colors" />
                 <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-4">{err.title}</h3>
                 <p className="text-[var(--text-secondary)] font-light leading-relaxed">{err.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS - PIPELINE INTERATIVO ──────────────────────── */}
      <section id="como-funciona" className="py-32 bg-[var(--surface)] relative border-y border-[var(--border)] z-20 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent)]/5 blur-[200px] rounded-full pointer-events-none" />
        
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-10">
              <div>
                <Badge variant="outline" className="text-[var(--accent)] border-[var(--border)] font-mono-data tracking-wide mb-6 bg-[var(--background)]">Pipeline de Processamento</Badge>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] leading-[1.1] mb-6">
                  Transformando caos em <br/> <span className="text-[var(--accent)]">matrizes rastreáveis.</span>
                </h2>
                <p className="text-xl text-[var(--text-secondary)] font-light">
                  Zero IA generativa. Nenhuma "adivinhação". Cada decisão é mapeada e auditável com log de motivo.
                </p>
              </div>
              
              <div className="space-y-8 pt-4">
                {[
                  { title: 'Upload do PDF', desc: 'SHA-256 gerado automaticamente. Banco detectado naturalmente.' },
                  { title: 'Classificação em 8 regras', desc: 'Filtra estornos, apostas (BETs), autotransferências e wash trading com precisão matemática.' },
                  { title: 'Dashboard Interativa', desc: 'Acordeão mensal, toggles manuais e exportação blindada em PDF/CSV.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] font-mono-data font-bold flex items-center justify-center text-xl group-hover:bg-[var(--accent)] group-hover:text-[var(--background)] group-hover:border-[var(--accent)] transition-all">
                      0{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{step.title}</h4>
                      <p className="text-[var(--text-secondary)] font-light leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Demo Card (Animated) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative p-1 rounded-sm bg-gradient-to-br from-[var(--border)] to-transparent"
            >
              <div className="bg-[var(--background)] p-6 space-y-4 shadow-2xl relative overflow-hidden">
                 
                 <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4 mb-6">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span className="font-mono-data text-sm text-[var(--text-secondary)] uppercase tracking-wider">Processando 03/2025</span>
                 </div>

                 {/* Simulated transactions streaming in */}
                 <div className="space-y-3 font-mono-data text-xs sm:text-sm">
                   {[
                     { status: '✓', text: 'PIX RECEBIDO - EMPRESA ALFA LTDA', val: '+R$8.500', color: 'text-[var(--green)]', delay: '0s' },
                     { status: '✓', text: 'SALÁRIO MARÇO/2025', val: '+R$4.200', color: 'text-[var(--green)]', delay: '0.8s' },
                     { status: '✕', text: 'TRANSFERÊNCIA PARA CONTA PRÓPRIA', val: '-R$2.000', color: 'text-[var(--red)]', delay: '1.6s' },
                     { status: '✕', text: 'BETANO APOSTAS ONLINE', val: '+R$300', color: 'text-[var(--red)]', delay: '2.4s' },
                     { status: '⚠', text: 'PIX - MARIA SILVA (VÍNCULO?)', val: '+R$1.500', color: 'text-[#F39C12]', delay: '3.2s' },
                   ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between border-b border-[var(--border)] pb-2 opacity-0 animate-transaction-slide" style={{ animationDelay: item.delay }}>
                        <div className="flex gap-3">
                           <span className={item.color}>{item.status}</span>
                           <span className="text-[var(--text-primary)]">{item.text}</span>
                        </div>
                        <span className={item.color}>{item.val}</span>
                     </div>
                   ))}
                 </div>

                 <div className="mt-8 p-4 bg-[var(--surface-alt)] border border-[var(--border)] flex justify-between items-center opacity-0 animate-transaction-slide" style={{ animationDelay: '4s' }}>
                    <span className="font-display font-medium text-[var(--text-secondary)]">Renda Apurada:</span>
                    <span className="font-mono-data text-lg font-bold text-[var(--accent)]">R$ 14.200,00</span>
                 </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────── */}
      <section id="features" className="py-32 relative z-20 bg-[var(--background)]">
        <div className="container max-w-screen-xl mx-auto px-6">
           <div className="text-center mb-20 max-w-3xl mx-auto">
             <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-[var(--text-primary)] mb-6">Auditoria Levada a Sério</h2>
             <p className="text-xl text-[var(--text-secondary)] font-light">Ferramentas desenhadas com absoluto rigor técnico e legal.</p>
           </div>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { n: '01', title: '15+ Bancos Mapeados', desc: 'Atende Itaú, Bradesco, Nubank, C6, etc. Modelos revisados a cada mudança de layout bancário.' },
                { n: '02', title: 'OCR Nativo Integrado', desc: 'Documentos escaneados e tortos? O Tesseract integrado extrai strings sem precisar digitar nada.' },
                { n: '03', title: 'Motor Determinístico', desc: '100% auditável. Sem heurísticas, sem "alucinações" de IA gen. O resultado é exato e repetível.' },
                { n: '04', title: 'Deduplicação de Logs', desc: 'Fingerprint criptográfico do hash PDF previne que clientes submetam a mesma fatura repetida.' },
                { n: '05', title: 'Anti Wash Trading', desc: 'Filtra loops financeiros no mesmo dia (depositar e sacar do próprio CPF) que inflam limites fictícios.' },
                { n: '06', title: 'Exportação Blindada', desc: 'Gerador de PDF nativo com matriz comprovada, ou relatórios CSV cru para análises externas.' },
              ].map((ft, i) => (
                <div key={i} className="bg-[var(--surface)] p-8 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-colors group">
                    <span className="font-mono-data text-3xl font-bold text-[var(--accent)] opacity-50 group-hover:opacity-100 transition-opacity mb-6 block">{ft.n}</span>
                    <h4 className="font-display font-bold text-xl text-[var(--text-primary)] mb-3">{ft.title}</h4>
                    <p className="text-[var(--text-secondary)] font-light leading-relaxed">{ft.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── METRICS / PROVA SOCIAL ────────────────────────────── */}
      <section className="py-24 bg-[var(--surface-alt)] border-y border-[var(--border)] relative z-20">
        <div className="container max-w-screen-xl mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] text-center">
              {[
                { v: '35h', label: 'Salvas por auditor' },
                { v: '99,9%', label: 'Precisão comprovada' },
                { v: '15+', label: 'Bancos suportados' }
              ].map((m, i) => (
                 <div key={i} className="pt-8 md:pt-0 flex flex-col items-center justify-center">
                    <span className="font-mono-data text-6xl md:text-7xl font-bold text-[var(--accent)] mb-4">{m.v}</span>
                    <span className="font-display text-lg text-[var(--text-secondary)] uppercase tracking-widest">{m.label}</span>
                 </div>
              ))}
           </div>
           
           <div className="mt-20 max-w-4xl mx-auto text-center border border-[var(--border)] p-10 bg-[var(--background)] relative">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--surface-alt)] px-4 font-mono-data text-[var(--accent)]">DEPOIMENTO</span>
              <p className="text-2xl md:text-3xl font-light font-display italic text-[var(--text-primary)] leading-relaxed">
                "O fluxo que costumava me custar finais de semana inteiros com calculadoras e planilhas, 
                agora é feito em menos de 10 segundos com precisão inquestionável."
              </p>
           </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section id="pricing" className="py-32 bg-[var(--background)] relative z-20">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] tracking-tight">Planos Clássicos</h2>
            <p className="text-xl text-[var(--text-secondary)] mt-4 font-light">
              Assinatura fixa, escalabilidade ilimitada.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {/* Standard */}
            <Card className="bg-[var(--surface)] border-[var(--border)] rounded-sm p-10 flex flex-col relative text-[var(--text-primary)]">
               <h3 className="font-display font-bold text-2xl text-[var(--text-primary)]">Essencial</h3>
               <p className="text-[var(--text-secondary)] mt-2 h-12">Análise de extratos para operações menores.</p>
               <div className="my-8">
                  <span className="font-mono-data text-xl text-[var(--text-secondary)]">R$ </span>
                  <span className="font-mono-data text-5xl font-bold">499,90</span>
                  <span className="text-[var(--text-secondary)]"> /ano</span>
               </div>
               <ul className="space-y-4 mb-10 text-[var(--text-secondary)] flex-1">
                  {['Apurações ilimitadas', 'Motor OCR 3.0', 'Exportação PDF'].map((item, i) => (
                    <li key={i} className="flex gap-3 items-center">
                       <CheckCircle2 className="w-5 h-5 text-[var(--text-muted)]" /> {item}
                    </li>
                  ))}
               </ul>
               <Button onClick={handleCTA} variant="outline" className="w-full h-14 rounded-sm border-[var(--border)] bg-transparent hover:bg-[var(--surface-alt)] font-bold text-base transition-colors">
                  Assinar Essencial
               </Button>
            </Card>

            {/* Premium */}
            <Card className="bg-[var(--surface-alt)] border-[var(--accent)]/50 rounded-sm p-10 flex flex-col relative text-[var(--text-primary)] shadow-[0_0_30px_rgba(200,169,110,0.05)]">
               <Badge className="absolute top-0 right-8 -translate-y-1/2 bg-[var(--accent)] text-[var(--background)] font-display font-bold tracking-widest uppercase hover:bg-[var(--accent)] pt-1 pb-1">
                  Mais Requisitado
               </Badge>
               <h3 className="font-display font-bold text-2xl text-[var(--accent)] flex items-center gap-2">Premium Workstation</h3>
               <p className="text-[var(--text-secondary)] mt-2 h-12">Performance extrema e fluxos ilimitados para auditorias pesadas.</p>
               <div className="my-8">
                  <span className="font-mono-data text-xl text-[var(--accent)]">R$ </span>
                  <span className="font-mono-data text-5xl font-bold">49,90</span>
                  <span className="text-[var(--text-secondary)]"> /mês</span>
               </div>
               <ul className="space-y-4 mb-10 text-[var(--text-primary)] flex-1">
                  {['Tudo no plano Essencial', 'Suporte Prioritário VIP', 'Exportação Inteligente: PDF + CSV', 'Update garantido de mapas'].map((item, i) => (
                    <li key={i} className="flex gap-3 items-center">
                       <CheckCircle2 className="w-5 h-5 text-[var(--accent)]" /> {item}
                    </li>
                  ))}
               </ul>
               <Button onClick={handleCTA} className="w-full h-14 rounded-sm bg-[var(--accent)] hover:bg-[#D4B881] text-[var(--background)] font-bold text-base shadow-[0_0_15px_var(--accent-glow)] transition-all">
                  Iniciar Teste de 7 Dias
               </Button>
            </Card>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 font-mono-data text-sm text-[var(--text-secondary)]">
             <span className="flex items-center gap-2"><LockIcon className="w-4 h-4" /> Via Stripe</span>
             <span className="flex items-center gap-2 text-[var(--green)]"><CheckCircle2 className="w-4 h-4" /> 7 Dias Grátis</span>
             <span>Cancele Quando Quiser</span>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-[var(--background)] border-t border-[var(--border)] z-20">
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent)]/5 to-transparent pointer-events-none" />
        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] mb-6">Pronto para a nova era da auditoria?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Button onClick={handleCTA} className="h-14 rounded-sm px-10 text-base font-bold bg-[var(--accent)] text-[var(--background)] hover:bg-[#D4B881] shadow-[0_0_20px_var(--accent-glow)] transition-all">
              Começar 7 Dias Grátis
            </Button>
            <Button variant="outline" className="h-14 rounded-sm px-10 text-base font-bold border-[var(--border)] bg-transparent hover:bg-[var(--surface-alt)]">
              Falar com a equipe
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer className="bg-[var(--surface)] py-12 border-t border-[var(--border)] relative z-20">
        <div className="container max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <Hexagon className="w-5 h-5 text-[var(--accent)] fill-current" />
             <span className="font-display font-bold text-lg tracking-tight text-[var(--text-primary)]">HOKMA</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Termos</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">Privacidade</a>
            <a href="mailto:contato@hokma.app" className="hover:text-[var(--accent)] transition-colors">Suporte</a>
          </div>
          <p className="font-mono-data text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} Hokma Fintech.</p>
        </div>
      </footer>
    </div>
  );
}
