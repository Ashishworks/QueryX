import { NextRequest, NextResponse } from "next/server";

import { db } from "../../../storage/database";
import { buildIndex } from "../../../indexer/build-index";
import { processQuery } from "../../../search/query";
import { rankDocuments } from "../../../search/ranking";
import { getTopK } from "../../../search/top-k";
import { getSearchResults } from "../../../search/snippets";

const TOP_K = 10;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      {
        query: "",
        results: [],
      },
      { status: 400 }
    );
  }

  const index = buildIndex();

  const totalDocuments = (
    db
      .prepare("SELECT COUNT(*) as count FROM documents")
      .get() as { count: number }
  ).count;

  const queryResult = processQuery(query, index);

  const rankedResults = rankDocuments(
    queryResult,
    totalDocuments
  );

  const topResults = getTopK(
    rankedResults,
    TOP_K
  );

  const searchResults = getSearchResults(
    topResults,
    queryResult.terms
  );

  return NextResponse.json({
    query,
    terms: queryResult.terms,
    results: searchResults,
  });
}