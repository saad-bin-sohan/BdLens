'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, AnalyticsOverview } from '@/lib/api';
import { FileText, Users, Database, TrendingUp, Upload, Settings } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage sources, upload documents, and view analytics
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/admin/sources">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Manage Sources</CardTitle>
                <CardDescription>Configure crawl sources</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/upload">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <Upload className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">Upload Document</CardTitle>
                <CardDescription>Manually upload PDFs</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-lg">View Analytics</CardTitle>
                <CardDescription>Usage statistics</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {error && (
        <div className="p-4 text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : analytics && (
        <>
          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_documents}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_users}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
                <Database className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.total_sources}</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Viewed Documents */}
          {analytics.top_viewed_documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Viewed Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.top_viewed_documents.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-gray-50"
                    >
                      <span className="font-medium">{doc.title}</span>
                      <span className="text-sm text-gray-500">{doc.views} views</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Search Queries */}
          {analytics.top_search_queries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.top_search_queries.map((query, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-md bg-gray-50"
                    >
                      <span className="font-medium">{query.query}</span>
                      <span className="text-sm text-gray-500">
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
