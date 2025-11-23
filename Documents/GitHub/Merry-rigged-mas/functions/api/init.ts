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
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Add rate limiting headers
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60", // Cache for 1 minute
      "X-Robots-Tag": "noindex", // Prevent search indexing of API
    };

    // Fetch houses with their vote counts
    const { results: houses } = await context.env.DB.prepare(
      "SELECT * FROM houses ORDER BY id ASC"
    ).all();

    // Fetch recent messages (limit to prevent large responses)
    const { results: messages } = await context.env.DB.prepare(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 100"
    ).all();

    if (!houses || !messages) {
      throw new Error("Failed to fetch data from database");
    }

    // Map snake_case DB columns to camelCase for frontend
    const formattedHouses = houses.map((h: any) => ({
      id: h.id,
      address: h.address,
      description: h.description,
      imageUrl: h.image_url,
      isTheOne: h.is_the_one === 1,
      votes: h.votes || 0
    }));

    const formattedMessages = messages.map((m: any) => ({
      id: m.id,
      name: m.name,
      text: m.text,
      houseId: m.house_id,
      timestamp: new Date(m.created_at as string).toLocaleString(),
      isSystem: m.is_system === 1
    }));

    return new Response(JSON.stringify({ 
      houses: formattedHouses, 
      messages: formattedMessages 
    }), {
      headers
    });
  } catch (e: any) {
    console.error('Init API error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}