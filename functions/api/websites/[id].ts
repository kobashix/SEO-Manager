// functions/api/websites/[id].ts
import type { BaseWebsite } from '../../../../src/types';
import { launch } from 'puppeteer-core';

interface Env {
  DB: D1Database;
  BROWSER: Fetcher;
}

async function isWordPress(url: string): Promise<boolean> {
  try {
    const res = await fetch(new URL(url).origin + '/wp-login.php', { redirect: 'manual', headers: {'User-Agent': 'Mozilla/5.0'} });
    return res.status === 200 || (res.status >= 300 && res.status < 400);
  } catch (e) { return false; }
}

async function extractMeta(html: string): Promise<{ title: string, description: string }> {
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?>/i);
    return {
        title: titleMatch ? titleMatch[1].trim() : '',
        description: descriptionMatch ? descriptionMatch[1].trim() : '',
    };
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
  const body = await request.json<any>();

  // ROUTE A: Enrichment Action
  if (body.action === 'enrich') {
    const { results } = await env.DB.prepare("SELECT url FROM base_websites WHERE id = ?").bind(params.id).all();
    if (results.length === 0) return new Response('Website not found.', { status: 404 });
    const url = results[0].url as string;

    const browser = await launch(env.BROWSER);
    try {
        const is_wordpress = await isWordPress(url);
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
        const html = await page.content();
        const { title, description } = await extractMeta(html);
        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 60 });
        const screenshot_url = `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`;

        await env.DB.prepare(
          `UPDATE base_websites SET is_wordpress = ?, meta_title = ?, meta_description = ?, screenshot_url = ? WHERE id = ?`
        ).bind(is_wordpress ? 1 : 0, title, description, screenshot_url, params.id).run();

        const { results: updatedResults } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(params.id).all();
        return new Response(JSON.stringify(updatedResults[0]), { status: 200 });
    } catch (error: any) {
        return new Response(`Failed to enrich ${url}: ${error.message}`, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
  }

  // ROUTE B: Standard Update Action
  try {
    const fieldsToUpdate = Object.entries(body).filter(([key]) => key !== 'id' && key !== 'created_at' && key !== 'action');
    if (fieldsToUpdate.length === 0) return new Response('Nothing to update.', { status: 400 });
    const setClauses = fieldsToUpdate.map(([key]) => `${key} = ?`).join(', ');
    const bindings = fieldsToUpdate.map(([, value]) => value ?? null);
    bindings.push(params.id);

    await env.DB.prepare(`UPDATE base_websites SET ${setClauses} WHERE id = ?`).bind(...bindings).run();
    const { results: updatedResults } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(params.id).all();
    return new Response(JSON.stringify(updatedResults[0]), { status: 200 });
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
