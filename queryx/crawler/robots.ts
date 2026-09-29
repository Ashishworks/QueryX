import robotsParser from "robots-parser";

const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

export async function canCrawl(
  url: string
): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);

    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
    const origin = parsedUrl.origin;

    let robots = robotsCache.get(origin);

    if (!robots) {
      const response = await fetch(robotsUrl, {
        headers: {
          "User-Agent": "QueryX/1.0 (Educational Search Engine)",
        },
      });

      const robotsText = response.ok
        ? await response.text()
        : "";

      robots = robotsParser(robotsUrl, robotsText);

      robotsCache.set(origin, robots);
    }

    return robots.isAllowed(
      url,
      "QueryX"
    ) ?? true;
  } catch {
    // If robots.txt cannot be retrieved or parsed,
    // don't let it crash the crawler.
    return true;
  }
}