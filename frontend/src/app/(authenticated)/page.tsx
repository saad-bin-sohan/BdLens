import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, BarChart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-[18px_18px_36px_rgba(163,177,198,0.35),-18px_-18px_36px_rgba(255,255,255,0.95)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-30%] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-[-20%] bottom-[-20%] h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <Badge variant="outline" className="w-fit border-primary/40 bg-white/80 text-primary">
              Neumorphic refresh · 2024
            </Badge>
            <h1 className="text-4xl font-semibold leading-tight text-slate-800 md:text-5xl">
              Calm, modern intelligence for local government records
            </h1>
            <p className="text-lg text-slate-600">
              BdLens turns dense notices into readable insight with AI summaries, semantic discovery,
              and admin tooling that respects your workflow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Semantic search
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/documents">
                <Button variant="secondary" size="lg" className="gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Browse docs
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Verified civic sources
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Instant summaries & explanations
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-primary" />
                Admin analytics for usage
              </div>
            </div>
          </div>

          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl">What you can do today</CardTitle>
              <CardDescription>
                One place to search, browse, and operationalize government documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-[10px_10px_20px_rgba(163,177,198,0.28),-10px_-10px_20px_rgba(255,255,255,0.9)]">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Ask in plain language</p>
                  <p className="text-xs text-slate-500">Semantic search across all sources</p>
                </div>
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-[10px_10px_20px_rgba(163,177,198,0.28),-10px_-10px_20px_rgba(255,255,255,0.9)]">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Get digestible summaries</p>
                  <p className="text-xs text-slate-500">AI explanations with entities and tags</p>
                </div>
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-[10px_10px_20px_rgba(163,177,198,0.28),-10px_-10px_20px_rgba(255,255,255,0.9)]">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Control the pipeline</p>
                  <p className="text-xs text-slate-500">Source management, uploads, analytics</p>
                </div>
                <BarChart className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="h-full border-transparent">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
              <Search className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Semantic Search</CardTitle>
            <CardDescription>
              Ask natural questions and pull back the exact sections that matter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search">
              <Button className="w-full">Start searching</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full border-transparent">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
              <FileText className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Browse Everything</CardTitle>
            <CardDescription>
              Filter by tags, sources, and dates to see the full document backlog.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents">
              <Button className="w-full" variant="secondary">
                Browse documents
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="h-full border-transparent">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
              <BarChart className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Admin HQ</CardTitle>
            <CardDescription>
              Manage ingestion sources, upload PDFs, and watch usage analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button className="w-full">Go to admin</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-transparent">
          <CardHeader>
            <CardTitle className="text-xl">Quick search</CardTitle>
            <CardDescription>Jump straight into search from the homepage.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/search" method="GET" className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex-1">
                  <Input
                    type="text"
                    name="q"
                    placeholder="Ask a question or search for topics..."
                    className="text-base"
                  />
                </div>
                <Button type="submit" className="md:w-36">
                  Search
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Tip: use natural language like “summarize last week’s council meeting decisions”.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="border-transparent">
          <CardHeader>
            <CardTitle className="text-xl">How it flows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-700">Collect</p>
                <p>Sources and manual uploads feed into a unified corpus.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-700">Enrich</p>
                <p>AI summaries, entities, and tags make documents digestible.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-700">Search & share</p>
                <p>Find answers fast, view details, and keep your team aligned.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
