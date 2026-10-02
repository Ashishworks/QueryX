import { NextRequest, NextResponse } from "next/server";
import { search } from "../../../search/engine";

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

  const results = search(query);

  return NextResponse.json({
    query,
    results,
  });
}