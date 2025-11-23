// Type definitions for Cloudflare Pages Functions and D1
interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: any;
  error?: string;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: any): Promise<any>;
  get(key: string, options?: any): Promise<any>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: any): Promise<any>;
  head(key: string): Promise<any>;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, Params extends string = any, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Validate content type
    const contentType = context.request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return new Response(JSON.stringify({ error: "Content-Type must be application/json" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse and validate request body
    let body;
    try {
      body = await context.request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { name, text, houseId, isSystem } = body as { 
      name?: unknown; 
      text?: unknown; 
      houseId?: unknown; 
      isSystem?: unknown; 
    };
    
    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 50) {
      return new Response(JSON.stringify({ error: "Name must be a non-empty string (max 50 chars)" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0 || text.length > 500) {
      return new Response(JSON.stringify({ error: "Text must be a non-empty string (max 500 chars)" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!houseId || typeof houseId !== 'number' || !Number.isInteger(houseId) || houseId < 1) {
      return new Response(JSON.stringify({ error: "houseId must be a positive integer" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 50);
    const sanitizedText = text.trim().slice(0, 500);
    const systemFlag = Boolean(isSystem);

    // Check if house exists
    const house = await context.env.DB.prepare(
      "SELECT id FROM houses WHERE id = ?"
    ).bind(houseId).first();

    if (!house) {
      return new Response(JSON.stringify({ error: "House not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Insert new message
    const result = await context.env.DB.prepare(
      "INSERT INTO messages (name, text, house_id, is_system) VALUES (?, ?, ?, ?) RETURNING id, created_at"
    ).bind(sanitizedName, sanitizedText, houseId, systemFlag ? 1 : 0).first<{ id: number; created_at: string }>();

    if (!result) {
      throw new Error("Failed to save message");
    }

    return new Response(JSON.stringify({
        id: result.id,
        timestamp: new Date(result.created_at as string).toLocaleString(),
        success: true
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (e: any) {
    console.error('Message API error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}