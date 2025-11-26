'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, Document as DocumentType } from '@/lib/api';
import { Calendar, Globe, RefreshCw, ArrowLeft } from 'lucide-react';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocument();
  }, [params.id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await api.getDocument(Number(params.id));
      setDocument(doc);
    } catch (err: any) {
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!document) return;

    try {
      setRegenerating(true);
      const updated = await api.regenerateSummary(document.id);
      setDocument(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate summary');
    } finally {
      setRegenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-12 text-slate-500 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700 shadow-[8px_8px_16px_rgba(163,177,198,0.25),-8px_-8px_16px_rgba(255,255,255,0.9)]">
          {error || 'Document not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge variant="outline" className="border-primary/30 text-primary">
          {document.content_type.toUpperCase()}
        </Badge>
      </div>

      <Card className="border-transparent">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-800">
                {document.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow-[6px_6px_12px_rgba(163,177,198,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]">
                <Calendar className="h-4 w-4" />
                {formatDate(document.crawled_at)}
              </div>
              {document.url && (
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-primary shadow-[6px_6px_12px_rgba(163,177,198,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]"
                >
                  <Globe className="h-4 w-4" />
                  View original
                </a>
              )}
              {document.source && (
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-slate-600 shadow-[6px_6px_12px_rgba(163,177,198,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]">
                  Source: {document.source.name}
                </span>
              )}
            </div>
            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {document.summary && (
        <Card className="border-transparent">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Concise overview generated by AI</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateSummary}
                disabled={regenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{document.summary}</p>
          </CardContent>
        </Card>
      )}

      {document.explanation && (
        <Card className="border-transparent">
          <CardHeader>
            <CardTitle>Detailed Explanation</CardTitle>
            <CardDescription>Plain language breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {document.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {document.entities.length > 0 && (
        <Card className="border-transparent">
          <CardHeader>
            <CardTitle>Key Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {document.entities.map((entity) => (
                <div
                  key={entity.id}
                  className="rounded-2xl border border-white/60 bg-white/70 p-3 shadow-[8px_8px_16px_rgba(163,177,198,0.28),-8px_-8px_16px_rgba(255,255,255,0.9)]"
                >
                  <p className="font-medium text-slate-800">{entity.name}</p>
                  <p className="text-xs uppercase text-slate-500">{entity.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-transparent">
        <CardHeader>
          <CardTitle>Full Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {document.content_text}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
