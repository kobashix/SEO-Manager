// functions/api/websites/index.ts
import { v4 as uuidv4 } from 'uuid';

interface Env {
  DB: D1Database;
}

/**
 * Handles GET requests to list all base websites.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM base_websites ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Failed to get websites:", error);
    return new Response(`Failed to retrieve websites: ${error.message}`, { status: 500 });
  }
};

/**
 * Handles POST requests to create a new base website.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { url, name } = await request.json<{ url: string, name?: string }>();

    if (!url) {
      return new Response('URL is required.', { status: 400 });
    }

    const id = uuidv4();
    const siteName = name || new URL(url).hostname;
    
    await env.DB.prepare(
      "INSERT INTO base_websites (id, url, name) VALUES (?, ?, ?)"
    )
    .bind(id, url, siteName)
    .run();
    
    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(id).all();

    return new Response(JSON.stringify(results[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
        return new Response("This URL already exists in the database.", { status: 409 });
    }
    console.error("Failed to create website:", error);
    return new Response(`Failed to create website: ${error.message}`, { status: 500 });
  }
};
