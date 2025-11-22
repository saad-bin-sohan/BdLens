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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Semantic Search</h1>
        <p className="text-gray-600 mt-2">
          Ask questions in natural language to find relevant documents
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
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
                className="px-4 py-2 border rounded-md"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>

              <Button type="submit" disabled={loading || !query.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Searching...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No results found</p>
          <p className="text-sm text-gray-500 mt-2">
            Try different keywords or remove filters
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found {results.length} relevant {results.length === 1 ? 'document' : 'documents'}
          </p>
          {results.map((result) => (
            <Link key={result.document_id} href={`/documents/${result.document_id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {result.document_title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {result.snippet}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-4 whitespace-nowrap"
                    >
                      {Math.round(result.score * 100)}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    {result.source && (
                      <span className="text-gray-500">
                        {result.source.name}
                      </span>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {result.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {result.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.tags.length - 3}
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
