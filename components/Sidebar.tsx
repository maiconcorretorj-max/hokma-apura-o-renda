'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Hexagon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  {
    label: 'Nova Apuração',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Histórico',
    href: '/dashboard/historico',
    icon: History,
  },
  {
    label: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Settings,
  },
];

function NavItem({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[0];
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold tracking-tight transition-all duration-300 group',
        active
          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      )}
    >
      <Icon
        strokeWidth={2.5}
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-300',
          active ? 'text-primary-foreground' : 'group-hover:scale-110'
        )}
      />
      <span>{item.label}</span>
      {active && (
        <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary-foreground/60" />
      )}
    </Link>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'HK';

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-muted/40">
        <Hexagon className="h-6 w-6 text-primary fill-primary/20" />
        <div>
          <span className="font-extrabold text-base tracking-tighter text-foreground leading-none block">HOKMA</span>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Workstation
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1.5 px-4 py-6 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-3">
          Menu Principal
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            }
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-muted/40 p-4">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10 cursor-pointer">
          <Avatar className="h-9 w-9 shrink-0 shadow-sm">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold font-mono tracking-tighter">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold tracking-tight text-foreground truncate leading-tight">
              {user?.user_metadata?.full_name || 'Auditor'}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground truncate tracking-tight">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            onClick={signOut}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-muted/40 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur-3xl h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile: floating hamburger + Sheet */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl shadow-lg bg-background/80 backdrop-blur-md border-muted/50"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-r-muted/40 bg-background/95 backdrop-blur-2xl">
            <SidebarContent onNavClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
