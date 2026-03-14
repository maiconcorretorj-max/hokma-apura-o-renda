'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Mail, Lock, ArrowLeft, Eye, EyeOff,
  MailCheck, RefreshCw, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

type Screen = 'login' | 'signup' | 'verify';

// Logo HOKMA inline
function HokmaLogo() {
  return (
    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl">
      <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none">
        <rect x="4"  y="4"  width="12" height="12" rx="2" className="fill-primary" />
        <rect x="20" y="4"  width="12" height="12" rx="2" className="fill-primary opacity-60" />
        <rect x="4"  y="20" width="12" height="12" rx="2" className="fill-primary opacity-60" />
        <rect x="20" y="20" width="12" height="12" rx="2" className="fill-primary" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [screen, setScreen]             = useState<Screen>('login');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [resending, setResending]       = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Auth listeners ─────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    // Se já tem sessão → vai direto
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });

    // Escuta qualquer mudança de auth (inclui callback do email de confirmação)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        toast.success('Autenticado com sucesso!');
        router.replace('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // ── Cooldown do botão reenviar ──────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Handlers ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Serviço de autenticação não configurado.');
      return;
    }
    if (!email.trim() || !password) {
      toast.error('Preencha email e senha.');
      return;
    }
    if (password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (screen === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            // Mostra tela de verificação com contexto
            setScreen('verify');
            toast.info('Confirme seu email primeiro. Reenviamos o link.');
            await supabase.auth.resend({ type: 'signup', email });
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Email ou senha incorretos.');
          } else {
            toast.error(error.message);
          }
          return;
        }
        // onAuthStateChange cuida do redirect
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error('Este email já está cadastrado. Faça login.');
            setScreen('login');
          } else {
            toast.error(error.message);
          }
          return;
        }
        // Se autoconfirm ativo, já tem sessão
        if (data.session) {
          toast.success('Conta criada e login realizado!');
          router.replace('/dashboard');
        } else {
          setScreen('verify');
          setResendCooldown(60);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!supabase || resendCooldown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        toast.error('Erro ao reenviar email: ' + error.message);
      } else {
        toast.success('Email reenviado! Verifique sua caixa de entrada e spam.');
        setResendCooldown(60);
      }
    } finally {
      setResending(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Back */}
      <div className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md space-y-6">

          {/* Brand */}
          <div className="text-center space-y-2">
            <HokmaLogo />
            <h1 className="text-2xl font-black tracking-tight">HOKMA</h1>
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-medium">
              Sistema de Apuração de Renda
            </p>
          </div>

          {/* ── VERIFY EMAIL SCREEN ───────────────────────── */}
          {screen === 'verify' && (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/20 space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <MailCheck className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold">Confirme seu email</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enviamos um link de confirmação para
                </p>
                <p className="font-semibold text-foreground break-all">{email}</p>
                <p className="text-sm text-muted-foreground">
                  Clique no link do email para ativar sua conta. Verifique também a caixa de <strong>spam</strong>.
                </p>
              </div>

              <div className="space-y-3">
                {/* O botão fica desabilitado por 60s após envio */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                >
                  {resending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Reenviando...</>
                  ) : resendCooldown > 0 ? (
                    <><RefreshCw className="h-4 w-4 mr-2" />Reenviar em {resendCooldown}s</>
                  ) : (
                    <><RefreshCw className="h-4 w-4 mr-2" />Reenviar email de confirmação</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground/60">
                  Após clicar no link do email você será redirecionado automaticamente.
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Email errado?</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => { setScreen('signup'); setPassword(''); }}
                >
                  Usar outro email
                </Button>
              </div>
            </div>
          )}

          {/* ── LOGIN / SIGNUP SCREEN ─────────────────────── */}
          {screen !== 'verify' && (
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/20 space-y-6">
              {/* Tabs */}
              <div className="flex bg-muted/50 rounded-xl p-1">
                {(['login', 'signup'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setScreen(s); setPassword(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                      screen === s
                        ? 'bg-card shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s === 'login' ? 'Entrar' : 'Criar Conta'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm">
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
                    required
                  />
                </div>

                {/* Senha */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Senha
                    {screen === 'signup' && (
                      <span className="text-muted-foreground/60 text-xs font-normal">(mínimo 6 caracteres)</span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete={screen === 'login' ? 'current-password' : 'new-password'}
                      className="bg-background pr-10"
                      required
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

                {/* Submit */}
                <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando...</>
                  ) : screen === 'login' ? (
                    'Entrar na Plataforma'
                  ) : (
                    'Criar Conta Gratuita'
                  )}
                </Button>
              </form>

              {/* Crosslink */}
              <p className="text-center text-xs text-muted-foreground">
                {screen === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
                <button
                  onClick={() => { setScreen(screen === 'login' ? 'signup' : 'login'); setPassword(''); }}
                  className="text-primary hover:underline font-semibold"
                >
                  {screen === 'login' ? 'Cadastre-se gratuitamente' : 'Faça login'}
                </button>
              </p>
            </div>
          )}

          {/* O que esperar após cadastro */}
          {screen === 'signup' && (
            <div className="bg-muted/20 border border-border rounded-xl px-5 py-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">O que acontece após o cadastro?</p>
              <div className="space-y-1.5">
                {[
                  'Você receberá um email de confirmação',
                  'Clique no link para ativar a conta',
                  'Será redirecionado automaticamente para o dashboard',
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground/40">
            100% seguro · Auditoria SHA-256 · Dados criptografados
          </p>
        </div>
      </div>
    </div>
  );
}
