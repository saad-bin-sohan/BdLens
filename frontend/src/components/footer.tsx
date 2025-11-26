import Link from 'next/link';
import { Mail, MapPin, Sparkles } from 'lucide-react';

export function Footer() {
  const quickLinks = [
    { href: '/search', label: 'Semantic Search' },
    { href: '/documents', label: 'Browse Documents' },
    { href: '/admin', label: 'Admin Dashboard' },
    { href: '/admin/upload', label: 'Upload PDF' },
  ];

  return (
    <footer className="mt-16 pb-10">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-8 shadow-[16px_16px_32px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)] backdrop-blur">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-[10px_10px_20px_rgba(120,143,180,0.45),-10px_-10px_20px_rgba(255,255,255,0.9)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-800">BdLens</p>
                  <p className="text-sm text-slate-500">Readable, searchable civic records</p>
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm text-slate-500">
                AI-powered insights, summaries, and semantic discovery for local government documents.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700">Explore</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-500">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 text-sm text-slate-500">
              <h4 className="text-sm font-semibold text-slate-700">Contact</h4>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@bdlens.app</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>
          <div className="soft-divider mt-8" />
          <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} BdLens. All rights reserved.</span>
            <span className="text-slate-400">Neumorphic refresh crafted for clarity and calm.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
