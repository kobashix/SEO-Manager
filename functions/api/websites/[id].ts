// functions/api/websites/[id].ts
import type { BaseWebsite } from '../../../../src/types';

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(params.id).all();
    if (results.length === 0) return new Response('Website not found.', { status: 404 });
    return new Response(JSON.stringify(results[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(`Failed to retrieve website: ${error.message}`, { status: 500 });
  }
};

export const onRequestPut: PagesFunction<Env, 'id'> = async ({ request, env, params }) => {
  try {
    const body = await request.json<Partial<BaseWebsite>>();
    const fieldsToUpdate = Object.entries(body).filter(([key, value]) => value !== undefined && key !== 'id' && key !== 'created_at');
    if (fieldsToUpdate.length === 0) return new Response('Nothing to update.', { status: 400 });

    const setClauses = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const bindings = fieldsToUpdate.map(([, value]) => value);
    bindings.push(params.id);
    
    await env.DB.prepare(`UPDATE base_websites SET ${setClauses} WHERE id = ?`).bind(...bindings).run();
    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(params.id).all();
    return new Response(JSON.stringify(results[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) return new Response("This URL already exists.", { status: 409 });
    return new Response(`Failed to update website: ${error.message}`, { status: 500 });
  }
};

export const onRequestDelete: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  try {
    await env.DB.prepare("DELETE FROM base_websites WHERE id = ?").bind(params.id).run();
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(`Failed to delete website: ${error.message}`, { status: 500 });
  }
};
