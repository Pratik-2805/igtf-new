"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { ChatBot } from "@/components/chat-bot";
import { Footer } from "@/components/footer";
import GallerySlider from "@/components/GallerySlider";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const GALLERY_API_URL = `${BASE_URL}/gallery/`;

interface GalleryItem {
  id: number;
  image: string;
}

export default function GalleryPage() {
  /* ---------------- BASIC STATE ---------------- */
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loadingBanner, setLoadingBanner] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(true);

  /* ---------------- PAGINATION ---------------- */
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- FULLSCREEN VIEWER ---------------- */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  /* ---------------- TOUCH / ZOOM ---------------- */
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const touchStartX = useRef<number | null>(null);
  const lastTouchDistance = useRef<number | null>(null);
  const lastPanPoint = useRef<{ x: number; y: number } | null>(null);

  /* ---------------- RESET ZOOM ON IMAGE CHANGE ---------------- */
  useEffect(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, [activeIndex]);

  /* ---------------- LOAD BANNER ---------------- */
  useEffect(() => {
    const loadBanner = async () => {
      try {
        const res = await fetch(
          `${GALLERY_API_URL}?page=gallery&section=main`,
          { cache: "no-store" }
        );
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.results ?? [];
        setBannerImages(items.map((i: any) => i.image).filter(Boolean));
      } finally {
        setLoadingBanner(false);
      }
    };
    loadBanner();
  }, []);

  /* ---------------- LOAD GRID ---------------- */
  useEffect(() => {
    const loadGrid = async () => {
      try {
        const res = await fetch(
          `${GALLERY_API_URL}?page=gallery&section=exhibition_moments`,
          { cache: "no-store" }
        );
        const data = await res.json();

        const results = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : [];

        setGallery(results);
        setNextUrl(data?.next ?? null);
      } finally {
        setLoadingGrid(false);
      }
    };
    loadGrid();
  }, []);

  /* ---------------- LOAD MORE ---------------- */
  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);

    try {
      const res = await fetch(
        nextUrl.startsWith("http") ? nextUrl : `${BASE_URL}${nextUrl}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const newItems = Array.isArray(data?.results) ? data.results : [];
      setGallery((prev) => [...prev, ...newItems]);
      setNextUrl(data?.next ?? null);
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  /* ---------------- OBSERVER ---------------- */
  useEffect(() => {
    if (!loaderRef.current || !nextUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) loadMore();
      },
      { rootMargin: "200px" }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [nextUrl, loadingMore, loadMore]);

  /* ---------------- KEYBOARD NAV ---------------- */
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveIndex(null);
      if (scale > 1) return;
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => Math.max((i ?? 0) - 1, 0));
      if (e.key === "ArrowRight")
        setActiveIndex((i) => Math.min((i ?? 0) + 1, gallery.length - 1));
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, scale, gallery.length]);

  /* ---------------- TOUCH HANDLERS ---------------- */
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      if (scale > 1) {
        lastPanPoint.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    }

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance.current = Math.hypot(dx, dy);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Pinch zoom
    if (e.touches.length === 2 && lastTouchDistance.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const scaleChange = distance / lastTouchDistance.current;

      setScale((prev) => Math.min(Math.max(prev * scaleChange, 1), 4));
      lastTouchDistance.current = distance;
      return;
    }

    // Pan when zoomed
    if (e.touches.length === 1 && scale > 1 && lastPanPoint.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - lastPanPoint.current.x;
      const dy = e.touches[0].clientY - lastPanPoint.current.y;

      setTranslate((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      lastPanPoint.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    lastTouchDistance.current = null;
    lastPanPoint.current = null;

    if (scale > 1) return;

    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;

    if (delta > 60) setActiveIndex((i) => Math.max((i ?? 0) - 1, 0));
    if (delta < -60)
      setActiveIndex((i) => Math.min((i ?? 0) + 1, gallery.length - 1));

    touchStartX.current = null;
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20">
        {/* HERO */}
        <section className="py-16 text-center">
          <h1 className="font-serif text-5xl md:text-6xl mb-4">Gallery</h1>
          <p className="text-muted-foreground">
            Explore highlights from our exhibitions
          </p>
        </section>

        {/* BANNER */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto rounded-xl overflow-hidden">
            {loadingBanner ? (
              <div className="h-[400px] bg-muted animate-pulse" />
            ) : (
              <GallerySlider images={bannerImages} />
            )}
          </div>
        </section>

        {/* GRID */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center font-serif text-4xl mb-12">
              Exhibition Moments
            </h2>

            {loadingGrid ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full aspect-5/3 bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {gallery.map((item, i) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveIndex(i)}
                      className="relative w-full aspect-5/3 rounded-xl overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {nextUrl && <div ref={loaderRef} className="h-10" />}
              </>
            )}

            {loadingMore && (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* FULLSCREEN VIEWER */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center overflow-hidden"
          onClick={() => scale === 1 && setActiveIndex(null)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            src={gallery[activeIndex].image}
            alt=""
            draggable={false}
            className="select-none"
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transition: scale === 1 ? "transform 0.2s ease" : "none",
              maxWidth: "95vw",
              maxHeight: "95vh",
              objectFit: "contain",
            }}
          />
        </div>
      )}

      <Footer />
      <ChatBot />
    </div>
  );
}
