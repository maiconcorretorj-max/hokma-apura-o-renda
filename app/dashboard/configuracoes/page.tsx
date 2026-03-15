'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Palette,
  BookOpen,
  Camera,
  Save,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Check,
  Loader2,
  AlertTriangle,
  Info,
  Bell,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Tema ──────────────────────────────────────────────────────────────────────
type Tema = 'light' | 'dark' | 'system';

function useTheme() {
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('hokma_theme') as Tema) ?? 'system';
  });

  const aplicarTema = (t: Tema) => {
    setTema(t);
    localStorage.setItem('hokma_theme', t);
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  return { tema, aplicarTema };
}

// ── Sub-abas ──────────────────────────────────────────────────────────────────

function TabConta() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setNome(user.user_metadata.full_name);
    }
  }, [user]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'HK';

  const salvarPerfil = async () => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('Supabase não configurado.');
      return;
    }
    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nome.trim() },
      });
      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar perfil.');
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/15 text-primary text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
            <Camera className="h-3 w-3 text-white" />
          </button>
        </div>
        <div>
          <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'Usuário'}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Separator />

      {/* Campos */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="config-nome">Nome completo</Label>
          <Input
            id="config-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome completo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="config-email">E-mail</Label>
          <Input
            id="config-email"
            value={user?.email ?? ''}
            disabled
            className="bg-muted text-muted-foreground cursor-not-allowed"
          />
          <p className="text-[11px] text-muted-foreground">
            Para alterar o e-mail, entre em contato com o suporte.
          </p>
        </div>
      </div>

      <Button onClick={salvarPerfil} disabled={salvando} className="gap-2">
        {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar alterações
      </Button>
    </div>
  );
}

