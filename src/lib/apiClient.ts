export interface ApiClientOptions {
  baseUrl?: string;
  token?: string | null;
}

const defaultBase = '';

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

  async get<T = unknown>(path: string): Promise<T> {
    const res = await fetch(this.base + path, { cache: 'no-store', headers: this.headers() });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
  }

  async post<T = unknown, B = unknown>(path: string, body?: B): Promise<T> {
    const res = await fetch(this.base + path, { method: 'POST', headers: this.headers(), body: JSON.stringify(body) });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      const msg = t || res.statusText || `HTTP ${res.status}`;
      const err = new Error(msg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return res.json() as Promise<T>;
  }

  async patch<T = unknown, B = unknown>(path: string, body?: B): Promise<T> {
    const res = await fetch(this.base + path, { method: 'PATCH', headers: this.headers(), body: JSON.stringify(body) });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      const msg = t || res.statusText || `HTTP ${res.status}`;
      const err = new Error(msg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return res.json() as Promise<T>;
  }

  async delete<T = unknown>(path: string): Promise<T> {
    const res = await fetch(this.base + path, { method: 'DELETE', headers: this.headers(false) });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      const msg = t || res.statusText || `HTTP ${res.status}`;
      const err = new Error(msg) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    return res.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();
