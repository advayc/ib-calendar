export interface ApiClientOptions {
  baseUrl?: string;
  token?: string | null;
}

const defaultBase = '';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class ApiClient {
  private base: string;
  private token?: string | null;
  constructor(opts: ApiClientOptions = {}) {
    this.base = opts.baseUrl || defaultBase;
    this.token = opts.token || null;
  }
  setToken(token: string | null) { this.token = token; }

  private headers(json = true): HeadersInit {
    const h: Record<string,string> = {};
    if (json) h['Content-Type'] = 'application/json';
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async get(path: string) {
    const res = await fetch(this.base + path, { cache: 'no-store', headers: this.headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  async post(path: string, body: any) {
    const res = await fetch(this.base + path, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(await res.text());
    }
    return res.json();
  }
  async patch(path: string, body: any) {
    const res = await fetch(this.base + path, { method: 'PATCH', headers: this.headers(), body: JSON.stringify(body) });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(await res.text());
    }
    return res.json();
  }
  async delete(path: string) {
    const res = await fetch(this.base + path, { method: 'DELETE', headers: this.headers(false) });
    if (!res.ok) {
      if (res.status === 401) throw new Error('Unauthorized');
      throw new Error(await res.text());
    }
    return res.json();
  }
}

export const apiClient = new ApiClient();
