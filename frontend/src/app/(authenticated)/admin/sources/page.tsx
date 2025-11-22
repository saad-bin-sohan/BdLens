'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { api, DocumentSource, CrawlJob } from '@/lib/api';
import { Plus, Play, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function SourcesPage() {
  const [sources, setSources] = useState<DocumentSource[]>([]);
  const [crawlJobs, setCrawlJobs] = useState<CrawlJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New source form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    base_url: '',
    url_pattern: '',
    scraper_type: 'simple',
    is_enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sourcesData, jobsData] = await Promise.all([
        api.listSources(),
        api.listCrawlJobs(),
      ]);
      setSources(sourcesData);
      setCrawlJobs(jobsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSource(newSource);
      setNewSource({ name: '', base_url: '', url_pattern: '', scraper_type: 'simple', is_enabled: true });
      setShowNewForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create source');
    }
  };

  const handleTriggerCrawl = async (sourceId: number) => {
    try {
      await api.triggerCrawl(sourceId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to trigger crawl');
    }
  };

  const handleToggleSource = async (source: DocumentSource) => {
    try {
      await api.updateSource(source.id, { is_enabled: !source.is_enabled });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update source');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Sources</h1>
          <p className="text-gray-600 mt-2">
            Configure and manage document crawl sources
          </p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Source
        </Button>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      {/* New Source Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Source</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSource} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="City Council Notices"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_url">Base URL</Label>
                <Input
                  id="base_url"
                  type="url"
                  value={newSource.base_url}
                  onChange={(e) => setNewSource({ ...newSource, base_url: e.target.value })}
                  placeholder="https://example.gov/notices"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url_pattern">URL Pattern (optional)</Label>
                <Input
                  id="url_pattern"
                  value={newSource.url_pattern}
                  onChange={(e) => setNewSource({ ...newSource, url_pattern: e.target.value })}
                  placeholder="Regex pattern to filter URLs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scraper_type">Scraper Type</Label>
                <select
                  id="scraper_type"
                  value={newSource.scraper_type}
                  onChange={(e) => setNewSource({ ...newSource, scraper_type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="simple">Simple (Generic Scraper)</option>
                  <option value="dncc">DNCC (Dhaka North City Corporation)</option>
                  <option value="mopa">MOPA (Ministry of Public Administration)</option>
                </select>
                <p className="text-sm text-gray-500">
                  Select the scraper type based on the source website
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Source</Button>
                <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sources List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading sources...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => {
            const recentJobs = crawlJobs.filter((job) => job.source_id === source.id).slice(0, 3);

            return (
              <Card key={source.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {source.name}
                        <Badge variant={source.is_enabled ? 'default' : 'secondary'}>
                          {source.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">
                          {source.scraper_type.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{source.base_url}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleTriggerCrawl(source.id)}
                        disabled={!source.is_enabled}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Crawl
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleSource(source)}
                      >
                        {source.is_enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {source.last_crawled_at && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Last crawled: {formatDate(source.last_crawled_at)}
                      </div>
                    )}

                    {recentJobs.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Recent Crawl Jobs:</p>
                        <div className="space-y-2">
                          {recentJobs.map((job) => (
                            <div
                              key={job.id}
                              className="flex items-center justify-between p-2 rounded bg-gray-50"
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(job.status)}
                                <span className="text-sm capitalize">{job.status}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(job.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {sources.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No sources configured</p>
              <Button className="mt-4" onClick={() => setShowNewForm(true)}>
                Create First Source
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
