import { Suspense } from "react";
import { SearchPageClient } from "@/components/search/search-page-client";
import { ListingGridSkeleton } from "@/components/listings/listing-skeleton";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <ListingGridSkeleton count={6} />
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  );
}
