"use client";

import { useEffect } from "react";
import { ChatBot } from "@/components/chat-bot";
import { Navbar } from "@/components/navbar";
import { Footer } from "./footer";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
// import { useEvents } from "@/hooks/useEvents";

export default function HomePage() {
  const { categories, loading: categoriesLoading } = useCategories(true); // Fetch categories when component mounts
  // const { events, loading: eventsLoading } = useEvents(true); // Fetch events when component mounts
  // --- FIX: Reinitialize scroll animations on component mount ---
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".scroll-animate, .scroll-animate-zoom, .scroll-animate-right"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="pt-20">
        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden animate-fade-in">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/75" />

          <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto animate-slide-up">
            <p className="text-sm md:text-base tracking-[0.3em] uppercase mb-6 animate-fade-in-delay-1">
              Welcome To
            </p>

            <h1 className="font-serif text-6xl md:text-8xl lg:text-10xl mb-8 animate-fade-in-delay-2">
              Indo Global Trade Fair
            </h1>

            <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in-delay-3">
              <div className="h-px w-24 bg-white/50" />
              <p className="text-sm md:text-base tracking-widest uppercase">
                Save The Date
              </p>
              <div className="h-px w-24 bg-white/50" />
            </div>

            <h2 className="text-2xl md:text-4xl mb-8 font-light animate-fade-in-delay-4">
              {categories.length} Categories, 1 Platform, Inspiring Global Trade
            </h2>

            {/* <div className="mb-8 flex flex-col items-center w-full"> */}
            {/* {events && events.length > 0 && (
                <div className="w-full flex flex-col items-center gap-4">
                  <div className="w-full flex flex-col sm:flex-row sm:justify-center sm:items-stretch gap-4">
                    {events.slice(0, 2).map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className="bg-white/10 border border-white/20 rounded-xl shadow-md p-4 flex-1 min-w-[230px] max-w-xs text-white text-lg font-medium text-center flex flex-col items-center"
                      >
                        <span className="block text-2xl font-bold mb-2">
                          {event.title}
                        </span>
                        <span className="block">
                          {event.start_date && event.end_date
                            ? `${event.start_date} - ${event.end_date}`
                            : event.start_date
                            ? event.start_date
                            : "Date To be announced"}
                        </span>
                        <span className="block">
                          {event.location ? event.location : "Location To be announced"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {events.length > 2 && (
                    <div className="w-full flex flex-col items-center gap-4 mt-4">
                      {events.slice(2).map((event, idx) => (
                        <div
                          key={event.id || idx}
                          className="bg-white/10 border border-white/20 rounded-xl shadow-md p-4 w-full max-w-xs text-white text-lg font-medium text-center flex flex-col items-center"
                        >
                          <span className="block text-2xl font-bold mb-2">
                            {event.title}
                          </span>
                          <span className="block">
                            {event.start_date && event.end_date
                              ? `${event.start_date} - ${event.end_date}`
                              : event.start_date
                              ? event.start_date
                              : "Date To be announced"}
                          </span>
                          <span className="block">
                            {event.location ? event.location : "Location To be announced"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )} */}
            {/* <div className="bg-white rounded-lg shadow-lg mt-6 p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-1 text-gray-800">Dubai Expo</h3>
                <div className="flex items-center text-gray-500 mb-2 text-sm">
                  <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512" fill="currentColor" width="16"><path d="M168 0C150.3 0 136 14.3 136 32V72H64C28.7 72 0 100.7 0 136V456c0 30.9 25.1 56 56 56H328c30.9 0 56-25.1 56-56V136c0-35.3-28.7-64-64-64h-72V32c0-17.7-14.3-32-32-32h-48zm80 136V72H136v64H64c-13.3 0-24 10.7-24 24V456c0 13.3 10.7 24 24 24H328c13.3 0 24-10.7 24-24V160c0-13.3-10.7-24-24-24H248z"/></svg>
                  Dubai
                </div>
                <div className="flex items-center text-gray-500 mb-2 text-sm">
                  <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="currentColor" width="16"><path d="M152 64c0-8.8 7.2-16 16-16H280c8.8 0 16 7.2 16 16V80H320c26.5 0 48 21.5 48 48V416c0 26.5-21.5 48-48 48H128c-26.5 0-48-21.5-48-48V128c0-26.5 21.5-48 48-48h24V64zm24 32v-8 8h96V72v8H176z"/></svg>
                  December 12-13, 2025
                </div>
                <div className="flex items-center text-gray-500 mb-4 text-sm">
                  <svg className="mr-1" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor" width="16"><path d="M256 16C119 16 16 119 16 256s103 240 240 240 240-103 240-240S393 16 256 16zm0 416c-97.2 0-176-78.8-176-176S158.8 80 256 80s176 78.8 176 176-78.8 176-176 176zm0-288a16 16 0 0 0-16 16v80h-80a16 16 0 0 0 0 32h96a16 16 0 0 0 16-16V144a16 16 0 0 0-16-16z"/></svg>
                  11:24 AM – 05:25 PM
                </div>
                <div className="border-t my-4" />
                <div className="grid grid-cols-2 gap-y-2 text-gray-700 text-sm">
                  <div>Exhibitors</div><div className="justify-self-end">10</div>
                </div>
              </div> */}
            {/* </div> */}

            {/* <div className="mb-8">
              {[
                { name: "Explore Events", href: "/events" },
                { name: "Register For Event", href: "/event-registration" }
              ].map((event) => (
                <a key={event.name} href={event.href} className="block mb-4 last:mb-0">
                  <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-700 px-8 py-3 rounded-md hover:scale-105 text-lg font-medium tracking-wider uppercase w-full">
                    {event.name}
                  </button>
                </a>
              ))}
            </div> */}

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-6">
              <a href="/visitors">
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-700 px-8 py-3 rounded-md hover:scale-105 text-lg font-medium tracking-wider uppercase">
                  Visitor Registration
                </button>
              </a>

              <a href="/exhibition">
                <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-700 px-8 py-3 rounded-md hover:scale-105 text-lg font-medium tracking-wider uppercase">
                  Exhibitor Registration
                </button>
              </a>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section className="py-8 bg-primary text-primary-foreground overflow-hidden">
          <div className="whitespace-nowrap animate-scroll">
            <span className="inline-block px-8 text-lg">
              Hardware & Tools | Toys | Chemical | Electronics & Components |
              Auto Parts | Construction Material | Agriculture & Equipment's |
              Plastic & Packaging | Sports | Food & Beverage | Pharma | Surgical
              Devices | Gifting & Stationary | Furniture | Kitchen Wear | Spices
              | Footwear | Home Décor |
            </span>
          </div>
        </section>

        {/* PM MODI SECTION */}
        <section className="py-20 px-4 bg-muted/30" data-nosnippet>
          {/* The data-nosnippet attribute above prevents Google from using this section's content or images in snippets */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative scroll-animate-zoom flex justify-center">
                <div className="relative w-1/2 aspect-4/5 rounded-lg overflow-hidden border-8 border-white shadow-2xl">
                  <Image
                    src="/extra/pm-modi.webp"
                    alt="Hon'ble Prime Minister Shri Narendra Modi"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              {/* Text */}
              <div className="space-y-6 scroll-animate-right">
                <h3 className="font-serif text-3xl md:text-4xl">
                  Vision: Local to Global
                </h3>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  Inspired by Hon'ble Prime Minister Shri Narendra Modi's
                  visionary initiative
                </p>

                <blockquote className="border-l-4 border-primary pl-6 italic text-lg text-muted-foreground">
                  "Make in India, Make for the World - Let us transform local
                  craftsmanship into global excellence."
                </blockquote>

                <p className="text-muted-foreground leading-relaxed">
                  The Indo Global Trade Fair embodies this vision by creating a
                  platform where Indian MSMEs can showcase their capabilities
                  globally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="py-16 lg:py-24 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="scroll-animate">
                <div className="text-6xl md:text-7xl font-serif font-bold text-primary mb-3">
                  400+
                </div>
                <p className="text-muted-foreground">Exhibitors</p>
              </div>

              <div className="scroll-animate animation-delay-100">
                <div className="text-6xl md:text-7xl font-serif font-bold text-primary mb-3">
                  6000+
                </div>
                <p className="text-muted-foreground">Trade Buyers</p>
              </div>

              <div className="scroll-animate animation-delay-200">
                <div className="text-6xl md:text-7xl font-serif font-bold text-primary mb-3">
                  40+
                </div>
                <p className="text-muted-foreground">Countries</p>
              </div>

              <div className="scroll-animate animation-delay-300">
                <div className="text-6xl md:text-7xl font-serif font-bold text-primary mb-3">
                  {categories.length}
                </div>
                <p className="text-muted-foreground">Categories</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-16 lg:py-24 px-4 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-5xl mb-6 font-bold">
              Ready to Expand Your Business Globally?
            </h2>

            <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
              Join India’s premier B2B trade platform connecting manufacturers
              with international buyers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/exhibition" className="w-full sm:w-auto">
                <button className="w-full bg-white text-primary hover:bg-white/90 px-8 py-3.5 rounded-md text-lg font-semibold shadow-lg hover:scale-105 transition">
                  Become an Exhibitor
                </button>
              </a>

              <a href="/about" className="w-full sm:w-auto">
                <button className="w-full bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3.5 rounded-md text-lg font-semibold hover:scale-105 transition">
                  Learn More
                </button>
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <ChatBot />
    </div>
  );
}
