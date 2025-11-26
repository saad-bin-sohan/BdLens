'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, DocumentListItem, Tag, DocumentSource } from '@/lib/api';
import { FileText, Calendar, Search } from 'lucide-react';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docsData, tagsData] = await Promise.all([
        api.listDocuments(),
        api.listTags(),
      ]);
      setDocuments(docsData);
      setTags(tagsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const docs = await api.listDocuments({
        search: searchQuery || undefined,
        tag: selectedTag || undefined,
      });
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Failed to filter documents');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit border-primary/40 bg-white/70 text-primary">
          Document Library
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-800">Browse all ingested documents</h1>
        <p className="text-slate-600">Filter by tags or keywords to explore the full corpus.</p>
      </div>

      <Card className="border-transparent">
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="neu-input h-12 rounded-xl px-4 text-sm text-slate-700 focus-visible:outline-none"
            >
              <option value="">All tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>

            <Button onClick={handleFilter} className="md:min-w-[140px]">
              <Search className="h-4 w-4 mr-2" />
              Filter
            </Button>

            {(searchQuery || selectedTag) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('');
                  loadData();
                }}
              >
                Clear
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-500">Showing {documents.length} documents.</p>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700 shadow-[8px_8px_16px_rgba(163,177,198,0.25),-8px_-8px_16px_rgba(255,255,255,0.9)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-10 text-slate-500 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
          <Search className="h-10 w-10 animate-pulse text-primary" />
          <p className="text-sm">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-12 text-center text-slate-600 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
          <FileText className="h-12 w-12 text-slate-400" />
          <p className="text-lg font-semibold text-slate-700">No documents found</p>
          <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="cursor-pointer border-transparent transition-all hover:-translate-y-[2px] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.3),-16px_-16px_32px_rgba(255,255,255,0.95)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      {doc.summary && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {doc.content_type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(doc.crawled_at)}
                    </div>
                    {doc.source && (
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs shadow-[6px_6px_12px_rgba(163,177,198,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]">
                        {doc.source.name}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {doc.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
