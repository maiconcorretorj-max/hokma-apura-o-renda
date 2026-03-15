'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, Shield, Zap, FileText,
  Clock, Cpu, Settings, Lock, FileSearch, Database,
  ChevronRight, Hexagon, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function HokmaLanding() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  }, []);

  const handleCTA = () => router.push(isLoggedIn ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden">
      
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <header className="fixed top-0 z-50 w-full border-b border-muted/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-6 max-w-screen-xl mx-auto">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Hexagon className="h-4 w-4 fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">HOKMA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[['#como-funciona', 'Como Funciona'], ['#vantagens', 'Vantagens'], ['#pricing', 'Preços']].map(([href, label]) => (
              <a key={href} href={href} className="text-sm font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Button onClick={handleCTA} className="font-semibold tracking-tight shadow-sm rounded-full px-6">
                Acessar Painel <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex text-muted-foreground hover:text-foreground font-medium tracking-tight">
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button onClick={handleCTA} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-semibold tracking-tight rounded-full px-5 transition-transform hover:scale-105">
                  Teste Grátis <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO SAAS ──────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center">
        {/* Kokonut-style Glow */}
        <div className="absolute top-0 inset-x-0 h-[500px] pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background opacity-60 blur-2xl" />
        
        <motion.div 
          initial="hidden" animate="visible" variants={stagger}
          className="container max-w-screen-md mx-auto text-center space-y-8 px-6"
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <Badge variant="outline" className="px-3 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary shadow-sm font-medium tracking-wide flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Motor v3.0 Lançado
            </Badge>
          </motion.div>

          <motion.h1 
            variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.05]"
          >
            Apure rendimentos em <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">segundos</span>, não em horas.
          </motion.h1>

          <motion.p 
            variants={fadeUp}
            className="text-xl text-muted-foreground font-medium leading-relaxed tracking-tight max-w-2xl mx-auto"
          >
            Pare de perder tempo com PDFs caóticos e planilhas instáveis. O Hokma é o motor de apuração que centraliza clientes, extrai extratos automaticamente e purifica os números numa matriz infalível.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4 justify-center items-center">
             <Button
                size="lg"
                onClick={handleCTA}
                className="h-14 px-8 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/25 rounded-full w-full sm:w-auto"
              >
                {isLoggedIn ? 'Acessar o Painel' : 'Iniciar Teste de 7 Dias Grátis'}
                <ArrowRight className="h-5 w-5 ml-2.5" />
              </Button>
              <p className="sm:hidden text-sm text-muted-foreground mt-2">Cancele quando quiser. Sem cartão agora.</p>
          </motion.div>

          <motion.div variants={fadeUp} className="pt-10 flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Zero IA (Resultados Exatos)</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>+14 Bancos Mapeados</span>
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── PROBLEM / AGITATION ────────────────────────────── */}
      <section id="vantagens" className="py-24 bg-secondary/30 border-y border-muted/40">
        <div className="container max-w-screen-xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16 max-w-3xl mx-auto space-y-4"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground">
              Ainda faz apurações na mão?
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              A auditoria financeira artesanal é lenta, sujeita a falhas humanas e consome as horas mais preciosas da sua operação.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Perda de Tempo Irreparável', desc: 'Digitar valores no Excel linha por linha demora dezenas de horas preciosas por cliente ou projeto judicial.', icon: Clock },
              { title: 'Insegurança nas Planilhas', desc: 'No sistema arcaico, um simples erro de digitação compromete e invalida toda a arquitetura de apuração.', icon: Shield },
              { title: 'PDFs Impossíveis (OCR)', desc: 'Banco mandou scan fotografado ou ilegível? Nossa tecnologia nativa extrai os caracteres com precisão Tesseract.', icon: FileSearch },
            ].map((err, i) => (
               <motion.div 
                 key={err.title}
                 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                 className="bg-card/40 backdrop-blur-sm border border-muted/50 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
               >
                 <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
                   <err.icon className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold text-foreground mb-3">{err.title}</h3>
                 <p className="text-muted-foreground font-medium leading-relaxed">{err.desc}</p>
               </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION / HOW IT WORKS ────────────────────────── */}
      <section id="como-funciona" className="py-32">
        <div className="container max-w-screen-xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-[1.1]">
                Um pipeline puríssimo de <span className="text-primary">A a Z</span>.
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                Transformamos caos bancário em matrizes organizadas usando regras matemáticas, sem adivinhação.
              </p>
              
              <div className="space-y-6 pt-4">
                {[
                  { title: '1. O Upload Instantâneo', desc: 'Arraste o PDF de qualquer um dos 14 bancos mapeados. O motor faz o fingerprint de segurança.' },
                  { title: '2. Filtro em 8 Cascadas', desc: 'Nosso algoritmo de 8 níveis exclui imediatamente débitos, estornos, apostas (BETs) e lavagens.' },
                  { title: '3. Análise Final & Relatório', desc: 'Acompanhe na dashboard. Ajuste linhas não categorizadas em 1-clique e obtenha a matriz real provada.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mt-1">
                      {step.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground">{step.title.substring(3)}</h4>
                      <p className="text-muted-foreground font-medium mt-1">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="relative perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent blur-3xl -z-10 rounded-full" />
              <Card className="border border-muted/50 bg-card/60 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 p-2 rotate-y-[-3deg] rotate-x-[4deg] hover:rotate-0 transition-transform duration-700">
                <div className="border border-muted/30 bg-background rounded-2xl p-6 h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-8 border-b border-muted/30 pb-4">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-destructive/60" />
                       <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                       <div className="w-3 h-3 rounded-full bg-primary/60" />
                    </div>
                    <div className="text-xs font-mono font-medium text-muted-foreground">hokma_engine_v3</div>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                     <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                        <span className="text-sm font-semibold">Total Limpo Apurado</span>
                        <span className="text-xl font-bold text-primary">R$ 38.540,00</span>
                     </div>
                     <div className="space-y-2 mt-6">
                        <div className="h-10 border border-muted/50 bg-secondary/30 rounded-lg flex items-center px-4 justify-between">
                           <span className="text-[11px] font-medium">PIX SALÁRIO — STARTUP LTDA</span>
                           <span className="text-[11px] font-bold text-emerald-500">+ R$ 12.000,00</span>
                        </div>
                        <div className="h-10 border border-muted/50 bg-secondary/30 rounded-lg flex items-center px-4 justify-between">
                           <span className="text-[11px] font-medium line-through opacity-60">Autotransferência — Nubank p/ C6</span>
                           <span className="text-[11px] font-bold text-muted-foreground opacity-60">R$ 5.500,00</span>
                        </div>
                        <div className="h-10 border border-muted/50 bg-secondary/30 rounded-lg flex items-center px-4 justify-between">
                           <span className="text-[11px] font-medium line-through opacity-60">PIX BETANO JOGOS LTDA</span>
                           <span className="text-[11px] font-bold text-orange-500 opacity-60">R$ 1.500,00</span>
                        </div>
                     </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PRICING SAAS (Kokonut Vibe) ────────────────────── */}
      <section id="pricing" className="py-32 bg-secondary/20 border-y border-muted/40">
        <div className="container max-w-screen-xl mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="text-center mb-16 space-y-4 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-foreground">
              Apenas um investimento. <br/><span className="text-primary">Retorno em tempo recorde.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Não pague por página nem por hora. Um valor fixo para otimizar suas auditorias. Cancele quando quiser.
            </p>
          </motion.div>

          <div className="flex justify-center mb-10 relative z-20">
            <div className="bg-muted p-1.5 rounded-full inline-flex items-center shadow-inner border border-muted/50">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!isAnnual ? 'bg-background shadow-md text-foreground scale-105' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Mensal
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isAnnual ? 'bg-background shadow-md text-foreground scale-105' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Anual <span className="ml-[6px] text-[10px] bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full">Desconto 16%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch place-items-stretch">
            
            {/* PLANO STANDARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="h-full">
              <Card className="p-8 border-muted/50 bg-card/60 backdrop-blur-md rounded-[2rem] shadow-sm hover:border-primary/30 transition-colors h-full flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-foreground">Mensal (Compromisso Zero)</h3>
                    <p className="text-muted-foreground mt-2 font-medium">Ideal para testar a ferramenta e fechar contratos menores.</p>
                  </div>
                  <div className="mb-8 relative h-16">
                    <motion.div 
                      key={isAnnual ? 'anual_std' : 'mensal_std'}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                      className="absolute inset-x-0"
                    >
                      <span className="text-5xl font-extrabold tracking-tighter text-foreground">
                        R$ {isAnnual ? '499,90' : '49,90'}
                      </span>
                      <span className="text-muted-foreground font-medium ml-1">/{isAnnual ? 'ano' : 'mês'}</span>
                    </motion.div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {['Apurações ilimitadas', 'Motor OCR paralelo', '8 regras determinísticas', 'Rastreabilidade SHA-256'].map(feature => (
                      <li key={feature} className="flex items-center gap-3 text-muted-foreground font-medium">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 opacity-80" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button onClick={handleCTA} variant="outline" className="w-full h-14 rounded-2xl text-base font-bold border-muted/60 bg-transparent hover:bg-muted text-foreground transition-all">
                  Começar Plano Básico
                </Button>
              </Card>
            </motion.div>

            {/* PLANO PREMIUM (Destaque) */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="h-full">
              <Card className="relative p-8 border-primary bg-primary/[0.03] backdrop-blur-md rounded-[2rem] shadow-2xl shadow-primary/10 h-full flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                    <Badge className="bg-primary text-primary-foreground font-bold tracking-widest uppercase px-3 py-1 shadow-sm">Teste 7 Dias Grátis</Badge>
                </div>
                <div>
                  <div className="mb-6 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                       <Star className="w-5 h-5 text-primary fill-primary" />
                       <h3 className="text-2xl font-bold text-foreground">Assinatura Premium</h3>
                    </div>
                    <p className="text-muted-foreground font-medium">Tenha garantia absoluta e economize na contratação anual.</p>
                  </div>
                  <div className="mb-8 relative h-16">
                     <motion.div 
                      key={isAnnual ? 'anual_prm' : 'mensal_prm'}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                      className="absolute inset-x-0"
                     >
                      <span className="text-5xl font-extrabold tracking-tighter text-foreground">
                        R$ {isAnnual ? '499,90' : '49,90'}
                      </span>
                      <span className="text-muted-foreground font-medium ml-1">/{isAnnual ? 'ano' : 'mês'}</span>
                     </motion.div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {['7 Dias de Teste Gratuito', 'Extratos sem limite de páginas', 'Suporte Prioritário Especializado', 'Atualizações Automáticas V3+', 'Relatórios Exportáveis em Lote'].map(feature => (
                      <li key={feature} className="flex items-center gap-3 text-foreground font-medium">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <Button onClick={handleCTA} className="w-full h-14 rounded-2xl text-base font-extrabold tracking-tight bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-transform hover:scale-[1.03]">
                    Iniciar Teste Grátis de 7 Dias
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-4 font-semibold opacity-70">
                    Acesso imediato à Workstation.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER SAAS ────────────────────────────────────── */}
      <footer className="bg-background py-16 border-t border-muted/40">
        <div className="container max-w-screen-xl mx-auto px-6 flex flex-col items-center justify-center text-center space-y-6">
          <Hexagon className="w-10 h-10 text-primary opacity-80" />
          <h2 className="text-2xl font-bold tracking-tighter text-foreground">HOKMA WORKSTATION</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-md">
            A solução determinística criada para resolver definitivamente o caos da apuração contábil em PDFs bancários.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-semibold tracking-tight pt-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Termos de Uso</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Política de Privacidade</a>
            <a href="mailto:contato@hokma.app" className="text-muted-foreground hover:text-foreground transition-colors">Falar com Suporte</a>
          </div>
          <p className="text-xs text-muted-foreground/50 pt-4 font-medium">© {new Date().getFullYear()} Hokma Technologies. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
