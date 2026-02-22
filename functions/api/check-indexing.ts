// functions/api/check-indexing.ts
import type { AppSettings } from '../../src/types';

interface Env {
  SETTINGS_KV: KVNamespace;
}

const SETTINGS_KEY = "APP_SETTINGS";

/**
 * Handles GET requests to check Google indexing status for a domain.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new Response('Domain parameter is required.', { status: 400 });
    }

    const settingsJson = await env.SETTINGS_KV.get(SETTINGS_KEY);
    const settings: AppSettings = settingsJson ? JSON.parse(settingsJson) : {};

    const googleApiKey = settings.googleApiKey;
    const googleCxId = settings.googleCxId;

    if (!googleApiKey || !googleCxId) {
      return new Response('Google API Key or CX ID not configured in settings.', { status: 401 });
    }

    const googleSearchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCxId}&q=site:${domain}&alt=json`;

    const googleResponse = await fetch(googleSearchUrl);

    if (!googleResponse.ok) {
      const errorData = await googleResponse.json();
      console.error('Google API Error:', errorData);

      let message = `Google API failed: ${errorData.error?.message || googleResponse.statusText}`;
      let fixUrl = null;

      // Check for the specific error that includes a link to enable the API
      if (errorData.error?.details) {
        const accessNotConfigured = errorData.error.details.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.Help');
        if (accessNotConfigured && accessNotConfigured.links?.[0]?.url) {
          fixUrl = accessNotConfigured.links[0].url;
        }
      }
      
      return new Response(JSON.stringify({ message, fixUrl }), {
        status: googleResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await googleResponse.json();
    const totalResults = parseInt(data.searchInformation?.totalResults || '0', 10);

    return new Response(JSON.stringify({ domain, indexedCount: totalResults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in check-indexing function:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
};
