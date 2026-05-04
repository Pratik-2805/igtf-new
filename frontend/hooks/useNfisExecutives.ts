"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "react-toastify";
import { TeamUser } from "./useTeam";

export function useNfisExecutives(enabled: boolean) {
  const authFetch = useAuthFetch();

  const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const LIST_URL = `${API}/team/list/`;
  const CREATE_URL = `${API}/team/create/`;
  const DELETE_URL = `${API}/team/delete/`;

  const [executives, setExecutives] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchExecutives = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(LIST_URL);
      if (!res.ok) {
        throw new Error(
          res.status === 403
            ? "Unauthorized — Only admin can view team"
            : "Server error"
        );
      }

      const data = await res.json();

      const sorted = [...data]
        .filter((u: TeamUser) => u.role === "executive")
        .sort((a, b) => b.id - a.id);

      setExecutives(sorted);
      toast.success("NFIS Executives list updated ✔️");
    } catch (err: any) {
      setError(err.message || "Failed to load executives.");
      setExecutives([]);
      toast.error(err.message || "Failed to load executives ❌");
    } finally {
      setLoading(false);
    }
  }, [authFetch, LIST_URL]);

  useEffect(() => {
    if (!enabled) return;
    fetchExecutives();
  }, [enabled, fetchExecutives]);

  const createExecutive = async (payload: { name: string; email: string }) => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(CREATE_URL, {
        method: "POST",
        body: JSON.stringify({ ...payload, role: "executive" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create user");
      }

      await fetchExecutives();
      toast.success("NFIS Executive created 🎉");
      return { ok: true };
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to create executive ❌");
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteExecutive = async (id: number) => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(`${DELETE_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchExecutives();
      toast.success("Executive deleted 🗑️");
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to delete executive ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    executives,
    loading,
    error,
    fetchExecutives,
    createExecutive,
    deleteExecutive,
  };
}
