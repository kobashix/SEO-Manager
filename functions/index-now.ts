// functions/index-now.ts

interface IndexNowRequestBody {
  urlList: string[];
}

interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const body: IndexNowRequestBody = await request.json();
    const { urlList } = body;

    if (!urlList || !Array.isArray(urlList) || urlList.length === 0) {
      return new Response(JSON.stringify({ error: 'urlList array is required.' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
      });
    }

    // Group URLs by their hostname
    const groups: { [host: string]: string[] } = {};
    for (const urlStr of urlList) {
      try {
        const u = new URL(urlStr);
        if (!groups[u.hostname]) groups[u.hostname] = [];
        groups[u.hostname].push(urlStr);
      } catch (e) {
        console.error(`Invalid URL in list: ${urlStr}`);
      }
    }

    const hostnames = Object.keys(groups);
    const results = [];
    let overallSuccess = true;
    let lastError = null;

    // The shared API key
    const apiKey = 'TeqhIndexNowKey2026';

    // Call IndexNow for each group (hostname)
    for (const host of hostnames) {
      const payload: IndexNowPayload = {
        host: host,
        key: apiKey,
        keyLocation: `https://${host}/${apiKey}.txt`,
        urlList: groups[host],
      };

      const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!indexNowResponse.ok) {
        overallSuccess = false;
        const errorText = await indexNowResponse.text();
        lastError = { host, status: indexNowResponse.status, error: errorText };
        console.error(`IndexNow API Error for ${host}:`, errorText);
      } else {
        results.push({ host, count: groups[host].length });
      }
    }

    if (!overallSuccess && results.length === 0) {
      return new Response(JSON.stringify({ 
          error: `IndexNow API failed. Last error from ${lastError?.host} (status ${lastError?.status}): ${lastError?.error}` 
      }), {
        status: lastError?.status || 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
        message: `Processed ${hostnames.length} hosts. Success on ${results.length} hosts.`,
        details: results,
        partialFailure: !overallSuccess
    }), {
      status: overallSuccess ? 200 : 207, // 207 Multi-Status
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error processing IndexNow request:', error);
    return new Response(JSON.stringify({ error: `Internal error: ${error.message}` }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
};
