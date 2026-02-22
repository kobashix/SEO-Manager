// functions/index-now.ts

// Define the structure of the request body we expect from the frontend
interface IndexNowRequestBody {
  urlList: string[];
}

// Define the structure of the payload for the IndexNow API
interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

/**
 * Cloudflare Pages function to handle POST requests for IndexNow submissions.
 */
export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body: IndexNowRequestBody = await request.json();
    const { urlList } = body;

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return new Response('urlList array is required.', { status: 400 });
    }

    // IndexNow uses one host from the list to verify the key. We'll use the first one.
    const primaryUrl = new URL(urlList[0]);
    const host = primaryUrl.hostname;

    const apiKey = 'TeqhIndexNowKey2026';
    const keyLocation = `https://${host}/${apiKey}.txt`;

    const payload: IndexNowPayload = {
      host: host,
      key: apiKey,
      keyLocation: keyLocation,
      urlList: urlList,
    };

    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!indexNowResponse.ok) {
      const errorText = await indexNowResponse.text();
      console.error('IndexNow API Error:', errorText);
      return new Response(`IndexNow API failed with status: ${indexNowResponse.status}. ${errorText}`, {
        status: indexNowResponse.status,
      });
    }
    
    // Success
    return new Response(JSON.stringify({ message: `Successfully submitted ${urlList.length} URLs to IndexNow.` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing IndexNow request:', error);
    return new Response('An internal error occurred.', { status: 500 });
  }
};
