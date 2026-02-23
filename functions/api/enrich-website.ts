import { launch } from 'puppeteer-core';
interface Env { DB: D1Database; BROWSER: Fetcher; }

async function isWordPress(url: string): Promise<boolean> { /* ... */ }
async function extractMeta(html: string): Promise<{ title: string, description: string }> { /* ... */ }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const { id, url } = await request.json<{ id: string; url: string }>();
    if (!id || !url) return new Response('ID and URL are required', { status: 400 });

    const browser = await launch(env.BROWSER);
    try {
        const is_wordpress = await isWordPress(url);
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
        const html = await page.content();
        const { title, description } = await extractMeta(html);
        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 60 });
        const screenshot_url = data:image/jpeg;base64,;

        await env.DB.prepare(
          UPDATE base_websites SET is_wordpress = ?, meta_title = ?, meta_description = ?, screenshot_url = ? WHERE id = ?
        ).bind(is_wordpress ? 1 : 0, title, description, screenshot_url, id).run();

        const { results } = await env.DB.prepare("SELECT * FROM base_websites WHERE id = ?").bind(id).all();
        return new Response(JSON.stringify(results[0]), { status: 200 });
    } catch (error: any) {
        return new Response(Failed to enrich : , { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
};

// Re-add helper functions
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