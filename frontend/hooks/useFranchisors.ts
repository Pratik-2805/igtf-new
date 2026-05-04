"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "react-toastify";

// Match your Django model
import type { FranchisorRegistration } from "@/utils/api";
import { URLS } from "@/utils/api";

export function useFranchisors(enabled: boolean) {
  const authFetch = useAuthFetch();

  const FRANCHISORS_URL = URLS.FRANCHISORS;

  const [franchisors, setFranchisors] = useState<FranchisorRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // ---------------------------------------------------------
  // FETCH FRANCHISORS
  // ---------------------------------------------------------
  const fetchFranchisors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(FRANCHISORS_URL);
      if (!res.ok) throw new Error("Failed to fetch franchisors");
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setFranchisors(list);
    } catch (err) {
      setFranchisors([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch, FRANCHISORS_URL]);

  useEffect(() => {
    if (!enabled) return;
    fetchFranchisors();
  }, [enabled, fetchFranchisors]);

  // ---------------------------------------------------------
  // UPDATE STATUS
  // ---------------------------------------------------------
  const updateStatus = async (
    id: number,
    newStatus: FranchisorRegistration["status"]
  ) => {
    try {
      setIsUpdating(true);
      const res = await authFetch(`${FRANCHISORS_URL}${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");

      const fr = franchisors.find((v) => v.id === id);
      const displayName = fr?.company_name || "Franchisor";

      toast.success(`${displayName} updated to ${newStatus}`);
      await fetchFranchisors();
    } catch (err) {
      toast.error("Failed to update franchisor status");
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
    totalFranchisors: franchisors.length,
    pendingFranchisors: franchisors.filter((v) => v.status === "pending").length,
    contactedFranchisors: franchisors.filter((v) => v.status === "contacted").length,
    paidFranchisors: franchisors.filter((v) => v.status === "paid").length,
    rejectedFranchisors: franchisors.filter((v) => v.status === "rejected").length,
  };

  return {
    franchisors,
    loading,
    isUpdating,

    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,

    updateStatus,
    deleteFranchisor: async (id: number) => {
      try {
        const res = await authFetch(`${FRANCHISORS_URL}${id}/`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete franchisor");
        toast.success("Franchisor deleted successfully");
        fetchFranchisors();
      } catch (err) {
        toast.error("Failed to delete franchisor");
      }
    },
    updateEventDetails: async (id: number, eventName: string, eventLocation: string, extraData?: any) => {
      try {
        setIsUpdating(true);
        const res = await authFetch(`${FRANCHISORS_URL}${id}/`, {
          method: "PATCH",
          body: JSON.stringify({ 
            event_name: eventName, 
            event_location: eventLocation,
            ...(extraData || {})
          }),
        });
        if (!res.ok) throw new Error("Failed to update event details");
        toast.success("Event details updated successfully!");
        fetchFranchisors();
      } catch (err: any) {
        toast.error(err.message || "Failed to update event details");
      } finally {
        setIsUpdating(false);
      }
    },
    stats,
    refetch: fetchFranchisors,
    convertToExhibitor: async (franchisor: FranchisorRegistration) => {
      try {
        setIsUpdating(true);
        const res = await authFetch(`${FRANCHISORS_URL}${franchisor.id}/convert_to_exhibitor/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
  };
}
