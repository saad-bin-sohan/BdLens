'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, DocumentSource } from '@/lib/api';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [sources, setSources] = useState<DocumentSource[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [sourceId, setSourceId] = useState<number | undefined>(undefined);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const sourcesData = await api.listSources();
      setSources(sourcesData);
    } catch (err: any) {
      console.error('Failed to load sources:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        return;
      }
      setSelectedFile(file);
      setError('');
      setSuccess(false);

      // Auto-fill title from filename if not set
      if (!title) {
        const filename = file.name.replace('.pdf', '');
        setTitle(filename);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const document = await api.uploadDocument(selectedFile, title, sourceId);
      setSuccess(true);
      setSelectedFile(null);
      setTitle('');
      setSourceId(undefined);

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Redirect to document after 2 seconds
      setTimeout(() => {
        router.push(`/documents/${document.id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Document</h1>
        <p className="text-gray-600 mt-2">
          Manually upload a PDF document for analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
          <CardDescription>
            The document will be processed, analyzed, and tagged automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Successful!</h3>
              <p className="text-gray-600">
                Redirecting to document...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 text-red-600 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file-upload">PDF File</Label>
                <div className="border-2 border-dashed rounded-lg p-6">
                  {selectedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to select or drag and drop a PDF file
                      </p>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                />
                <p className="text-xs text-gray-500">
                  Leave blank to use filename
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source (optional)</Label>
                <select
                  id="source"
                  value={sourceId || ''}
                  onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">None</option>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload and Process
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">What happens after upload?</h3>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Text is extracted from the PDF</li>
            <li>• AI generates a summary and explanation</li>
            <li>• Topics and entities are automatically tagged</li>
            <li>• Document is indexed for semantic search</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
