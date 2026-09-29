export function canonicalizeUrl(
  rawUrl: string,
  baseUrl?: string
): string | null {
  try {
    const url = new URL(rawUrl, baseUrl);

    // Only allow HTTP and HTTPS
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    // Remove fragment
    url.hash = "";

    // Remove common tracking parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "fbclid",
      "gclid",
    ];

    for (const param of trackingParams) {
      url.searchParams.delete(param);
    }

    // Normalize hostname
    url.hostname = url.hostname.toLowerCase();

    // Remove default ports
    if (
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")
    ) {
      url.port = "";
    }

    // Normalize trailing slash
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return null;
  }
}