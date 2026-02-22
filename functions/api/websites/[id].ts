// functions/api/websites/[id].ts

interface Env {
  DB: D1Database;
}

/**
 * Handles GET requests for a single website.
 */
export const onRequestGet: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  try {
    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(params.id).all();
    if (results.length === 0) {
      return new Response('Website not found.', { status: 404 });
    }
    return new Response(JSON.stringify(results[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(`Failed to retrieve website: ${error.message}`, { status: 500 });
  }
};

/**
 * Handles PUT requests to update a website.
 */
export const onRequestPut: PagesFunction<Env, 'id'> = async ({ request, env, params }) => {
  try {
    const { url, name, status } = await request.json<{ url?: string, name?: string, status?: string }>();
    if (!url && !name && !status) {
      return new Response('Nothing to update.', { status: 400 });
    }
    await env.DB.prepare(
      "UPDATE base_websites SET url = COALESCE(?, url), name = COALESCE(?, name), status = COALESCE(?, status) WHERE id = ?"
    )
    .bind(url, name, status, params.id)
    .run();

    const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(params.id).all();
    return new Response(JSON.stringify(results[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
        return new Response("This URL already exists in the database.", { status: 409 });
    }
    return new Response(`Failed to update website: ${error.message}`, { status: 500 });
  }
};

/**
 * Handles DELETE requests to remove a website.
 */
export const onRequestDelete: PagesFunction<Env, 'id'> = async ({ env, params }) => {
  try {
    await env.DB.prepare("DELETE FROM base_websites WHERE id = ?").bind(params.id).run();
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(`Failed to delete website: ${error.message}`, { status: 500 });
  }
};
