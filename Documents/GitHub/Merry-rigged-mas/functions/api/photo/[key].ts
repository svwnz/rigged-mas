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
    // Get the key from the URL parameters
    const key = context.params.key as string;
    
    if (!key) {
      return new Response('Photo key is required', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Fetch the image from R2
    const object = await context.env.PHOTOS.get(key);

    if (!object) {
      return new Response('Photo not found', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Set appropriate headers for image serving
    const headers = new Headers();
    
    // Set content type based on file extension
    const fileExtension = key.split('.').pop()?.toLowerCase();
    switch (fileExtension) {
      case 'png':
        headers.set('Content-Type', 'image/png');
        break;
      case 'jpg':
      case 'jpeg':
        headers.set('Content-Type', 'image/jpeg');
        break;
      case 'gif':
        headers.set('Content-Type', 'image/gif');
        break;
      case 'webp':
        headers.set('Content-Type', 'image/webp');
        break;
      default:
        headers.set('Content-Type', 'image/png'); // Default fallback
    }

    // Add caching headers
    headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    headers.set('ETag', `"${key}"`);

    // Check if client has cached version
    const ifNoneMatch = context.request.headers.get('If-None-Match');
    if (ifNoneMatch === `"${key}"`) {
      return new Response(null, { status: 304, headers });
    }

    // Return the image
    return new Response(object.body, { 
      headers,
      status: 200
    });

  } catch (error) {
    console.error('Photo serve error:', error);
    
    return new Response('Internal server error', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
};