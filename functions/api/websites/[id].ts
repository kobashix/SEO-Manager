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
    
    // Explicitly list all possible fields to prevent unwanted updates
    const updates: Partial<BaseWebsite> = {
        url: body.url,
        name: body.name,
        status: body.status,
        twitter_url: body.twitter_url,
        facebook_url: body.facebook_url,
        linkedin_url: body.linkedin_url,
        instagram_url: body.instagram_url,
        youtube_url: body.youtube_url,
        gsc_url: body.gsc_url,
        bing_url: body.bing_url,
        yandex_url: body.yandex_url,
    };

    const fieldsToUpdate = Object.entries(updates).filter(([key, value]) => value !== undefined);

    if (fieldsToUpdate.length === 0) {
        return new Response('Nothing to update.', { status: 400 });
    }

    const setClauses = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const bindings = fieldsToUpdate.map(([, value]) => value);
    bindings.push(params.id);

    const stmt = `UPDATE base_websites SET ${setClauses} WHERE id = ?`;
    
    await env.DB.prepare(stmt).bind(...bindings).run();

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
