"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "react-toastify";

export interface ContactInquiry {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  business_type?: string;
  investment_capacity?: string;
  message: string;
  source_platform: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  status: string;
  created_at: string;
  inquiry_type?: string;
  target_name?: string;
}

export function useContactInquiries(enabled: boolean) {
  const authFetch = useAuthFetch();

  const API = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const LIST_URL = `${API}/contact-inquiries/`;

  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(LIST_URL);
      if (!res.ok) {
        throw new Error("Failed to load contact inquiries");
      }

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setInquiries(list);

      toast.success("Contact inquiries loaded ✔️");
    } catch (err: any) {
      setError(err.message || "Failed to load contact inquiries.");
      setInquiries([]);

      toast.error(err.message || "Failed to load contact inquiries ❌");
    } finally {
      setLoading(false);
    }
  }, [authFetch, LIST_URL]);

  useEffect(() => {
    if (!enabled) return;
    fetchInquiries();
  }, [enabled, fetchInquiries]);

  // Optionally delete an inquiry
  const deleteInquiry = async (id: number) => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(`${LIST_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete inquiry");
      }

      await fetchInquiries();
      toast.success("Inquiry deleted 🗑️");
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to delete inquiry ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(`${LIST_URL}${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      await fetchInquiries();
      toast.success("Status updated ✔️");
      return true;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update status ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    inquiries,
    loading,
    error,
    fetchInquiries,
    deleteInquiry,
    updateStatus,
  };
}
