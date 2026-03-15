'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, Shield, Zap, FileText,
  Clock, Cpu, Settings, Lock, FileSearch, Database,
  ChevronRight, Hexagon, Star, Menu, Download, BarChart3, TrendingUp, X, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

// --- Animations ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const glowVariants = {
  hover: { opacity: 1, scale: 1.1, filter: "blur(20px)" },
  initial: { opacity: 0.5, scale: 1, filter: "blur(10px)" }
};

// --- Components ---
const NavBar = ({ isLoggedIn, handleCTA, mobileMenuOpen, setMobileMenuOpen }: any) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300 border-b",
      scrolled ? "bg-zinc-950/80 backdrop-blur-xl border-white/10 py-3 shadow-2xl shadow-black/50" : "bg-transparent border-transparent py-5"
    )}>
      <div className="container px-6 max-w-screen-xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
            <Hexagon className="h-5 w-5 fill-current" />
            <div className="absolute inset-0 bg-white/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-violet-100 transition-colors">HOKMA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10 bg-white/5 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
          {[
            ['#como-funciona', 'Como Funciona'], 
            ['#features', 'Vantagens'], 
            ['#pricing', 'Preços']
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-sm font-medium tracking-wide text-zinc-300 hover:text-white transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Button onClick={handleCTA} className="bg-white text-black hover:bg-zinc-200 font-bold tracking-tight shadow-[0_0_20px_rgba(255,255,255,0.3)] rounded-full px-6 h-11 transition-all hover:scale-105">
              Dashboard <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild className="text-zinc-300 hover:text-white hover:bg-white/10 font-medium tracking-tight rounded-full px-5">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button onClick={handleCTA} className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25 font-bold tracking-wide rounded-full px-6 h-11 transition-all hover:scale-105 hover:shadow-violet-500/40">
                Começar Teste <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-zinc-300 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-3xl border-b border-white/10 py-6 px-6 flex flex-col gap-6 md:hidden shadow-2xl"
        >
          <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300">Como Funciona</a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300">Vantagens</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-zinc-300">Planos</a>
          <div className="h-px bg-white/10 w-full" />
          <Button onClick={handleCTA} className="w-full bg-violet-600 text-white font-bold h-12 rounded-xl">
            {isLoggedIn ? 'Acessar Dashboard' : 'Iniciar Teste de 7 Dias'}
          </Button>
        </motion.div>
      )}
    </header>
  );
};

