"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "react-toastify";

// Match your Django model
import type { InvestorRegistration } from "@/utils/api";

export function useInvestors(enabled: boolean) {
  const authFetch = useAuthFetch();

  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const INVESTORS_URL = `${BASE}/investor-registrations/`;

  const [investors, setInvestors] = useState<InvestorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ---------------------------------------------------------
  // FETCH INVESTORS
  // ---------------------------------------------------------
  const fetchInvestors = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authFetch(INVESTORS_URL);

      if (!res.ok) throw new Error("Failed to fetch investors");

      const data = await res.json();

      // Support DRF pagination
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setInvestors(list);
    } catch (err) {
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch, INVESTORS_URL]);

  useEffect(() => {
    if (!enabled) return;
    fetchInvestors();
  }, [enabled, fetchInvestors]);

  // ---------------------------------------------------------
  // UPDATE INVESTOR STATUS
  // ---------------------------------------------------------
  const updateStatus = async (
    id: number,
    newStatus: InvestorRegistration["status"]
  ) => {
    try {
      setIsUpdating(true);

      const res = await authFetch(`${INVESTORS_URL}${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Update failed");

      const investor = investors.find((v) => v.id === id);
      const displayName = investor?.full_name || "Investor";

      toast.success(`${displayName} has been updated to ${newStatus}`);

      await fetchInvestors();
    } catch (err) {
      toast.error("Failed to update investor status");
    } finally {
      setTimeout(() => {
        setIsUpdating(false);
      }, 500);
    }
  };

  // ---------------------------------------------------------
  // STATS
  // ---------------------------------------------------------
  const stats = {
    totalInvestors: investors.length,
    pendingInvestors: investors.filter((v) => v.status === "pending").length,
    contactedInvestors: investors.filter((v) => v.status === "contacted").length,
    convertedInvestors: investors.filter((v) => v.status === "converted").length,
    rejectedInvestors: investors.filter((v) => v.status === "rejected").length,
  };

  return {
    investors,
    loading,
    isUpdating,

    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,

    updateStatus,
    deleteInvestor: async (id: number) => {
      try {
        const res = await authFetch(`${INVESTORS_URL}${id}/`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete investor");
        toast.success("Investor deleted successfully");
        fetchInvestors();
      } catch (err) {
        toast.error("Failed to delete investor");
      }
    },
    updateEventDetails: async (id: number, eventName: string, eventLocation: string, extraData?: { interested_sector?: string }) => {
      try {
        setIsUpdating(true);
        const res = await authFetch(`${INVESTORS_URL}${id}/`, {
          method: "PATCH",
          body: JSON.stringify({ 
            event_name: eventName, 
            event_location: eventLocation,
            ...(extraData || {})
          }),
        });
        if (!res.ok) throw new Error("Failed to update event details");
        toast.success("Event details updated successfully!");
        fetchInvestors();
      } catch (err: any) {
        toast.error(err.message || "Failed to update event details");
      } finally {
        setIsUpdating(false);
      }
    },
    convertToExhibitor: async (investor: InvestorRegistration, stallNumber?: string) => {
      try {
        setIsUpdating(true);
        const res = await authFetch(`${INVESTORS_URL}${investor.id}/convert_to_exhibitor/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stall_number: stallNumber || "" }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.detail || "Failed to convert to exhibitor");
        }
        
        toast.success("Successfully copied to Exhibitor section!");
      } catch (err: any) {
        toast.error(err.message || "Failed to convert to exhibitor");
      } finally {
        setIsUpdating(false);
      }
    },
    stats,
    refetch: fetchInvestors,
  };
}
