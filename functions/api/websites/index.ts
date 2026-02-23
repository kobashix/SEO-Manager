// functions/api/websites/index.ts
import { v4 as uuidv4 } from 'uuid';
import type { BaseWebsite } from '../../../src/types';

interface Env { DB: D1Database; }

// GET - List all websites
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM base_websites ORDER BY created_at DESC").all();
    return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) { return new Response(`Failed to retrieve websites: ${e.message}`, { status: 500 }); }
};

// POST - Handles BOTH Create and Update
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<Partial<BaseWebsite> & { id?: string }>();
  
  // --- UPDATE LOGIC ---
  if (body.id) {
    try {
      const id = body.id;
      const { id: _, created_at, ...updates } = body; // Exclude non-updatable fields
      const fieldsToUpdate = Object.entries(updates).filter(([, value]) => value !== undefined);
      if (fieldsToUpdate.length === 0) return new Response('Nothing to update.', { status: 400 });

      const setClauses = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
      const bindings = fieldsToUpdate.map(([, value]) => value ?? null);
      bindings.push(id);

      await env.DB.prepare(`UPDATE base_websites SET ${setClauses} WHERE id = ?`).bind(...bindings).run();
      const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(id).all();
      return new Response(JSON.stringify(results[0]), { status: 200 });
    } catch (e: any) {
      if (e.message?.includes("UNIQUE constraint failed")) return new Response("This URL already exists.", { status: 409 });
      return new Response(`Failed to update website: ${e.message}`, { status: 500 });
    }
  }

  // --- CREATE LOGIC ---
  try {
    if (!body.url) return new Response('URL is required.', { status: 400 });
    const id = uuidv4();
    const siteName = body.name || new URL(body.url).hostname;
    
    await env.DB.prepare(
      `INSERT INTO base_websites (id, url, name, twitter_url, facebook_url, linkedin_url, instagram_url, youtube_url, gsc_url, bing_url, yandex_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.url, siteName, body.twitter_url ?? null, body.facebook_url ?? null, body.linkedin_url ?? null, 
      body.instagram_url ?? null, body.youtube_url ?? null, body.gsc_url ?? null, body.bing_url ?? null, body.yandex_url ?? null
    ).run();
    
    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(id).all();
    return new Response(JSON.stringify(results[0]), { status: 201 });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint failed")) return new Response("This URL already exists.", { status: 409 });
    return new Response(`Failed to create website: ${e.message}`, { status: 500 });
  }
};

// DELETE - Handles deletion
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { id } = await request.json<{ id: string }>();
    if (!id) return new Response('ID is required for deletion.', { status: 400 });
    await env.DB.prepare("DELETE FROM base_websites WHERE id = ?").bind(id).run();
    return new Response(null, { status: 204 });
  } catch (e: any) { return new Response(`Failed to delete website: ${e.message}`, { status: 500 }); }
};
