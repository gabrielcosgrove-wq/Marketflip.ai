"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserListingRelation } from "@/types";

// ============================================================================
// Dashboard Store
// ============================================================================
// Client-side store standing in for real Supabase-backed persistence.
// Shape mirrors `user_listing_records` in supabase/schema.sql exactly, so
// swapping this for real queries later is a 1:1 mapping, not a redesign.
// ============================================================================

interface DashboardState {
  records: Record<UserListingRelation, string[]>; // relation -> listingIds
  addRecord: (listingId: string, relation: UserListingRelation) => void;
  removeRecord: (listingId: string, relation: UserListingRelation) => void;
  toggleRecord: (listingId: string, relation: UserListingRelation) => void;
  hasRecord: (listingId: string, relation: UserListingRelation) => boolean;
  markViewed: (listingId: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      records: {
        saved: [],
        favorited: [],
        viewed: [],
        watchlist: [],
      },
      addRecord: (listingId, relation) =>
        set((state) => ({
          records: {
            ...state.records,
            [relation]: state.records[relation].includes(listingId)
              ? state.records[relation]
              : [listingId, ...state.records[relation]],
          },
        })),
      removeRecord: (listingId, relation) =>
        set((state) => ({
          records: {
            ...state.records,
            [relation]: state.records[relation].filter((id) => id !== listingId),
          },
        })),
      toggleRecord: (listingId, relation) => {
        const has = get().records[relation].includes(listingId);
        if (has) {
          get().removeRecord(listingId, relation);
        } else {
          get().addRecord(listingId, relation);
        }
      },
      hasRecord: (listingId, relation) =>
        get().records[relation].includes(listingId),
      markViewed: (listingId) => {
        const state = get();
        if (!state.records.viewed.includes(listingId)) {
          set({
            records: {
              ...state.records,
              viewed: [listingId, ...state.records.viewed].slice(0, 200),
            },
          });
        }
      },
    }),
    { name: "marketflip-dashboard-store" }
  )
);
