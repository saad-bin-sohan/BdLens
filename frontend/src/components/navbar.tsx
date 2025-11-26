'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api, User } from '@/lib/api';
import { Search, FileText, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!user) return null;

  const navLinks = [
    { href: '/documents', label: 'Browse', icon: FileText },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },
  ];

  return (
    <nav className="sticky top-0 z-30 pb-4 pt-3 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-3 shadow-[12px_12px_24px_rgba(163,177,198,0.35),-12px_-12px_24px_rgba(255,255,255,0.9)]">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-accent text-white shadow-[10px_10px_20px_rgba(120,143,180,0.45),-10px_-10px_20px_rgba(255,255,255,0.9)]">
                <span className="text-lg font-black">B</span>
              </div>
              <div className="leading-tight">
                <p className="text-lg font-semibold text-slate-800">BdLens</p>
                <p className="text-xs text-slate-500">Local gov intelligence</p>
              </div>
            </Link>
            <div className="hidden items-center gap-2 md:flex">
              {navLinks
                .filter((link) => !link.adminOnly || user.is_admin)
                .map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-[8px_8px_16px_rgba(163,177,198,0.28),-8px_-8px_16px_rgba(255,255,255,0.95)] transition-all',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'bg-white/70 text-slate-600 hover:-translate-y-[1px]'
                      )}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden flex-col text-right text-xs text-slate-500 sm:flex">
              <span className="text-slate-700">{user.email}</span>
              <span className="text-[11px] text-slate-400">Signed in</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
