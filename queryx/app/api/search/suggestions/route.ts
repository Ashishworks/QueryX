
import { NextRequest, NextResponse } from "next/server";
import { getSuggestions } from "../../../../search/suggestions";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({
      query: "",
      suggestions: [],
    });
  }

  const suggestions = getSuggestions(query);

  return NextResponse.json({
    query,
    suggestions,
  });
}
