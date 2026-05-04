"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { toast } from "react-toastify";
import { getPresignedUrl, uploadToS3 } from "@/utils/upload";

export interface Category {
  id: number;
  name: string;
  image: string;
  created_at: string;
}

export function useCategories(enabled: boolean) {
  const authFetch = useAuthFetch();

  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const CATEGORIES_URL = `${BASE}/categories/`;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // LOAD ALL
  // ------------------------------
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authFetch(CATEGORIES_URL);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [authFetch, CATEGORIES_URL]);

  useEffect(() => {
    if (enabled) fetchCategories();
  }, [enabled, fetchCategories]);

  // ------------------------------
  // CREATE CATEGORY (NEW LOGIC)
  // ------------------------------
  const addCategory = async (values: any, file: File | null) => {
    try {
      let imageUrl = "";

      // Upload file to S3 first
      if (file) {
        const { upload_url, final_url } = await getPresignedUrl(
          authFetch,
          file,
          "categories"
        );

        await uploadToS3(upload_url, file);
        imageUrl = final_url;
      }

      const res = await authFetch(CATEGORIES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          image: imageUrl,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Category created!");
      fetchCategories();
    } catch {
      toast.error("Failed to create category.");
    }
  };

  // ------------------------------
  // DELETE
  // ------------------------------
  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;

    try {
      const res = await authFetch(`${CATEGORIES_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Category deleted.");
      fetchCategories();
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  return {
    categories,
    loading,
    addCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
}
