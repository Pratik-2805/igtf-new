"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ChatBot } from "@/components/chat-bot";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { toast } from "react-toastify";
import { Footer } from "@/components/footer";

interface FormData {
  company_name: string;
  contact_person_name: string;
  designation: string;
  email_address: string;
  contact_number: string;
  product_category: string;
  company_address: string;
  event_location: string;
  stall_number?: string;
  event_name?: string;
}

interface EventData {
  id: number;
  title: string;
  location: string;
  venue: string;
  start_date: string;
  end_date: string;
  time_schedule: string;
  exhibitors_count: string;
  buyers_count: string;
  countries_count: string;
  sectors_count: string;
  is_active: boolean;
  opt_out_date: boolean;
  has_stall_layout: boolean;
  description: string;
  image?: string;
  sectors: { id: number; name: string; description: string }[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = `${BASE_URL}/exhibitor-registrations/`;
const EVENTS_API_URL = `${BASE_URL}/events/`;

export default function ExhibitionPage() {
  return (
    <Suspense fallback={<div>Loading Exhibition details...</div>}>
      <ExhibitionPageContent />
    </Suspense>
  );
}

function ExhibitionPageContent() {
  const [formData, setFormData] = useState<FormData>({
    company_name: "",
    contact_person_name: "",
    designation: "",
    email_address: "",
    contact_number: "",
    product_category: "",
    company_address: "",
    event_location: "",
    stall_number: "",
    event_name: "",
  });

  const [events, setEvents] = useState<EventData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEventDesc, setSelectedEventDesc] = useState<EventData | null>(null);

  // Wrap searchParams logic in a client component or use a helper
  const searchParams = useSearchParams();

  // Pre-fill from URL
  useEffect(() => {
    const stall = searchParams.get("stall");
    const category = searchParams.get("category");
    const event = searchParams.get("event");
    const location = searchParams.get("location");

    if (stall || category || event || location) {
      setFormData(prev => ({
        ...prev,
        stall_number: stall || prev.stall_number,
        product_category: category || prev.product_category,
        event_name: event || prev.event_name,
        event_location: location || prev.event_location,
      }));
    }
  }, [searchParams]);

  // ------------------------------------------------------------------
  // 1. Handle Hash Scroll Logic (Ensures we land on form when navigated)
  // ------------------------------------------------------------------
  useEffect(() => {
    // Check if url has hash
    if (window.location.hash === "#registration-form") {
      // Small timeout to allow DOM to paint
      setTimeout(() => {
        const element = document.getElementById("registration-form");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  }, [loadingEvents]); // Re-run check after events load (which changes page height)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);

        const response = await fetch(EVENTS_API_URL);
        if (!response.ok) {
          setEvents([]);
          return;
        }

        let data = await response.json();

        if (data?.results) {
          data = data.results;
        }

        if (!Array.isArray(data)) {
          setEvents([]);
          return;
        }

        // ⭐ IMPORTANT: Keep ALL events (active + past)
        data.sort(
          (a: EventData, b: EventData) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );

        setEvents(data);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const upcomingEvents = events
    .filter((ev) => ev.is_active)
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

  const pastEvents = events
    .filter((ev) => !ev.is_active)
    .sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    ); // newest past first

  const locations = Array.from(
    new Set(upcomingEvents.map((ev) => ev.location))
  );

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration submitted successfully!");

        setFormData({
          company_name: "",
          contact_person_name: "",
          designation: "",
          email_address: "",
          contact_number: "",
          product_category: "",
          company_address: "",
          event_location: "",
        });

        window.scrollTo({
          top: document.getElementById("registration-form")?.offsetTop! - 100,
          behavior: "smooth",
        });
      } else {
        const errorMsg = Object.values(data).flat().join(", ");
        toast.error(errorMsg);
      }
    } catch (error) {
      toast.error("Failed to submit registration. Check connection.");
    } finally {
      // 👇 NEW: keep the loading state for 0.5 second
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    if (s.getMonth() === e.getMonth()) {
      return `${s.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })}-${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const renderDescription = (event: EventData) => {
    if (!event.description) return null;
    const text = event.description;
    if (text.length > 100) {
      return (
        <p className="text-sm mt-6 text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {text.slice(0, 100)}...{" "}
          <button
            onClick={() => setSelectedEventDesc(event)}
            className="text-primary hover:underline font-medium"
          >
            Read more
          </button>
        </p>
      );
    }
    return (
      <p className="text-sm mt-6 text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {text}
      </p>
    );
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20">
        {/* EVENTS SECTION */}
        {/* ---------------------------------------------------
            UPCOMING EVENTS
        ---------------------------------------------------- */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl md:text-5xl text-center mb-16">
              Upcoming Events
            </h2>

            {loadingEvents ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-xl">
                  No upcoming events available.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8 mb-20">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col h-full bg-muted/30 p-8 rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
                  >
                    <h3 className="font-serif text-3xl mb-2">{event.title}</h3>
                    <p className="text-muted-foreground flex items-center gap-2 mb-6">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </p>

                    {event.image && (
                      <div className="relative w-full h-56 mb-8 rounded-lg overflow-hidden border border-border">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="mt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">
                            {event.opt_out_date
                              ? "Date will be disclosed soon"
                              : formatDateRange(event.start_date, event.end_date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">{event.time_schedule}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-muted-foreground mt-6 border-t pt-6">
                      <div className="flex justify-between">
                        <span>Exhibitors</span>
                        <span className="font-medium">
                          {event.exhibitors_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trade Buyers</span>
                        <span className="font-medium">
                          {event.buyers_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Countries</span>
                        <span className="font-medium">
                          {event.countries_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sectors</span>
                        <span className="font-medium">
                          {event.sectors_count}
                        </span>
                      </div>
                    </div>

                    {renderDescription(event)}

                    <div className="mt-auto pt-6">
                      <button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            event_location: event.location,
                          }));

                          document
                            .getElementById("registration-form")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition"
                      >
                        Register as Exhibitor
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ---------------------------------------------------
                PAST EVENTS SECTION
            ---------------------------------------------------- */}
            {pastEvents.length > 0 && (
              <>
                <h2 className="font-serif text-4xl md:text-5xl text-center mb-16 mt-20">
                  Past Events
                </h2>

                <div className="grid md:grid-cols-2 gap-8 opacity-90">
                  {pastEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-muted/30 p-8 rounded-lg shadow-lg hover:opacity-100 transition"
                    >
                      <h3 className="font-serif text-3xl mb-2">
                        {event.title}
                      </h3>

                      <p className="text-muted-foreground flex items-center gap-2 mb-6">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </p>

                      {event.image && (
                        <div className="relative w-full h-56 mb-8 rounded-lg overflow-hidden border border-border grayscale hover:grayscale-0 transition-all duration-500">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="mt-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-primary mt-1" />
                          <div>
                            <p className="font-medium">
                              {event.opt_out_date
                                ? "Date will be disclosed soon"
                                : formatDateRange(
                                  event.start_date,
                                  event.end_date
                                )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Past Event
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm text-muted-foreground mt-6 border-t pt-6">
                        <div className="flex justify-between">
                          <span>Exhibitors</span>
                          <span className="font-medium">
                            {event.exhibitors_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Trade Buyers</span>
                          <span className="font-medium">
                            {event.buyers_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Countries</span>
                          <span className="font-medium">
                            {event.countries_count}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sectors</span>
                          <span className="font-medium">
                            {event.sectors_count}
                          </span>
                        </div>
                      </div>

                      {renderDescription(event)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Attractions Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl mb-6">
                Exhibition Highlights
              </h2>
              <p className="text-xl text-muted-foreground italic">
                What makes IGTF the premier trade fair in India
              </p>
            </div>

            {/* I kept animations here as they are less critical than the form */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* ... (Highlights Content remains the same) ... */}
              {/* For brevity, assuming the content here is the same as your code */}
              <div className="bg-background p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                <h4 className="font-serif text-xl mb-4">Prime Location</h4>
                <p className="text-muted-foreground">
                  Strategically hosted at the region's most accessible and
                  expansive exhibition grounds, ensuring seamless connectivity
                  for all attendees...
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                <h4 className="font-serif text-xl mb-4">
                  {upcomingEvents[0]?.sectors_count || "16"} Dynamic Sectors
                </h4>
                <p className="text-muted-foreground">
                  {upcomingEvents[0]?.sectors?.length > 0
                    ? upcomingEvents[0].sectors.slice(0, 8).map(s => s.name).join(", ") + "..."
                    : "Hardware & Tools, Toys, Chemical, Electronics, Auto Parts..."}
                </p>
              </div>
              <div className="bg-background p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                <h4 className="font-serif text-xl mb-4">
                  Global Participation
                </h4>
                <p className="text-muted-foreground">
                  Drawing exhibitors and buyers from more than 40 countries,
                  offering opportunities for cross-border collaborations.
                </p>
              </div>

              <div className="bg-background p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                <h4 className="font-serif text-xl mb-4">Extensive B2B Focus</h4>
                <p className="text-muted-foreground">
                  Premier platform bringing together manufacturers, exporters,
                  distributors, and key decision-makers for meaningful business
                  connections.
                </p>
              </div>

              <div className="bg-background p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                <h4 className="font-serif text-xl mb-4">
                  Hosted Buyer Program
                </h4>
                <p className="text-muted-foreground">
                  Exclusive initiative matching exhibitors with qualified
                  buyers, ensuring focused meetings and higher conversion
                  opportunities.
                </p>
              </div>

              <div className="bg-background p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl">
                <h4 className="font-serif text-xl mb-4">
                  Networking Opportunities
                </h4>
                <p className="text-muted-foreground">
                  Platform for industry professionals to connect, collaborate,
                  and grow their business through strategic partnerships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section
          id="registration-form"
          className="py-20 px-4 bg-background scroll-mt-20"
        >
          <div className="max-w-3xl mx-auto">
            {/* FIX: Removed 'scroll-animate' from this div 
               This ensures the title is visible even if animation JS fails 
            */}
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl mb-6">
                Register as Exhibitor
              </h2>
              <p className="text-lg text-muted-foreground">
                Fill out the form below to register your company for the Indo
                Global Trade Fair
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-muted/30 p-8 rounded-lg shadow-xl space-y-6"
            >
              <div>
                <label
                  htmlFor="event_name"
                  className="block text-sm font-medium mb-2"
                >
                  Select Event <span className="text-red-500">*</span>
                </label>

                <select
                  id="event_name"
                  name="event_name"
                  value={formData.event_name}
                  onChange={(e) => {
                    const selectedTitle = e.target.value;
                    const eventObj = upcomingEvents.find(ev => ev.title === selectedTitle);
                    setFormData(prev => ({
                      ...prev,
                      event_name: selectedTitle,
                      event_location: eventObj ? eventObj.location : ""
                    }));
                  }}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border 
                 focus:border-primary focus:ring-2 focus:ring-primary/20 
                 transition-all duration-500 outline-none font-bold text-primary"
                >
                  <option value="">Choose an upcoming exhibition</option>

                  {upcomingEvents.map((ev, index) => (
                    <option key={index} value={ev.title}>
                      {ev.title} ({ev.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium mb-2"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none"
                  placeholder="Enter your company name"
                />
              </div>

              {/* ... Rest of the inputs (Company Person, Designation, etc.) ... */}
              {/* I'm including the rest of the inputs here for copy-paste ease */}

              <div>
                <label
                  htmlFor="contact_person_name"
                  className="block text-sm font-medium mb-2"
                >
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contact_person_name"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium mb-2"
                >
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none"
                  placeholder="Enter designation"
                />
              </div>

              <div>
                <label
                  htmlFor="email_address"
                  className="block text-sm font-medium mb-2"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email_address"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label
                  htmlFor="contact_number"
                  className="block text-sm font-medium mb-2"
                >
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none"
                  placeholder="Enter contact number"
                />
              </div>

              <div>
                <label
                  htmlFor="product_service"
                  className="block text-sm font-medium mb-2"
                >
                  Product/Service <span className="text-red-500">*</span>
                </label>
                <select
                  id="product_service"
                  name="product_category"
                  value={formData.product_category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none"
                >
                  <option value="">
                    {!formData.event_location
                      ? "Please select a location first"
                      : "Select your industry sector"}
                  </option>

                  {(() => {
                    const selectedEvent = events.find(ev => ev.location === formData.event_location);
                    if (selectedEvent && selectedEvent.sectors && selectedEvent.sectors.length > 0) {
                      return selectedEvent.sectors.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ));
                    }
                    return (
                      <>
                        <option value="Hardware & Tools">Hardware & Tools</option>
                        <option value="Toys">Toys</option>
                        <option value="Chemical">Chemical</option>
                        <option value="Electronics & Components">Electronics & Components</option>
                        <option value="Auto Parts">Auto Parts</option>
                        <option value="Construction Material">Construction Material</option>
                        <option value="Agriculture & Equipment's">Agriculture & Equipment's</option>
                        <option value="Plastic & Packaging">Plastic & Packaging</option>
                        <option value="Sports">Sports</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Pharma">Pharma</option>
                        <option value="Surgical Devices">Surgical Devices</option>
                        <option value="Gifting & Stationary">Gifting & Stationary</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Kitchen Wear">Kitchen Wear</option>
                        <option value="Spices">Spices</option>
                        <option value="Footwear">Footwear</option>
                        <option value="Home Décor">Home Décor</option>
                      </>
                    );
                  })()}
                </select>
                
                {(() => {
                  const selectedEvent = upcomingEvents.find(ev => ev.title === formData.event_name);
                  if (selectedEvent?.has_stall_layout && !formData.stall_number) {
                    return (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Link 
                          href={`/book-your-slot/${selectedEvent.id}?event=${encodeURIComponent(formData.event_name || "")}&location=${encodeURIComponent(formData.event_location || "")}`}
                          className="inline-flex items-center gap-2 px-1 text-primary font-bold hover:gap-4 transition-all group"
                        >
                          <span>Get Your Stall</span>
                          <span className="h-[1px] w-8 bg-primary/30 group-hover:w-12 transition-all"></span>
                          <span className="text-xl">→</span>
                        </Link>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Selection Info - Only if we have a stall number captured */}
              {formData.stall_number && (
                <div className="bg-primary/5 border border-primary/20 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase font-black text-primary/60 tracking-[0.2em] mb-1">Your Selection</p>
                    <h4 className="text-xl font-serif text-foreground">{formData.event_name || "Exhibition Booking"}</h4>
                    <p className="text-sm text-muted-foreground">{formData.event_location || "Selected Venue"}</p>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-md border border-primary/20 shadow-sm text-center">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-0.5">Stall Number</p>
                    <p className="text-2xl font-black text-primary">{formData.stall_number}</p>
                  </div>

                  {/* Hidden inputs to keep formData integrated */}
                  <input type="hidden" name="event_name" value={formData.event_name} />
                  <input type="hidden" name="stall_number" value={formData.stall_number} />
                </div>
              )}

              <div>
                <label
                  htmlFor="company_address"
                  className="block text-sm font-medium mb-2"
                >
                  Company Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="company_address"
                  name="company_address"
                  value={formData.company_address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-md bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-500 outline-none resize-none"
                  placeholder="Enter complete company address"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-8 py-4 rounded-md transition-all duration-500 font-medium text-lg ${isSubmitting
                  ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </button>
            </form>
          </div>
        </section>
      </div>

      {selectedEventDesc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 md:p-6 lg:p-8">
          <div className="bg-background w-full max-w-4xl max-h-[80vh] rounded-lg shadow-2xl p-6 md:p-8 relative overflow-y-auto border border-white/10">
            <button
              onClick={() => setSelectedEventDesc(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="font-serif text-3xl md:text-4xl mb-6 pr-8 text-foreground">{selectedEventDesc.title}</h2>

            <div className="space-y-8">
              {selectedEventDesc.sectors && selectedEventDesc.sectors.length > 0 && (
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">Focus Sectors</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 list-disc pl-5 marker:text-primary">
                    {selectedEventDesc.sectors.map((sector) => (
                      <li key={sector.id} className="text-foreground">
                        <span className="font-bold">{sector.name}</span>
                        {sector.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{sector.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedEventDesc.description && (
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-3">About Event</h3>
                  <p className="text-base md:text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {selectedEventDesc.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ChatBot />
      <Footer />
    </div>
  );
}
