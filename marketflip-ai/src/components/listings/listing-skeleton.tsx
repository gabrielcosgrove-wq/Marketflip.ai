export function ListingCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-surface overflow-hidden">
      <div className="aspect-[4/3] w-full skeleton" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-4 w-4/5 rounded skeleton" />
        <div className="h-3 w-1/2 rounded skeleton" />
        <div className="h-16 w-full rounded-[var(--radius-sm)] skeleton" />
        <div className="h-8 w-full rounded-full skeleton" />
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
