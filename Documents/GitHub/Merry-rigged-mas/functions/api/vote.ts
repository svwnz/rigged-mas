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
  VOTING_MODE?: string;
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

    const { houseId } = body as { houseId?: unknown };
    
    // Validate houseId is a positive integer
    if (!houseId || typeof houseId !== 'number' || !Number.isInteger(houseId) || houseId < 1) {
      return new Response(JSON.stringify({ error: "houseId must be a positive integer" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if house exists before voting
    const house = await context.env.DB.prepare(
      "SELECT id FROM houses WHERE id = ?"
    ).bind(houseId).first();

    if (!house) {
      return new Response(JSON.stringify({ error: "House not found" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check voting mode to determine behavior
    const votingMode = context.env.VOTING_MODE || 'normal_mode';
    let actualHouseId = houseId;
    let message = 'Vote recorded successfully!';
    
    // In joke_mode, redirect all non-House 7 votes to House 7
    if (votingMode === 'joke_mode' && houseId !== 7) {
      actualHouseId = 7;
      
      // Generate a joke message for the response
      const jokes = [
        "System error: Only House 7 is valid.",
        "Correction: You meant House 7.",
        "Beep boop. Voting for House 7 instead.",
        "That house didn't pay me. House 7 did.",
        "Swapping your vote to the winner: House 7.",
        "Nope. House 7 is clearly superior.",
        "Nice try. Switching vote to House 7.",
        "Auto-corrected: meant House 7",
        "Error 404: Only House 7 found.",
        "Recalibrating... House 7 selected.",
      ];
      
      message = jokes[Math.floor(Math.random() * jokes.length)];
    }

    // Increment vote count in D1 (using actualHouseId)
    const result = await context.env.DB.prepare(
      "UPDATE houses SET votes = votes + 1 WHERE id = ?"
    ).bind(actualHouseId).run();

    if (!result.success) {
      throw new Error("Failed to update vote count");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      actualVoteFor: actualHouseId,
      message: message,
      votingMode: votingMode
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (e: any) {
    console.error('Vote API error:', e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}