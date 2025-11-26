'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, AnalyticsOverview } from '@/lib/api';
import { FileText, Users, Database, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-md">
        {error || 'Failed to load analytics'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit border-primary/40 bg-white/70 text-primary">
          Analytics
        </Badge>
        <h1 className="text-3xl font-semibold text-slate-800">Usage statistics</h1>
        <p className="text-slate-600">
          Watch how your organization is using BdLens in real time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-800">{analytics.total_documents}</div>
            <p className="text-xs text-slate-500 mt-1">Ingested and indexed</p>
          </CardContent>
        </Card>

        <Card className="border-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-800">{analytics.total_users}</div>
            <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Sources</CardTitle>
            <Database className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-800">{analytics.total_sources}</div>
            <p className="text-xs text-slate-500 mt-1">Crawl sources</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-transparent">
        <CardHeader>
          <CardTitle>Top Viewed Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.top_viewed_documents.length > 0 ? (
            <div className="space-y-3">
              {analytics.top_viewed_documents.map((doc, index) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between rounded-2xl bg-white/70 p-4 text-sm text-slate-700 shadow-[10px_10px_20px_rgba(163,177,198,0.28),-10px_-10px_20px_rgba(255,255,255,0.9)] transition-all hover:-translate-y-[1px]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-xs text-slate-500">{doc.views} views</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-transparent">
        <CardHeader>
          <CardTitle>Top Search Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.top_search_queries.length > 0 ? (
            <div className="space-y-3">
              {analytics.top_search_queries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-white/70 p-4 text-sm text-slate-700 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{query.query}</p>
                      <p className="text-xs text-slate-500">
                        {query.count} {query.count === 1 ? 'search' : 'searches'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No search data available</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-transparent">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recent_activity.length > 0 ? (
            <div className="space-y-2">
              {analytics.recent_activity.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-2xl bg-white/70 p-3 text-sm text-slate-700 shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.95)]"
                >
                  <div>
                    <span className="font-medium capitalize">{event.type.replace('_', ' ')}</span>
                    {event.payload && (
                      <span className="text-slate-500 ml-2">
                        {JSON.stringify(event.payload).slice(0, 50)}...
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