function TabSeguranca() {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const alterarSenha = async () => {
    if (novaSenha !== confirmar) {
      toast.error('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!isSupabaseConfigured || !supabase) return;

    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      toast.success('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmar('');
    } catch (err) {
      toast.error('Erro ao alterar senha. Verifique sua sessão.');
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/30 dark:bg-amber-900/10 p-4 flex gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Após alterar a senha, sua sessão será encerrada automaticamente em todos os dispositivos.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Alterar senha</h3>

        <div className="space-y-2">
          <Label htmlFor="senha-nova">Nova senha</Label>
          <div className="relative">
            <Input
              id="senha-nova"
              type={mostrar ? 'text' : 'password'}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setMostrar(!mostrar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha-confirmar">Confirmar nova senha</Label>
          <Input
            id="senha-confirmar"
            type={mostrar ? 'text' : 'password'}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repita a nova senha"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Autenticação em dois fatores</p>
            <p className="text-sm text-muted-foreground">Adiciona uma camada extra de segurança</p>
          </div>
          <Switch disabled />
        </div>
        <p className="text-xs text-muted-foreground">
          2FA via app autenticador — em breve disponível.
        </p>
      </div>

      <Button onClick={alterarSenha} disabled={salvando || !novaSenha} className="gap-2">
        {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
        Alterar senha
      </Button>
    </div>
  );
}

function TabAparencia() {
  const { tema, aplicarTema } = useTheme();

  const opcoes = [
    { value: 'light' as Tema, label: 'Claro', icon: Sun },
    { value: 'dark' as Tema, label: 'Escuro', icon: Moon },
    { value: 'system' as Tema, label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Tema</h3>
        <p className="text-sm text-muted-foreground">
          Escolha o tema visual da interface
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {opcoes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => aplicarTema(value)}
            className={cn(
              'relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
              tema === value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40 hover:bg-muted'
            )}
          >
            {tema === value && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              tema === value ? 'bg-primary/15' : 'bg-muted'
            )}>
              <Icon className={cn(
                'h-5 w-5',
                tema === value ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>
            <span className={cn(
              'text-sm font-medium',
              tema === value ? 'text-primary' : 'text-muted-foreground'
            )}>
              {label}
            </span>
          </button>
        ))}
      </div>

      <Separator />

      <div className="rounded-xl border border-border bg-muted/30 p-4 flex gap-3">
        <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          A preferência de tema é salva localmente no seu navegador.
        </p>
      </div>
    </div>
  );
}

function TabDocumentacao() {
  const sections = [
    {
      title: '📄 O que é o Motor de Apuração?',
      content: `O HOKMA é um sistema 100% determinístico para apuração de renda a partir de extratos bancários em PDF. Não utiliza inteligência artificial — todas as regras são baseadas em lógica explícita, garantindo auditabilidade total.`,
    },
    {
      title: '🚀 Como usar?',
      content: `1. Acesse a aba "Nova Apuração"\n2. Informe o nome completo do cliente (obrigatório)\n3. Informe o CPF se disponível (melhora a detecção de autotransferências)\n4. Faça upload do extrato bancário em PDF\n5. Aguarde o processamento — pode levar alguns minutos para PDFs escaneados\n6. Analise os resultados e exporte o laudo em PDF`,
    },
    {
      title: '🏦 Bancos suportados',
      content: `• Nubank\n• Itaú\n• Bradesco\n• Santander\n• Caixa Econômica Federal\n• Banco do Brasil\n• Inter\n• Neon\n• PicPay\n• Mercado Pago\n• Revolut\n• Sicredi / Sicoob\n• XP Investimentos\n• BTG Pactual\n• E outros (via OCR para PDFs escaneados)`,
    },
    {
      title: '🔍 O que é apurado?',
      content: `• Créditos por mês (salário, freelance, Pix recebido, depósitos, dividendos)\n• Média de renda mensal\n• Exclusão automática de autotransferências\n• Exclusão de estornos, ajustes e transferências entre contas próprias`,
    },
    {
      title: '📊 Exportação',
      content: `Na página de análise, você pode exportar o laudo completo em PDF incluindo:\n• Identificação do cliente e hash SHA-256 do documento original\n• Resumo de renda por mês\n• Listagem detalhada de todas as transações identificadas`,
    },
    {
      title: '🔒 Segurança e privacidade',
      content: `• Todos os PDFs são processados localmente no seu navegador\n• Os arquivos nunca são enviados para servidores externos\n• Apenas o texto extraído é enviado para a API de apuração\n• O histórico de apurações é salvo criptografado no Supabase com Row Level Security`,
    },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      {sections.map((s) => (
        <div key={s.title} className="bg-card border border-border rounded-xl p-5 space-y-2">
          <h3 className="font-semibold text-foreground">{s.title}</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
            {s.content}
          </p>
        </div>
      ))}
    </div>
  );
}

function TabNotificacoes() {
  const [notifAcessos, setNotifAcessos] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hokma_notif_acessos') !== 'false';
  });
  const [notifRelatorios, setNotifRelatorios] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hokma_notif_relatorios') !== 'false';
  });
  const [notifSeguranca, setNotifSeguranca] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hokma_notif_seguranca') !== 'false';
  });

  const salvarNotificacoes = () => {
    localStorage.setItem('hokma_notif_acessos', String(notifAcessos));
    localStorage.setItem('hokma_notif_relatorios', String(notifRelatorios));
    localStorage.setItem('hokma_notif_seguranca', String(notifSeguranca));
    toast.success('Preferências de notificação salvas!');
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="font-semibold text-foreground mb-1">Preferências de Comunicação</h3>
        <p className="text-sm text-muted-foreground">
          Escolha como e quando você deseja receber alertas do sistema
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/30">
          <div className="space-y-0.5">
            <Label className="text-base">Novos acessos</Label>
            <p className="text-xs text-muted-foreground">Alertar quando minha conta for acessada em um novo navegador</p>
          </div>
          <Switch checked={notifAcessos} onCheckedChange={setNotifAcessos} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/30">
          <div className="space-y-0.5">
            <Label className="text-base">Relatórios semanais</Label>
            <p className="text-xs text-muted-foreground">Receber um resumo das apurações realizadas na semana</p>
          </div>
          <Switch checked={notifRelatorios} onCheckedChange={setNotifRelatorios} />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/30">
          <div className="space-y-0.5">
            <Label className="text-base">Alertas de segurança</Label>
            <p className="text-xs text-muted-foreground">Notificações críticas sobre atualizações de senha e 2FA</p>
          </div>
          <Switch checked={notifSeguranca} onCheckedChange={setNotifSeguranca} />
        </div>
      </div>

      <Separator />

      <Button onClick={salvarNotificacoes} className="gap-2">
        <Save className="h-4 w-4" />
        Salvar preferências
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  useAuth(true);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="conta" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 w-full sm:w-auto sm:inline-flex">
            <TabsTrigger value="conta" className="gap-2 text-xs sm:text-sm">
              <User className="h-3.5 w-3.5" />
              Conta
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="gap-2 text-xs sm:text-sm">
              <Shield className="h-3.5 w-3.5" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-2 text-xs sm:text-sm">
              <Palette className="h-3.5 w-3.5" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="gap-2 text-xs sm:text-sm">
              <Bell className="h-3.5 w-3.5" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="documentacao" className="gap-2 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" />
              Documentação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conta">
            <TabConta />
          </TabsContent>
          <TabsContent value="seguranca">
            <TabSeguranca />
          </TabsContent>
          <TabsContent value="aparencia">
            <TabAparencia />
          </TabsContent>
          <TabsContent value="notificacoes">
            <TabNotificacoes />
          </TabsContent>
          <TabsContent value="documentacao">
            <TabDocumentacao />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
