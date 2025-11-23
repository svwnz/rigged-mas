// Type definitions for Cloudflare Pages Functions, D1, and R2
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
    // Validate content type for multipart/form-data
    const contentType = context.request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be multipart/form-data' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse form data
    const formData = await context.request.formData();
    const file = formData.get('photo') as File;
    const houseId = formData.get('houseId') as string;

    // Validate inputs
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'Photo file is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!houseId || isNaN(Number(houseId))) {
      return new Response(
        JSON.stringify({ error: 'Valid house ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Only image files are allowed' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size must be less than 5MB' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate unique file key
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileKey = `house-${houseId}-${timestamp}.${fileExtension}`;

    // Upload to R2
    const uploadResult = await context.env.PHOTOS.put(fileKey, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        houseId: houseId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    if (!uploadResult) {
      return new Response(
        JSON.stringify({ error: 'Failed to upload photo' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Update house record in database with new image URL
    // Note: In production, you'd want to set up a custom domain for R2
    const imageUrl = `https://pub-${fileKey}`;  // Simplified for now - update with actual R2 public URL structure
    
    const updateResult = await context.env.DB.prepare(
      'UPDATE houses SET imageUrl = ? WHERE id = ?'
    ).bind(imageUrl, Number(houseId)).run();

    if (!updateResult.success) {
      // If DB update fails, try to clean up the uploaded file
      await context.env.PHOTOS.delete(fileKey);
      
      return new Response(
        JSON.stringify({ error: 'Failed to update house record' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Photo uploaded successfully',
        imageUrl: imageUrl,
        fileKey: fileKey
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Upload photo error:', error);
    
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