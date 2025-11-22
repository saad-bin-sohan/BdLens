'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, AnalyticsOverview } from '@/lib/api';
import { FileText, Users, Database, TrendingUp } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">
          Usage statistics and insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_documents}</div>
            <p className="text-xs text-gray-500 mt-1">Ingested and indexed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_users}</div>
            <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_sources}</div>
            <p className="text-xs text-gray-500 mt-1">Crawl sources</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Viewed Documents */}
      <Card>
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
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.views} views</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Top Search Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Search Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.top_search_queries.length > 0 ? (
            <div className="space-y-3">
              {analytics.top_search_queries.map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{query.query}</p>
                      <p className="text-sm text-gray-500">
                        {query.count} {query.count === 1 ? 'search' : 'searches'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No search data available</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recent_activity.length > 0 ? (
            <div className="space-y-2">
              {analytics.recent_activity.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-md bg-gray-50 text-sm"
                >
                  <div>
                    <span className="font-medium capitalize">{event.type.replace('_', ' ')}</span>
                    {event.payload && (
                      <span className="text-gray-500 ml-2">
                        {JSON.stringify(event.payload).slice(0, 50)}...
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
