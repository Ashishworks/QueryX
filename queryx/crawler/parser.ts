import { Parser } from "htmlparser2";
import { canonicalizeUrl } from "./canonicalize";

export type ParsedDocument = {
  url: string;
  title: string;
  headings: string[];
  text: string;
  links: string[];
};

export function parseHtml(
  html: string,
  pageUrl: string
): ParsedDocument {
  let title = "";
  const headings: string[] = [];
  const links: string[] = [];

  
  let currentTag: string | null = null;

  const textParts: string[] = [];

  const parser = new Parser(
    {
      onopentag(name, attributes) {
        currentTag = name;

        if (name === "a" && attributes.href) {
          const url = canonicalizeUrl(
            attributes.href,
            pageUrl
          );

          if (url) {
            links.push(url);
          }
        }
      },

      ontext(text) {
        const cleaned = text.replace(/\s+/g, " ").trim();

        if (!cleaned) {
          return;
        }


        if (currentTag === "title") {
          title += cleaned + " ";
        }

        if (
          currentTag === "h1" ||
          currentTag === "h2" ||
          currentTag === "h3"
        ) {
          headings.push(cleaned);
        }

        if (
          currentTag !== "script" &&
          currentTag !== "style" &&
          currentTag !== "noscript"
        ) {
          textParts.push(cleaned);
        }
      },

      onclosetag() {
        currentTag = null;
      },
    },
    {
      decodeEntities: true,
    }
  );

  parser.write(html);
  parser.end();

  return {
    url: pageUrl,
    title: title.trim(),
    headings,
    text: textParts.join(" "),
    links: [...new Set(links)],
  };
}