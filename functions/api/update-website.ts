import type { BaseWebsite } from '../../src/types';
interface Env { DB: D1Database; }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const body = await request.json<Partial<BaseWebsite> & { id: string }>();
    const { id, ...updates } = body;
    if (!id) return new Response('Website ID is required.', { status: 400 });

    const fieldsToUpdate = Object.entries(updates).filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'action');
    if (fieldsToUpdate.length === 0) return new Response('Nothing to update.', { status: 400 });

    const setClauses = fieldsToUpdate.map(([key]) => ${key} = ?).join(', ');
    const bindings = fieldsToUpdate.map(([, value]) => value ?? null);
    bindings.push(id);

    await env.DB.prepare(UPDATE base_websites SET  WHERE id = ?).bind(...bindings).run();
    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(id).all();
    return new Response(JSON.stringify(results[0]), { status: 200 });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) return new Response("This URL already exists.", { status: 409 });
    return new Response(Failed to update website: , { status: 500 });
  }
};