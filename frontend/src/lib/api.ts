/**
 * API client for BdLens backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  content_text: string;
  content_type: string;
  url?: string;
  published_at?: string;
  crawled_at: string;
  summary?: string;
  explanation?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  source?: DocumentSource;
  tags: Tag[];
  entities: Entity[];
  sections: DocumentSection[];
}

export interface DocumentListItem {
  id: number;
  title: string;
  content_type: string;
  summary?: string;
  crawled_at: string;
  source?: DocumentSource;
  tags: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Entity {
  id: number;
  name: string;
  type: string;
}

export interface DocumentSection {
  id: number;
  order_index: number;
  heading?: string;
  text: string;
}

export interface DocumentSource {
  id: number;
  name: string;
  base_url: string;
  url_pattern?: string;
  scraper_type: string;
  is_enabled: boolean;
  last_crawled_at?: string;
  created_at: string;
}

export interface SearchResult {
  document_id: number;
  document_title: string;
  snippet: string;
  score: number;
  source?: DocumentSource;
  tags: Tag[];
  url?: string;
}

export interface CrawlJob {
  id: number;
  source_id: number;
  status: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AnalyticsOverview {
  total_documents: number;
  total_users: number;
  total_sources: number;
  top_viewed_documents: Array<{ id: number; title: string; views: number }>;
  top_search_queries: Array<{ query: string; count: number }>;
  recent_activity: Array<{ type: string; payload: any; created_at: string }>;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(email: string, password: string): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<{ message: string; user: User }> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  // Documents
  async listDocuments(params?: {
    skip?: number;
    limit?: number;
    tag?: string;
    source_id?: number;
    search?: string;
  }): Promise<DocumentListItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.tag) queryParams.set('tag', params.tag);
    if (params?.source_id) queryParams.set('source_id', params.source_id.toString());
    if (params?.search) queryParams.set('search', params.search);

    return this.request<DocumentListItem[]>(
      `/api/documents?${queryParams.toString()}`
    );
  }

  async getDocument(id: number): Promise<Document> {
    return this.request<Document>(`/api/documents/${id}`);
  }

  async regenerateSummary(id: number): Promise<Document> {
    return this.request<Document>(`/api/documents/${id}/regenerate-summary`, {
      method: 'POST',
    });
  }

  async listTags(): Promise<Tag[]> {
    return this.request<Tag[]>('/api/documents/tags/list');
  }

  // Search
  async search(query: string, params?: {
    limit?: number;
    tag?: string;
    source_id?: number;
  }): Promise<SearchResult[]> {
    const queryParams = new URLSearchParams({ q: query });
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.tag) queryParams.set('tag', params.tag);
    if (params?.source_id) queryParams.set('source_id', params.source_id.toString());

    return this.request<SearchResult[]>(`/api/search?${queryParams.toString()}`);
  }

  // Admin - Sources
  async listSources(): Promise<DocumentSource[]> {
    return this.request<DocumentSource[]>('/api/admin/sources');
  }

  async createSource(data: {
    name: string;
    base_url: string;
    url_pattern?: string;
    is_enabled?: boolean;
  }): Promise<DocumentSource> {
    return this.request<DocumentSource>('/api/admin/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSource(id: number, data: {
    name?: string;
    base_url?: string;
    url_pattern?: string;
    is_enabled?: boolean;
  }): Promise<DocumentSource> {
    return this.request<DocumentSource>(`/api/admin/sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async triggerCrawl(sourceId: number): Promise<CrawlJob> {
    return this.request<CrawlJob>(`/api/admin/sources/${sourceId}/crawl`, {
      method: 'POST',
    });
  }

  async listCrawlJobs(sourceId?: number): Promise<CrawlJob[]> {
    const queryParams = new URLSearchParams();
    if (sourceId) queryParams.set('source_id', sourceId.toString());

    return this.request<CrawlJob[]>(
      `/api/admin/crawl-jobs?${queryParams.toString()}`
    );
  }

  // Admin - Upload
  async uploadDocument(file: File, title?: string, sourceId?: number): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (sourceId) formData.append('source_id', sourceId.toString());

    const url = `${this.baseURL}/api/admin/documents/upload`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Admin - Analytics
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.request<AnalyticsOverview>('/api/admin/analytics/overview');
  }
}

export const api = new APIClient();
