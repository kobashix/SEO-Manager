// functions/api/stats.ts
interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const { results } = await env.DB.prepare("SELECT COUNT(*) as totalWebsites FROM base_websites").all();
    const stats = {
      totalWebsites: results[0]?.totalWebsites || 0,
    };
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(`Failed to retrieve stats: ${error.message}`, { status: 500 });
  }
};
