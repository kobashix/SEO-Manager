// functions/api/stats.ts
import type { AppSettings } from '../../src/types';

interface Env {
  DB: D1Database;
  KV: KVNamespace;
}

const SETTINGS_KEY = "APP_SETTINGS";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    // Get total websites count
    const { results: dbResults } = await env.DB.prepare("SELECT COUNT(*) as totalWebsites FROM base_websites").all();
    
    // Check if Google API settings are configured
    const settingsJson = await env.KV.get(SETTINGS_KEY);
    const settings: AppSettings = settingsJson ? JSON.parse(settingsJson) : {};
    const isGoogleConfigured = !!(settings.googleApiKey && settings.googleCxId);

    const stats = {
      totalWebsites: dbResults[0]?.totalWebsites || 0,
      isGoogleConfigured: isGoogleConfigured,
      // We can add more checks here in the future (e.g., check for IndexNow key on a sample domain)
      isIndexNowConfigured: true, // Assuming always ready to try
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(`Failed to retrieve stats: ${error.message}`, { status: 500 });
  }
};
