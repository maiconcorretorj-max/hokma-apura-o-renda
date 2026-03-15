'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

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
    <div className="bg-zinc-950 text-zinc-50 font-sans antialiased min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap');
        
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-manrope { font-family: 'Manrope', sans-serif; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #09090b; }
        ::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 9999px; }
        ::-webkit-scrollbar-thumb:hover { background: #6d28d9; }
        * { scrollbar-width: thin; scrollbar-color: #7c3aed #09090b; }
        
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out both; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />

      <header className="fixed w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
          <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-manrope">
                  <span className="font-montserrat font-bold text-2xl tracking-tighter">Hokma</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-sm font-medium font-manrope">
                  <a href="#features" className="hover:text-violet-400 transition-colors">Funcionalidades</a>
                  <a href="#stats" className="hover:text-violet-400 transition-colors">Performance</a>
                  <a href="#pricing" className="hover:text-violet-400 transition-colors">Planos</a>
              </div>
              <div className="hidden md:flex items-center gap-4 font-manrope">
                  {isLoggedIn ? (
                    <button onClick={handleCTA} className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                        Acessar Painel
                    </button>
                  ) : (
                    <>
                      <Link href="/login" className="text-sm font-medium hover:text-violet-400">Login</Link>
                      <button onClick={handleCTA} className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-full text-sm font-semibold transition-all">
                          Teste Grátis
                      </button>
                    </>
                  )}
              </div>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="md:hidden font-manrope"
              >
                  <Menu className="w-6 h-6" />
              </button>
          </nav>
          {mobileMenuOpen && (
              <div className="md:hidden bg-zinc-900 px-6 py-4 flex flex-col gap-4 border-b border-zinc-800 font-manrope">
                  <a href="#features" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
                  <a href="#stats" onClick={() => setMobileMenuOpen(false)}>Performance</a>
                  <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Planos</a>
                  {!isLoggedIn && <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>}
              </div>
          )}
      </header>

      <main className="font-manrope">
          <section id="hero" className="pt-32 pb-20 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center min-h-[90vh]">
              <div className="space-y-6 animate-fade-in-up">
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight font-montserrat tracking-tight">
                      Apuração de renda <span className="text-violet-500 transition-colors duration-300 hover:text-violet-400">automática</span> e determinística.
                  </h1>
                  <p className="text-zinc-400 text-lg">
                      Processamento de extratos bancários com precisão absoluta. Compatível com mais de 15 bancos, com novas instituições adicionadas constantemente para garantir que você nunca fique para trás.
                  </p>
                  <div className="flex flex-wrap gap-4">
                      <button onClick={handleCTA} className="bg-violet-600 hover:bg-violet-500 px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all">
                          {isLoggedIn ? 'Acessar o Painel' : 'Começar teste de 7 dias'} 
                          <ArrowRight className="w-4 h-4" />
                      </button>
                  </div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <img 
                    src="https://buildix-user-images.s3.us-east-2.amazonaws.com/ai-generated/734786c9-c559-43b1-90bb-b53dfb555e2f.webp" 
                    alt="Dashboard Preview" 
                    className="rounded-2xl shadow-2xl shadow-violet-500/20 w-full" 
                  />
              </div>
          </section>

          <section id="stats" className="py-20 bg-zinc-900/50">
              <div className="container mx-auto px-6">
                  <div className="grid md:grid-cols-3 gap-8">
                      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                          <h3 className="text-4xl font-bold text-violet-500 mb-2 font-montserrat tracking-tight">15+</h3>
                          <p className="text-zinc-400">Bancos suportados (atualizações constantes)</p>
                      </div>
                      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                          <h3 className="text-4xl font-bold text-violet-500 mb-2 font-montserrat tracking-tight">5min</h3>
                          <p className="text-zinc-400">Tempo médio de processamento</p>
                      </div>
                      <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
                          <h3 className="text-4xl font-bold text-violet-500 mb-2 font-montserrat tracking-tight">99.9%</h3>
                          <p className="text-zinc-400">Precisão determinística auditável</p>
                      </div>
                  </div>
              </div>
          </section>

          <section id="features" className="py-20 container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-3xl font-bold mb-4 font-montserrat tracking-tight">Desenvolvido para alta performance</h2>
                  <p className="text-zinc-400">Processamento robusto, seguro e sem caixas-pretas.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  <article className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-violet-500 transition-all">
                      <h3 className="text-xl font-bold mb-2 font-montserrat">Upload Inteligente</h3>
                      <p className="text-sm text-zinc-400">Suporte a diversos bancos brasileiros com parsing que ignora ruídos e foca na sua renda real.</p>
                  </article>
                  <article className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-violet-500 transition-all">
                      <h3 className="text-xl font-bold mb-2 font-montserrat">Cálculo Instantâneo</h3>
                      <p className="text-sm text-zinc-400">Substitua o trabalho manual de planilhas por uma lógica determinística testada e veloz.</p>
                  </article>
                  <article className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-violet-500 transition-all">
                      <h3 className="text-xl font-bold mb-2 font-montserrat">Segurança Total</h3>
                      <p className="text-sm text-zinc-400">Dados protegidos com autenticação e arquitetura focada em conformidade e privacidade.</p>
                  </article>
              </div>
          </section>

          <section id="pricing" className="py-20 bg-zinc-950 border-t border-zinc-900">
              <div className="container mx-auto px-6">
                  <h2 className="text-3xl font-bold text-center mb-16 font-montserrat tracking-tight">Planos que acompanham seu crescimento</h2>
                  <div className="grid md:grid-cols-3 gap-8">
                      <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-800 hover:scale-105 transition-transform duration-300">
                          <h3 className="text-lg font-semibold font-montserrat">Mensal</h3>
                          <p className="text-4xl font-bold my-4">R$ 199<span className="text-sm text-zinc-500">/mês</span></p>
                          <ul className="space-y-3 mb-8 text-zinc-400">
                              <li>Processamento ilimitado</li>
                              <li>Suporte prioritário</li>
                              <li>Acesso a novos bancos</li>
                          </ul>
                          <button onClick={handleCTA} className="w-full py-3 rounded-xl border border-violet-600 hover:bg-violet-600 transition-all font-semibold">Assinar</button>
                      </div>
                      <div className="p-8 bg-violet-900/20 rounded-3xl border border-violet-500 scale-105 shadow-2xl shadow-violet-500/10">
                          <span className="bg-violet-600 text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">Mais popular</span>
                          <h3 className="text-lg font-semibold mt-2 font-montserrat">Anual</h3>
                          <p className="text-4xl font-bold my-4">R$ 149<span className="text-sm text-zinc-500">/mês</span></p>
                          <ul className="space-y-3 mb-8 text-zinc-400">
                              <li>2 meses grátis</li>
                              <li>Relatórios avançados</li>
                              <li>API exclusiva</li>
                          </ul>
                          <button onClick={handleCTA} className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 transition-all font-bold text-white">Assinar</button>
                      </div>
                      <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-800 hover:scale-105 transition-transform duration-300">
                          <h3 className="text-lg font-semibold font-montserrat">Enterprise</h3>
                          <p className="text-4xl font-bold my-4">Custom</p>
                          <ul className="space-y-3 mb-8 text-zinc-400">
                              <li>Integração total</li>
                              <li>SLA dedicada</li>
                              <li>Treinamento de equipe</li>
                          </ul>
                          <button onClick={() => window.location.href='mailto:contato@hokma.app'} className="w-full py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 transition-all font-semibold">Falar com Vendas</button>
                      </div>
                  </div>
              </div>
          </section>
      </main>

      <footer id="footer" className="py-12 border-t border-zinc-800 bg-zinc-950">
          <div className="container mx-auto px-6 text-center text-zinc-500 text-sm font-manrope">
              <p>© {new Date().getFullYear()} Hokma Financial Solutions. Todos os direitos reservados.</p>
          </div>
      </footer>
    </div>
  );
}
