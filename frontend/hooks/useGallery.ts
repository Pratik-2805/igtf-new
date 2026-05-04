"use client";

import { useState, useEffect, useCallback } from "react";
import { URLS, GalleryImage } from "@/utils/api";
import { toast } from "react-hot-toast";
import { useAuthFetch } from "@/hooks/useAuthFetch";
import { getPresignedUrl, uploadToS3 } from "@/utils/upload";

interface UseGalleryOptions {
  enabled?: boolean;
  page?: GalleryImage["page"];
  section?: GalleryImage["section"];
}

export function useGallery(options: UseGalleryOptions = {}) {
  const { enabled = true, page, section } = options;

  const authFetch = useAuthFetch();
  const GALLERY_URL = URLS.GALLERY;

  // ---------------- STATE ----------------
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);

  // ---------------- FETCH FIRST PAGE ----------------
  const fetchGallery = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);

      const url = new URL(GALLERY_URL);
      if (page) url.searchParams.set("page", page);
      if (section) url.searchParams.set("section", section);

      const res = await authFetch(url.toString(), { method: "GET" });
      if (!res.ok) throw new Error();

      const data = await res.json();

      const results = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : [];

      setGallery(results);
      setNextUrl(data?.next ?? null);
    } catch {
      toast.error("Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [enabled, page, section, authFetch]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // ---------------- LOAD MORE (INFINITE SCROLL) ----------------
  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;

    setLoadingMore(true);

    try {
      const res = await authFetch(
        nextUrl.startsWith("http") ? nextUrl : `${URLS.GALLERY}${nextUrl}`,
        { method: "GET" }
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      const newItems = Array.isArray(data?.results) ? data.results : [];

      setGallery((prev) => [...prev, ...newItems]);
      setNextUrl(data?.next ?? null);
    } catch {
      toast.error("Failed to load more images");
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore, authFetch]);

  // ---------------- ADD IMAGE ----------------
  const addGalleryImage = async (payload: {
    page: string;
    section: string;
  }) => {
    try {
      if (!imageFile) {
        toast.error("Please select an image.");
        return;
      }

      // 1️⃣ Presigned URL
      const { upload_url, final_url } = await getPresignedUrl(
        authFetch,
        imageFile,
        "gallery"
      );

      // 2️⃣ Upload to S3
      await uploadToS3(upload_url, imageFile);

      // 3️⃣ Save metadata
      const res = await authFetch(GALLERY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: payload.page,
          section: payload.section,
          image: final_url,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Uploaded successfully!");
      setImageFile(null);

      // Refresh gallery
      fetchGallery();
    } catch {
      toast.error("Upload failed");
    }
  };

  // ---------------- DELETE IMAGE ----------------
  const deleteGalleryImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const res = await authFetch(`${GALLERY_URL}${id}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Deleted!");
      fetchGallery();
    } catch {
      toast.error("Could not delete.");
    }
  };

  // ---------------- RETURN ----------------
  return {
    gallery,
    loading,

    // infinite scroll
    nextUrl,
    loadingMore,
    loadMore,

    // upload
    imageFile,
    setImageFile,
    addGalleryImage,

    // delete
    deleteGalleryImage,

    // manual refresh
    refetch: fetchGallery,
  };
}
