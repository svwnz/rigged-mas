// Type definitions for Cloudflare Pages Functions and R2
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    // Get optional query parameters
    const url = new URL(context.request.url);
    const houseId = url.searchParams.get('houseId');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100); // Max 100

    let listOptions: any = {
      limit: limit,
    };

    // If houseId is provided, filter by prefix
    if (houseId) {
      listOptions.prefix = `house-${houseId}-`;
    }

    // List objects from R2
    const listResult = await context.env.PHOTOS.list(listOptions);

    if (!listResult) {
      return new Response(
        JSON.stringify({ error: 'Failed to list photos' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Format the response
    const photos = listResult.objects?.map((obj: any) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded,
      url: `https://pub-${obj.key}`, // Simplified URL - update with actual R2 public URL structure
      metadata: obj.customMetadata || {},
    })) || [];

    return new Response(
      JSON.stringify({ 
        success: true,
        photos: photos,
        count: photos.length,
        truncated: listResult.truncated || false
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      }
    );

  } catch (error) {
    console.error('List photos error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};