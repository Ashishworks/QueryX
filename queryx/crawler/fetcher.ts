const USER_AGENT = "QueryX/1.0 (Educational Search Engine)";

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB
const REQUEST_TIMEOUT = 10_000; // 10 seconds

export async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`Request failed: ${response.status} ${url}`);
      return null;
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("text/html")) {
      console.log(`Skipping non-HTML resource: ${url}`);
      return null;
    }

    const contentLength = response.headers.get("content-length");

    if (
      contentLength &&
      Number(contentLength) > MAX_RESPONSE_SIZE
    ) {
      console.log(`Skipping oversized response: ${url}`);
      return null;
    }

    const html = await response.text();

    if (Buffer.byteLength(html, "utf8") > MAX_RESPONSE_SIZE) {
      console.log(`Response exceeded size limit: ${url}`);
      return null;
    }

    return html;
  } catch (error) {
    console.log(`Failed to fetch: ${url}`);

    if (error instanceof Error) {
      console.log(error.message);
    }

    return null;
  }
}