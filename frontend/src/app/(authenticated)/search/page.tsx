'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, SearchResult, Tag } from '@/lib/api';
import { Search, FileText } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTags();
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  const loadTags = async () => {
    try {
      const tagsData = await api.listTags();
      setTags(tagsData);
    } catch (err: any) {
      console.error('Failed to load tags:', err);
    }
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setSearched(true);
      setError('');
      const searchResults = await api.search(searchQuery, {
        tag: selectedTag || undefined,
      });
      setResults(searchResults);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit border-primary/40 bg-white/70 text-primary">
          Semantic Search
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-800">Ask questions in plain language</h1>
        <p className="text-slate-600">
          Semantic search across every ingested government document. Filter by tags to keep results precise.
        </p>
      </div>

      <Card className="border-transparent">
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Ask a question or search for topics..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="text-base"
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

              <Button type="submit" disabled={loading || !query.trim()} className="md:min-w-[150px]">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Hint: search for decisions, dates, policy names, or entities. We will fetch the best matching paragraphs.
            </p>
          </form>
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
          <p className="text-sm">Searching across the corpus...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-12 text-center text-slate-600 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
          <FileText className="h-12 w-12 text-slate-400" />
          <p className="text-lg font-semibold text-slate-700">No results found</p>
          <p className="text-sm text-slate-500">Try different keywords or remove filters.</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Found {results.length} relevant {results.length === 1 ? 'document' : 'documents'}
          </p>
          {results.map((result) => (
            <Link key={result.document_id} href={`/documents/${result.document_id}`}>
              <Card className="cursor-pointer border-transparent transition-all hover:-translate-y-[2px] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.3),-16px_-16px_32px_rgba(255,255,255,0.95)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <CardTitle className="text-lg">{result.document_title}</CardTitle>
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {result.snippet}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-4 whitespace-nowrap">
                      {Math.round(result.score * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {result.source && (
                      <span className="rounded-full bg-white/80 px-3 py-1 shadow-[6px_6px_12px_rgba(163,177,198,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]">
                        {result.source.name}
                      </span>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {result.tags.slice(0, 4).map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {result.tags.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
