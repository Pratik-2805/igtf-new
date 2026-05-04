"use client";

import { useState, useEffect, useCallback } from "react";
import { ExhibitorRegistration } from "@/utils/api";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "react-toastify";

export function useExhibitors(enabled: boolean) {
  const authFetch = useAuthFetch();

  const [exhibitors, setExhibitors] = useState<ExhibitorRegistration[]>([]);
  const [occupiedStalls, setOccupiedStalls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // BASE URL (always from env)
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const EXHIBITORS_URL = `${BASE}/exhibitor-registrations/`;

  // -------------------------------------------------------------
  // FETCH LIST
  // -------------------------------------------------------------
  const fetchExhibitors = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authFetch(EXHIBITORS_URL);

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`);
      }

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      const normalized = list.map((item: any) => ({
        ...item,
        event_location: item.event_location ?? "",
      }));

      setExhibitors(normalized);
    } catch (err) {
      console.error("fetchExhibitors error:", err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, EXHIBITORS_URL]);

  const fetchOccupiedStalls = useCallback(async () => {
    try {
      const res = await authFetch(`${EXHIBITORS_URL}occupied_stalls/`);
      if (!res.ok) throw new Error("Failed to load occupied stalls");
      const data = await res.json();
      setOccupiedStalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchOccupiedStalls error:", err);
    }
  }, [authFetch, EXHIBITORS_URL]);

  useEffect(() => {
    if (enabled) {
      fetchExhibitors();
      fetchOccupiedStalls();
    }
  }, [enabled, fetchExhibitors, fetchOccupiedStalls]);

  // -------------------------------------------------------------
  // UPDATE STATUS
  // -------------------------------------------------------------

  const updateStatus = async (
    id: number,
    newStatus: ExhibitorRegistration["status"]
  ) => {
    try {
      setIsUpdating(true);

      // ⏳ small UX delay (same as visitors)
      await new Promise((r) => setTimeout(r, 500));

      const res = await authFetch(`${EXHIBITORS_URL}${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // 🟦 Find exhibitor locally
      const exhibitor = exhibitors.find((e) => e.id === id);

      // 🟦 Display readable name
      const displayName = exhibitor
        ? exhibitor.company_name?.trim()
        : "Exhibitor";

      // 🟦 Toast message
      toast.success(`${displayName} has been updated to ${newStatus}`);

      // 🔄 Re-fetch data
      await fetchExhibitors();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // -------------------------------------------------------------
  // STATS
  // -------------------------------------------------------------
  const stats = {
    totalExhibitors: exhibitors.length,
    paidExhibitors: exhibitors.filter((e) => e.status === "paid").length,
    contactedExhibitors: exhibitors.filter((e) => e.status === "contacted")
      .length,
    pendingExhibitors: exhibitors.filter((e) => e.status === "pending").length,
    rejectedExhibitors: exhibitors.filter((e) => e.status === "rejected")
      .length,
  };

  return {
    exhibitors,
    loading,
    isUpdating,

    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,

    updateStatus,
    deleteExhibitor: async (id: number) => {
      try {
        const res = await authFetch(`${EXHIBITORS_URL}${id}/`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete exhibitor");
        toast.success("Exhibitor deleted successfully");
        fetchExhibitors();
      } catch (err) {
        toast.error("Failed to delete exhibitor");
      }
    },
    updateStallNumber: async (id: number, stallNumber: string) => {
      try {
        setIsUpdating(true);
        const res = await authFetch(`${EXHIBITORS_URL}${id}/`, {
          method: "PATCH",
          body: JSON.stringify({ stall_number: stallNumber }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || "Failed to update stall number");
        }
        toast.success("Stall number assigned successfully!");
        fetchExhibitors();
      } catch (err: any) {
        toast.error(err.message || "Failed to update stall number");
      } finally {
        setIsUpdating(false);
      }
    },
    updateEventDetails: async (id: number, eventName: string, eventLocation: string, extraData?: { product_category?: string }) => {
      try {
        setIsUpdating(true);
        const res = await authFetch(`${EXHIBITORS_URL}${id}/`, {
          method: "PATCH",
          body: JSON.stringify({ 
            event_name: eventName, 
            event_location: eventLocation,
            ...(extraData || {})
          }),
        });
        if (!res.ok) throw new Error("Failed to update event details");
        toast.success("Event details updated successfully!");
        fetchExhibitors();
      } catch (err: any) {
        toast.error(err.message || "Failed to update event details");
      } finally {
        setIsUpdating(false);
      }
    },
    stats,
    occupiedStalls,
    refetch: () => {
      fetchExhibitors();
      fetchOccupiedStalls();
    },
  };
}
