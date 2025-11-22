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
      <div className="text-center py-12">
        <p className="text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="p-4 text-red-600 bg-red-50 rounded-md">
          {error || 'Document not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {document.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(document.crawled_at)}
              </div>
              {document.url && (
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Original
                </a>
              )}
              <Badge variant="secondary">
                {document.content_type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {document.tags.map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
          </div>
        )}

        {/* Source */}
        {document.source && (
          <p className="text-sm text-gray-600 mb-4">
            Source: {document.source.name}
          </p>
        )}
      </div>

      {/* Summary */}
      {document.summary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Summary</CardTitle>
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
            <p className="text-gray-700 leading-relaxed">{document.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      {document.explanation && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Explanation</CardTitle>
            <CardDescription>Plain language breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {document.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entities */}
      {document.entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {document.entities.map((entity) => (
                <div key={entity.id} className="border-l-2 border-primary pl-3">
                  <p className="font-medium">{entity.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{entity.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Content */}
      <Card>
        <CardHeader>
          <CardTitle>Full Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {document.content_text}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
