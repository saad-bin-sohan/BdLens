'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, AnalyticsOverview } from '@/lib/api';
import { FileText, Users, Database, TrendingUp, Upload, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalyticsOverview();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit border-primary/40 bg-white/70 text-primary">
          Admin Control
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-800">Operate BdLens</h1>
        <p className="text-slate-600">Manage sources, uploads, and watch usage in one calm workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/sources">
          <Card className="cursor-pointer border-transparent transition-all hover:-translate-y-[2px] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.3),-16px_-16px_32px_rgba(255,255,255,0.95)]">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Manage Sources</CardTitle>
                <CardDescription>Configure crawl sources</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/upload">
          <Card className="cursor-pointer border-transparent transition-all hover:-translate-y-[2px] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.3),-16px_-16px_32px_rgba(255,255,255,0.95)]">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Upload Document</CardTitle>
                <CardDescription>Manually upload PDFs</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="cursor-pointer border-transparent transition-all hover:-translate-y-[2px] hover:shadow-[16px_16px_32px_rgba(163,177,198,0.3),-16px_-16px_32px_rgba(255,255,255,0.95)]">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">View Analytics</CardTitle>
                <CardDescription>Usage statistics</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4 text-sm text-red-700 shadow-[8px_8px_16px_rgba(163,177,198,0.25),-8px_-8px_16px_rgba(255,255,255,0.9)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/70 px-6 py-12 text-slate-500 shadow-[14px_14px_28px_rgba(163,177,198,0.35),-14px_-14px_28px_rgba(255,255,255,0.95)]">
          <Settings className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading analytics...</p>
        </div>
      ) : analytics && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-800">{analytics.total_documents}</div>
                <p className="text-xs text-slate-500">Ingested and searchable</p>
              </CardContent>
            </Card>

            <Card className="border-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
                <Users className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-800">{analytics.total_users}</div>
                <p className="text-xs text-slate-500">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="border-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Sources</CardTitle>
                <Database className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-slate-800">{analytics.total_sources}</div>
                <p className="text-xs text-slate-500">Feeding the pipeline</p>
              </CardContent>
            </Card>
          </div>

          {analytics.top_viewed_documents.length > 0 && (
            <Card className="border-transparent">
              <CardHeader>
                <CardTitle>Top Viewed Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.top_viewed_documents.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between rounded-2xl bg-white/70 p-4 text-sm text-slate-700 shadow-[10px_10px_20px_rgba(163,177,198,0.28),-10px_-10px_20px_rgba(255,255,255,0.9)] transition-all hover:-translate-y-[1px]"
                    >
                      <span className="font-semibold">{doc.title}</span>
                      <span className="text-xs text-slate-500">{doc.views} views</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.top_search_queries.length > 0 && (
            <Card className="border-transparent">
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.top_search_queries.map((query, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-2xl bg-white/70 p-3 text-sm text-slate-700 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]"
                    >
                      <span className="font-medium">{query.query}</span>
                      <span className="text-xs text-slate-500">
                        {query.count} {query.count === 1 ? 'search' : 'searches'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
