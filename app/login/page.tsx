'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirecionar se já está autenticado
  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Serviço de autenticação não configurado.');
      return;
    }

    if (!email || !password) {
      toast.error('Preencha email e senha.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Conta criada! Verifique seu email para confirmar o cadastro.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      if (msg.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos.');
      } else if (msg.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Faça login.');
        setMode('login');
      } else if (msg.includes('Email not confirmed')) {
        toast.error('Confirme seu email antes de entrar.');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Back to landing */}
      <div className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>

      {/* Login card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl mb-4">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-primary fill-current">
                <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" opacity=".3" />
                <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z" fillOpacity=".1" />
                <rect x="5" y="5" width="3" height="3" rx=".5" />
                <rect x="16" y="5" width="3" height="3" rx=".5" />
                <rect x="5" y="16" width="3" height="3" rx=".5" />
                <rect x="16" y="16" width="3" height="3" rx=".5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">HOKMA</h1>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">Sistema de Apuração de Renda</p>
            <p className="text-muted-foreground text-sm mt-2">
              {mode === 'login' ? 'Acesse sua conta para continuar' : 'Crie sua conta gratuita'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/20">
            {/* Tabs */}
            <div className="flex bg-muted/50 rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="bg-background pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold h-10" disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</>
                ) : mode === 'login' ? (
                  'Entrar na Plataforma'
                ) : (
                  'Criar Conta Gratuita'
                )}
              </Button>
            </form>

            {mode === 'login' && (
              <p className="text-center text-xs text-muted-foreground mt-4">
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Cadastre-se gratuitamente
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p className="text-center text-xs text-muted-foreground mt-4">
                Já tem uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline font-medium"
                >
                  Faça login
                </button>
              </p>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-6">
            Seus dados são processados localmente. Auditoria SHA-256.
          </p>
        </div>
      </div>
    </div>
  );
}
