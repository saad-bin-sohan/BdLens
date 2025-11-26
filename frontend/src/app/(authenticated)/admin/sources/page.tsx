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
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-primary">Source manager</p>
          <h1 className="text-3xl font-semibold text-slate-800">Configure and monitor crawls</h1>
          <p className="text-slate-600">Keep your ingestion pipeline clean and in control.</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Source
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700 shadow-[8px_8px_16px_rgba(163,177,198,0.25),-8px_-8px_16px_rgba(255,255,255,0.9)]">
          {error}
        </div>
      )}

      {showNewForm && (
        <Card className="border-transparent">
          <CardHeader>
            <CardTitle>Create new source</CardTitle>
            <CardDescription>Point BdLens at a base URL and choose the right scraper.</CardDescription>
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
                  className="neu-input flex h-12 w-full rounded-xl px-3 text-sm text-slate-700 focus-visible:outline-none"
                  required
                >
                  <option value="simple">Simple (Generic Scraper)</option>
                  <option value="dncc">DNCC (Dhaka North City Corporation)</option>
                  <option value="mopa">MOPA (Ministry of Public Administration)</option>
                </select>
                <p className="text-sm text-slate-500">
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

      {loading ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-12 text-slate-500 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
          <Clock className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading sources...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => {
            const recentJobs = crawlJobs.filter((job) => job.source_id === source.id).slice(0, 3);

            return (
              <Card key={source.id} className="border-transparent transition-all hover:-translate-y-[1px] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.3),-16px_-16px_32px_rgba(255,255,255,0.95)]">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex flex-wrap items-center gap-2">
                        {source.name}
                        <Badge variant={source.is_enabled ? 'default' : 'secondary'}>
                          {source.is_enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <Badge variant="outline">
                          {source.scraper_type.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-slate-600">{source.base_url}</CardDescription>
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
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        Last crawled: {formatDate(source.last_crawled_at)}
                      </div>
                    )}

                    {recentJobs.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">Recent crawl jobs</p>
                        <div className="space-y-2">
                          {recentJobs.map((job) => (
                            <div
                              key={job.id}
                              className="flex items-center justify-between rounded-2xl bg-white/70 p-3 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]"
                            >
                              <div className="flex items-center gap-2">
                                {getStatusIcon(job.status)}
                                <span className="text-sm capitalize text-slate-700">{job.status}</span>
                              </div>
                              <span className="text-xs text-slate-500">
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
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-12 text-center text-slate-600 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
              <p>No sources configured yet</p>
              <Button className="mt-2" onClick={() => setShowNewForm(true)}>
                Create first source
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
