// functions/api/scrape-google.ts

interface Env {}

// A simple regex to find the result count string on a Google search page.
// This is fragile and likely to break if Google changes their HTML.
const RESULT_COUNT_REGEX = /About ([\d,]+) results/;

/**
 * Handles GET requests to scrape the number of indexed results from Google.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new Response('Domain parameter is required.', { status: 400 });
    }

    const googleSearchUrl = `https://www.google.com/search?q=site:${domain}&hl=en`;

    const googleResponse = await fetch(googleSearchUrl, {
        headers: {
            // Use a common user-agent to appear more like a real browser
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        }
    });

    if (!googleResponse.ok) {
      return new Response(`Google responded with status: ${googleResponse.status}`, { status: 500 });
    }

    const html = await googleResponse.text();
    
    const match = html.match(RESULT_COUNT_REGEX);

    if (!match || !match[1]) {
      // This can happen if Google shows a CAPTCHA or changes their layout.
      return new Response('Could not parse result count. Google may have blocked the request or changed its page layout.', { status: 503 });
    }
    
    const totalResults = parseInt(match[1].replace(/,/g, ''), 10);

    return new Response(JSON.stringify({ domain, indexedCount: totalResults }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in scrape-google function:', error);
    return new Response('An internal server error occurred while scraping.', { status: 500 });
  }
};
