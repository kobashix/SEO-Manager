// functions/api/settings.ts

import type { AppSettings } from '../../src/types';

interface Env {
  SETTINGS_KV: KVNamespace;
}

const SETTINGS_KEY = "APP_SETTINGS";

/**
 * Handles GET requests to retrieve settings.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const settingsJson = await env.KV.get(SETTINGS_KEY);
    const settings: AppSettings = settingsJson ? JSON.parse(settingsJson) : {};
    
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to get settings:", error);
    return new Response("Failed to retrieve settings.", { status: 500 });
  }
};

/**
 * Handles POST requests to update settings.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const newSettings: AppSettings = await request.json();

    // Basic validation
    if (typeof newSettings.googleApiKey !== 'string' || typeof newSettings.googleCxId !== 'string') {
      return new Response("Invalid settings payload.", { status: 400 });
    }

    await env.KV.put(SETTINGS_KEY, JSON.stringify(newSettings));
    
    return new Response(JSON.stringify({ message: "Settings saved successfully." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return new Response("Failed to save settings.", { status: 500 });
  }
};
