import type { Article, AuthResponse, TenantInfo, Ticket, TicketStats, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  async register(data: { companyName: string; allowedDomain: string; fullName: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  async getTenants(): Promise<TenantInfo[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/public-list`);
    if (!res.ok) return [];
    return res.json();
  },

  async getTickets(params?: { status?: string; priority?: string; type?: string; searchQuery?: string }): Promise<Ticket[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.type) query.append('type', params.type);
    if (params?.searchQuery) query.append('searchQuery', params.searchQuery);

    const res = await fetch(`${API_BASE_URL}/api/v1/tickets?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load tickets');
    return res.json();
  },

  async getTicketStats(): Promise<TicketStats> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tickets/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load stats');
    return res.json();
  },

  async updateTicketStatus(id: string, status: string, priority?: string): Promise<Ticket> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tickets/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, priority }),
    });
    if (!res.ok) throw new Error('Failed to update ticket');
    return res.json();
  },

  async getArticles(): Promise<Article[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/kb-articles`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load articles');
    return res.json();
  },

  async createArticle(data: { title: string; content: string; category: string; isPublished: boolean }): Promise<Article> {
    const res = await fetch(`${API_BASE_URL}/api/v1/kb-articles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create article');
    return res.json();
  },

  async deleteArticle(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/v1/kb-articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete article');
  },

  async getAgents(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/agents`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load agents');
    return res.json();
  },

  async createAgent(data: any): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/agents`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create agent');
    }
    return res.json();
  },

  async getTenant(): Promise<TenantInfo> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load tenant info');
    return res.json();
  },

  async updateTenantDomain(domain: string): Promise<TenantInfo> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/me/domain`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ allowedDomain: domain }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update domain');
    }
    return res.json();
  },
};
