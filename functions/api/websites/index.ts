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
 * [DIAGNOSTIC TEST] Handles POST requests by echoing the body.
 * This is to verify if new deployments are live.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<any>();
    const responsePayload = {
      ...body,
      message: "DIAGNOSTIC TEST: New function is live.",
      timestamp: new Date().toISOString()
    };
    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Failed to parse body in diagnostic test.", details: error.message }), { status: 400 });
  }
};
