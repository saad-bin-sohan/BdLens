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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Browse Documents</h1>
        <p className="text-gray-600 mt-2">
          Explore all ingested government documents
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
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
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.slug}>
                  {tag.name}
                </option>
              ))}
            </select>

            <Button onClick={handleFilter}>
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
        </CardContent>
      </Card>

      {/* Documents List */}
      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Link key={doc.id} href={`/documents/${doc.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {doc.title}
                      </CardTitle>
                      {doc.summary && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {doc.summary}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-4">
                      {doc.content_type.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(doc.crawled_at)}
                    </div>
                    {doc.source && (
                      <div className="text-gray-400">
                        {doc.source.name}
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {doc.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                      {doc.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{doc.tags.length - 3}
                        </Badge>
                      )}
                    </div>
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
