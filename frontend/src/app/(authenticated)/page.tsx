import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, FileText, BarChart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to BdLens
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Search and understand local government documents with AI-powered
          semantic search and plain-language summaries.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Search Documents</CardTitle>
            <CardDescription className="text-center">
              Use natural language to find relevant documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/search">
              <Button className="w-full">Start Searching</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <FileText className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Browse All</CardTitle>
            <CardDescription className="text-center">
              Explore all ingested government documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents">
              <Button className="w-full">Browse Documents</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <BarChart className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-center">Admin Dashboard</CardTitle>
            <CardDescription className="text-center">
              Manage sources and view analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin">
              <Button className="w-full">Admin Panel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Quick Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form action="/search" method="GET">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  placeholder="Ask a question or search for topics..."
                  className="flex-1 px-4 py-2 border rounded-md"
                />
                <Button type="submit">Search</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
