import { NextRequest, NextResponse } from "next/server";
import { getListingById } from "@/lib/data/mock-listings";
import { analyzeListing, generateAIReport } from "@/lib/ai/scoring-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const analysis = analyzeListing(listing);
  const report = generateAIReport(listing, analysis);

  return NextResponse.json({ listing: { ...listing, analysis }, report });
}
