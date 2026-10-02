export type SearchResult = {
  docId: number;
  title: string;
  url: string;
  snippet: string;
  score: number;
};

export type SearchResponse = {
  query: string;
  terms: string[];
  results: SearchResult[];
};