export default function HokmaLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);

  // Parallax effects
  const { scrollYProgress } = useScroll();
  const yHeroBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  const handleCTA = () => router.push(isLoggedIn ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-50 selection:bg-violet-500/30 overflow-hidden font-sans">
      
      {/* Global Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        :root { --radius: 0.75rem; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, .font-display { font-family: 'Outfit', sans-serif; }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #7c3aed; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .text-gradient-primary {
          background: linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />

      <NavBar isLoggedIn={isLoggedIn} handleCTA={handleCTA} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* ── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-32 flex flex-col items-center justify-center min-h-[95vh]">
        {/* Background Gradients & Grids */}
        <motion.div style={{ y: yHeroBg }} className="absolute inset-0 -z-10 w-full h-full">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        </motion.div>
        
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="container max-w-screen-lg mx-auto text-center px-6 relative z-10"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <Badge variant="outline" className="px-4 py-1.5 rounded-full border-violet-500/30 bg-violet-500/10 text-violet-300 font-medium tracking-wide flex items-center gap-2 backdrop-blur-sm shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              Motor v3.0 Inteligente Lançado
            </Badge>
          </motion.div>

          <motion.h1 
            variants={fadeUp}
            className="text-6xl md:text-8xl font-display font-extrabold tracking-tight leading-[1.05] mb-8"
          >
            Apure rendimentos em <br className="hidden md:block"/>
            <span className="relative inline-block">
              <span className="text-gradient-primary">segundos</span>
              <div className="absolute -bottom-2 left-0 w-full h-3 bg-violet-600/30 blur-md rounded-full -z-10"></div>
            </span>, não em horas.
          </motion.h1>

          <motion.p 
            variants={fadeUp}
            className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-3xl mx-auto mb-12 font-light"
          >
            Abandone o caos de planilhas e PDFs ilegíveis. O Hokma extrai dados bancários 
            automaticamente com <span className="text-zinc-200">precisão de 99.9%</span> através da nossa matriz determinística infalível.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
             <Button
                size="lg"
                onClick={handleCTA}
                className="group relative h-16 rounded-full px-10 text-lg font-bold bg-white text-black hover:bg-zinc-100 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)] w-full sm:w-auto overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  {isLoggedIn ? 'Acessar Workspace' : 'Iniciar Teste de 7 Dias Grátis'}
                  <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 rounded-full px-8 text-lg font-semibold border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md transition-all w-full sm:w-auto"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Ver como funciona
              </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
             <p className="text-sm font-semibold tracking-widest uppercase text-zinc-500 w-full mb-2">Bancos Suportados</p>
             {['Nubank', 'Itaú', 'Bradesco', 'Caixa', 'Santander', 'Inter'].map((b) => (
               <span key={b} className="text-xl font-display font-bold text-zinc-400">{b}</span>
             ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── METRICS / KPIs ─────────────────────────────────────── */}
      <section className="relative z-20 -mt-10 px-6 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, label: "Tempo Salvo", value: "35h/mês", sub: "Média por auditor" },
            { icon: Shield, label: "Precisão", value: "99.9%", sub: "Motor Zero-IA Determinístico" },
            { icon: Database, label: "Bancos Mapeados", value: "15+", sub: "Atualizações constantes" }
          ].map((kpi, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: i * 0.1 }}
               className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-violet-500/30 transition-colors"
             >
               <div className="absolute -right-10 -top-10 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-colors" />
               <kpi.icon className="h-8 w-8 text-violet-400 mb-6" />
               <p className="text-zinc-400 font-medium mb-1">{kpi.label}</p>
               <h3 className="text-4xl font-display font-bold text-white mb-2">{kpi.value}</h3>
               <p className="text-sm text-zinc-500">{kpi.sub}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM / AGITATION ────────────────────────────── */}
      <section id="features" className="py-32 relative">
        <div className="container max-w-screen-xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6">
              Ainda faz apurações na mão?
            </h2>
            <p className="text-xl text-zinc-400 font-light">
              A auditoria financeira artesanal é lenta, sujeita a falhas humanas e consome as horas mais preciosas da sua operação.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: 'Perda de Tempo', desc: 'Digitar valores no Excel linha por linha demora dezenas de horas preciosas por cliente ou projeto judicial.', icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
              { title: 'Insegurança Crítica', desc: 'No sistema arcaico, um simples erro de digitação compromete e invalida toda a arquitetura de apuração.', icon: Shield, color: "text-red-400", bg: "bg-red-400/10" },
              { title: 'PDFs Impossíveis', desc: 'Banco mandou scan fotografado ou ilegível? Nossa tecnologia nativa extrai caracteres com precisão Tesseract.', icon: FileSearch, color: "text-blue-400", bg: "bg-blue-400/10" },
            ].map((err, i) => (
               <motion.div 
                 key={err.title}
                 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                 className="glass-panel p-8 rounded-[2rem] hover:bg-white/[0.05] transition-colors group"
               >
                 <div className={`w-14 h-14 rounded-2xl ${err.bg} ${err.color} flex items-center justify-center mb-6 shadow-inner`}>
                   <err.icon className="h-7 w-7" />
                 </div>
                 <h3 className="text-2xl font-display font-bold text-white mb-4">{err.title}</h3>
                 <p className="text-zinc-400 font-light leading-relaxed">{err.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION / HOW IT WORKS (Interactive UI Demo) ────────────────────────── */}
      <section id="como-funciona" className="py-32 bg-zinc-900/30 relative border-y border-white/5">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-1/2 bg-violet-600/10 blur-[150px] -z-10 rounded-full" />
        
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-10"
            >
              <div>
                <Badge variant="outline" className="text-violet-400 border-violet-500/30 bg-violet-500/10 mb-6">Pipeline de Processamento</Badge>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-[1.1] mb-6">
                  Transformando caos em <br/> <span className="text-gradient-primary">matrizes organizadas.</span>
                </h2>
                <p className="text-xl text-zinc-400 font-light">
                  Uma arquitetura elaborada com filtros matemáticos em cascata. Sem adivinhação, sem IA inventando números.
                </p>
              </div>
              
              <div className="space-y-8 pt-4">
                {[
                  { title: '1. O Upload Instantâneo', desc: 'Arraste o PDF de qualquer banco mapeado. O motor faz o fingerprint SHA-256 de segurança.' },
                  { title: '2. Filtro em 8 Cascadas', desc: 'Nosso algoritmo exclui imediatamente débitos, estornos, autotransferências, apostas (BETs) e lavagens.' },
                  { title: '3. Análise Final & Relatório', desc: 'Acompanhe na dashboard interativa. Obtenha a matriz real provada e exporte lindamente em PDF ou CSV.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-display font-bold flex items-center justify-center text-xl group-hover:bg-violet-600 group-hover:border-violet-500 transition-colors shadow-lg shadow-black/50">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-display font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">{step.title.substring(3)}</h4>
                      <p className="text-zinc-400 font-light leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Interactive Dashboard Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, rotateY: 10 }} 
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }} 
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative perspective-1000"
            >
              <div className="glass-panel p-2 rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/10 ring-1 ring-white/5 relative z-10 bg-zinc-950/50">
                <div className="border border-white/10 bg-[#0a0a0a] rounded-[2rem] overflow-hidden">
                  {/* Fake UI Header */}
                  <div className="h-14 border-b border-white/10 flex items-center px-6 gap-3 bg-white/[0.02]">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/80" />
                       <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                       <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                       <Badge variant="outline" className="text-xs bg-violet-500/10 text-violet-400 border-violet-500/20">Processado</Badge>
                       <Download className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                  
                  {/* Fake UI Body */}
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-medium text-zinc-500 mb-1">Renda Total Apurada</p>
                        <h3 className="text-4xl font-display font-bold text-white">R$ 38.540<span className="text-zinc-500 text-2xl">,00</span></h3>
                      </div>
                      <div className="h-12 w-32 bg-gradient-to-t from-violet-500/20 to-transparent rounded-t-xl border-b-2 border-violet-500 relative flex items-end justify-around px-2 pb-1">
                        <div className="w-2 h-[40%] bg-violet-500 rounded-t-sm"></div>
                        <div className="w-2 h-[60%] bg-violet-500 rounded-t-sm"></div>
                        <div className="w-2 h-[30%] bg-violet-500 rounded-t-sm"></div>
                        <div className="w-2 h-[80%] bg-violet-500 rounded-t-sm"></div>
                        <div className="w-2 h-[100%] bg-violet-400 rounded-t-sm shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      {[
                        { icon: TrendingUp, title: "PIX SALÁRIO — STARTUP LTDA", val: "+ R$ 12.000,00", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                        { icon: Shield, title: "Autotransferência — Nubank", val: "R$ 5.500,00", color: "text-zinc-500", style: "line-through opacity-50", bg: "bg-zinc-800" },
                        { icon: AlertTriangle, title: "PIX BETANO JOGOS LTDA", val: "R$ 1.500,00", color: "text-amber-500", style: "line-through opacity-50", bg: "bg-amber-500/10" }
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] ${item.style || ''} transition-all hover:bg-white/[0.04]`}>
                          <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-4 h-4 ${item.color.replace('text-', 'text-')}`} />
                          </div>
                          <span className="text-sm font-medium text-zinc-300 flex-1">{item.title}</span>
                          <span className={`text-sm font-bold ${item.color}`}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements behind the mockup */}
              <div className="absolute -bottom-10 -right-10 w-full h-full bg-violet-600/20 blur-3xl rounded-full -z-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRICING SAAS (Premium Vibe) ────────────────────── */}
      <section id="pricing" className="py-32 relative">
        <div className="absolute left-0 top-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="container max-w-screen-xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16 space-y-6 max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              Investimento Único.<br/>
              <span className="text-gradient-primary">Retorno Absoluto.</span>
            </h2>
            <p className="text-xl text-zinc-400 font-light">
              Assinatura fixa, sem limite de páginas por PDF ou tarifas escondidas.
            </p>
          </motion.div>

          <div className="flex justify-center mb-16 relative z-20">
            <div className="glass-panel p-1.5 rounded-full inline-flex items-center shadow-lg">
              <button 
                onClick={() => setIsAnnual(false)}
                className={cn("px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300", 
                  !isAnnual ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white')}
              >
                Mensal
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={cn("px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2", 
                  isAnnual ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white')}
              >
                Anual 
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold", isAnnual ? "bg-black/10 text-black" : "bg-violet-500/20 text-violet-300")}>
                  -16%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch place-items-stretch">
            
            {/* PLANO STANDARD */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="h-full">
              <Card className="p-10 border-white/10 bg-zinc-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-none hover:bg-zinc-800/50 transition-colors h-full flex flex-col relative overflow-hidden group text-white">
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 group-hover:bg-zinc-700 transition-colors"></div>
                <div>
                  <h3 className="text-xl font-display font-bold text-zinc-300 mb-2">Plano Essencial</h3>
                  <p className="text-zinc-500 font-light mb-8 h-12">Otimize a análise de contratos menores com precisão.</p>
                  
                  <div className="mb-10 relative h-16">
                    <motion.div 
                      key={isAnnual ? 'anual_std' : 'mensal_std'}
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                      className="absolute inset-x-0 flex items-baseline gap-1"
                    >
                      <span className="text-2xl font-bold text-zinc-500">R$</span>
                      <span className="text-6xl font-display font-bold text-white tracking-tighter">
                        {isAnnual ? '499' : '49'}
                      </span>
                      <span className="text-lg font-bold text-white">,90</span>
                      <span className="text-zinc-500 font-medium ml-2">/{isAnnual ? 'ano' : 'mês'}</span>
                    </motion.div>
                  </div>
                  
                  <ul className="space-y-4 mb-10">
                    {['Apurações ilimitadas', 'Motor OCR 3.0', 'Filtro em 8 regras', 'Exportação em PDF'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-4 text-zinc-300">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button onClick={handleCTA} variant="outline" className="mt-auto w-full h-14 rounded-2xl text-base font-bold border-white/20 bg-transparent hover:bg-white hover:text-black transition-all">
                  Começar Plano Essencial
                </Button>
              </Card>
            </motion.div>

            {/* PLANO PREMIUM (Destaque) */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="h-full">
              <Card className="p-10 border-violet-500/50 bg-violet-950/20 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-violet-900/20 relative h-full flex flex-col overflow-hidden text-white group">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                
                <div className="absolute top-0 right-0 p-8">
                    <Badge className="bg-violet-600 text-white font-bold tracking-widest uppercase px-4 py-1.5 shadow-lg shadow-violet-600/30 font-display">Mais Popular</Badge>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                     <Star className="w-6 h-6 text-violet-400 fill-violet-400" />
                     <h3 className="text-xl font-display font-bold text-white">Premium Workstation</h3>
                  </div>
                  <p className="text-violet-200/70 font-light mb-8 h-12 pr-20">Fluxo ilimitado, suporte prioritário e relatórios detalhados.</p>
                  
                  <div className="mb-10 relative h-16">
                     <motion.div 
                      key={isAnnual ? 'anual_prm' : 'mensal_prm'}
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                      className="absolute inset-x-0 flex items-baseline gap-1"
                     >
                      <span className="text-2xl font-bold text-violet-400">R$</span>
                      <span className="text-6xl font-display font-bold text-white tracking-tighter">
                        {isAnnual ? '499' : '49'}
                      </span>
                      <span className="text-lg font-bold text-white">,90</span>
                      <span className="text-violet-300/60 font-medium ml-2">/{isAnnual ? 'ano' : 'mês'}</span>
                     </motion.div>
                  </div>
                  
                  <ul className="space-y-4 mb-10">
                    {['7 Dias de Teste Grátis (Cartão não exigido)', 'PDFs sem limite de páginas', 'Suporte Prioritário VIP', 'Exportação Inteligente: PDF + CSV', 'Update garantido aos novos mapas'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-4 text-white">
                        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/30">
                           <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto relative z-10">
                  <Button onClick={handleCTA} className="w-full h-14 rounded-2xl text-base font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98]">
                    Iniciar Teste Grátis de 7 Dias
                  </Button>
                  <p className="text-center text-xs text-violet-300/50 mt-4 font-medium uppercase tracking-widest">
                    Acesso Imediato
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden border-t border-white/5 bg-zinc-950">
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 to-transparent pointer-events-none" />
        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Pronto para a nova era da auditoria?</h2>
          <p className="text-xl text-zinc-400 font-light mb-10">Deixe os erros de lado e eleve o patamar de confiança das suas apurações agora.</p>
          <Button onClick={handleCTA} className="h-16 rounded-full px-12 text-lg font-bold bg-violet-600 text-white hover:bg-violet-500 shadow-xl shadow-violet-600/20 transition-all hover:scale-105">
            Abrir Hokma Workstation
          </Button>
        </div>
      </section>

      {/* ── FOOTER SAAS ────────────────────────────────────── */}
      <footer className="bg-[#030303] py-16 border-t border-white/10 relative z-10">
        <div className="container max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <Hexagon className="w-6 h-6 text-violet-500" />
             <span className="font-bold text-lg tracking-tight text-white font-display">Hokma Tech</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="mailto:contato@hokma.app" className="hover:text-white transition-colors">Exigir Suporte</a>
          </div>
          <p className="text-sm text-zinc-600 font-light">© {new Date().getFullYear()} Hokma Solutions.</p>
        </div>
      </footer>

    </div>
  );
}
