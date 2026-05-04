"use client";

import { useState } from "react";
import { Search, Filter, Building2, X } from "lucide-react";
import Image from "next/image";
import { ExhibitorRegistration, getSourceDisplay, Event } from "@/utils/api";

interface ExhibitorsTabProps {
  exhibitors: ExhibitorRegistration[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;

  stats: {
    totalExhibitors: number;
    paidExhibitors: number;
    contactedExhibitors: number;
    pendingExhibitors: number;
    rejectedExhibitors: number;
  };

  updateStatus: (
    id: number,
    newStatus: ExhibitorRegistration["status"]
  ) => void;
  deleteExhibitor?: (id: number) => void;
  updateStallNumber?: (id: number, stallNumber: string) => void;
  role?: string;
  isUpdating: boolean;
  loading: boolean;
  events?: Event[];
  updateEventDetails?: (id: number, eventName: string, eventLocation: string, extraData?: { product_category?: string }) => void;
  occupiedStalls?: string[];
}

// Sector to Pavilion mapping (matching book-your-slot page)
const pavilionCategories: Record<string, string> = {
  A1: "Education & Training",
  A2: "Business Services",
  A3: "Automobile & EV",
  A4: "Kids & Entertainment",
  A5: "Food & QSR",
  A6: "Home Services & Real Estate Allied",
  A7: "Ecosystem/ Support Services",
  A8: "Health, Fitness & Wellness",
  A9: "Finance & Banking",
  A10: "Global Pavilion",
  A11: "Hospitality & Stay",
  A12: "Retail & Lifestyle",
};

export default function ExhibitorsTab({
  exhibitors,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  stats,
  updateStatus,
  deleteExhibitor,
  updateStallNumber,
  role,
  isUpdating,
  loading,
  events = [],
  updateEventDetails,
  occupiedStalls = [],
}: ExhibitorsTabProps) {
  const [stallModal, setStallModal] = useState<{
    isOpen: boolean;
    exhibitorId: number | null;
    companyName: string;
    productCategory: string;
    stallNumber: string;
  }>({
    isOpen: false,
    exhibitorId: null,
    companyName: "",
    productCategory: "",
    stallNumber: "",
  });
  
  const [eventModal, setEventModal] = useState<{
    isOpen: boolean;
    id: number | null;
    companyName: string;
    eventName: string;
    eventLocation: string;
    productCategory: string;
  }>({
    isOpen: false,
    id: null,
    companyName: "",
    eventName: "",
    eventLocation: "",
    productCategory: "",
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; exhibitor: ExhibitorRegistration | null }>({
    isOpen: false,
    exhibitor: null,
  });

  const handleOpenStallModal = (id: number, name: string, category: string, currentStall: string) => {
    setStallModal({
      isOpen: true,
      exhibitorId: id,
      companyName: name,
      productCategory: category || "",
      stallNumber: currentStall || "",
    });
  };

  const submitStallModal = () => {
    if (stallModal.exhibitorId && updateStallNumber) {
      updateStallNumber(stallModal.exhibitorId, stallModal.stallNumber);
    }
    setStallModal({ ...stallModal, isOpen: false });
  };

  const submitEventModal = () => {
    if (eventModal.id && updateEventDetails) {
      updateEventDetails(eventModal.id, eventModal.eventName, eventModal.eventLocation, {
        product_category: eventModal.productCategory
      });
    }
    setEventModal({ ...eventModal, isOpen: false });
  };

  if (isUpdating) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-40 flex justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading exhibitors...</p>
        </div>
      </div>
    );
  }

  // --- UI Helpers ---
  const getStatusColor = (status: ExhibitorRegistration["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 border-green-500 text-green-700";
      case "contacted":
        return "bg-blue-500/10 border-blue-500 text-blue-700";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500 text-yellow-700";
      case "rejected":
        return "bg-red-500/10 border-red-500 text-red-700";
      default:
        return "bg-muted border-border";
    }
  };

  const getStatusBadgeColor = (status: ExhibitorRegistration["status"]) => {
    switch (status) {
      case "paid":
        return "bg-green-500 text-white";
      case "contacted":
        return "bg-blue-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  // SAFETY → exhibitors may be undefined on first render
  const safeList: ExhibitorRegistration[] = Array.isArray(exhibitors)
    ? exhibitors
    : [];

  const filteredExhibitors = safeList.filter((exhibitor) => {
    const q = searchQuery.toLowerCase();

    const matches =
      exhibitor.company_name.toLowerCase().includes(q) ||
      exhibitor.contact_person_name.toLowerCase().includes(q) ||
      exhibitor.email_address.toLowerCase().includes(q) ||
      exhibitor.product_category.toLowerCase().includes(q) ||
      (exhibitor.stall_number || "").toLowerCase().includes(q);

    const statusMatch =
      filterStatus === "all" || exhibitor.status === filterStatus;

    return matches && statusMatch;
  });

  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-purple-500/10 border border-purple-500 p-6 rounded-lg">
          <p className="text-sm text-purple-700 mb-1">Total Exhibitors</p>
          <p className="text-3xl font-bold text-purple-700">
            {stats.totalExhibitors}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500 p-6 rounded-lg">
          <p className="text-sm text-green-700 mb-1">Paid</p>
          <p className="text-3xl font-bold text-green-700">
            {stats.paidExhibitors}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500 p-6 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Contacted</p>
          <p className="text-3xl font-bold text-blue-700">
            {stats.contactedExhibitors}
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500 p-6 rounded-lg">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">
            {stats.pendingExhibitors}
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg">
          <p className="text-sm text-red-700 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-700">
            {stats.rejectedExhibitors}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-muted/30 p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exhibitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-md bg-background border border-border focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-md bg-background border border-border focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="contacted">Contacted</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exhibitor List */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl mb-4">
          Exhibitor Registrations ({filteredExhibitors.length})
        </h2>

        {filteredExhibitors.map((exhibitor) => (
          <div
            key={exhibitor.id}
            className={`border-2 rounded-lg p-6 hover:shadow-lg transition ${getStatusColor(
              exhibitor.status
            )}`}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Left Section */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {/* Logo / Fallback Icon */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 flex items-center justify-center">
                      {exhibitor.logo ? (
                        <Image
                          src={exhibitor.logo}
                          alt={exhibitor.company_name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl">
                        {exhibitor.company_name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
                        <span>Registered on {new Date(exhibitor.created_at).toLocaleDateString()}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="font-semibold text-primary">Source: {getSourceDisplay(exhibitor.source_platform)}</span>
                        {exhibitor.api_source && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border"></span>
                            <span className="font-semibold text-primary">API: {getSourceDisplay(exhibitor.api_source)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                      exhibitor.status
                    )}`}
                  >
                    {exhibitor.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contact Person
                    </p>
                    <p className="font-medium">
                      {exhibitor.contact_person_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{exhibitor.email_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Contact Number
                    </p>
                    <p className="font-medium">{exhibitor.contact_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Product/Service
                    </p>
                    <p className="font-medium">{exhibitor.product_category}</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded border border-primary/10">
                    <p className="text-xs text-primary uppercase font-black tracking-widest mb-1">
                      Booked Stall
                    </p>
                    <p className="text-lg font-black text-primary">
                      {exhibitor.stall_number || "NA"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Designation
                    </p>
                    <p className="font-medium">{exhibitor.designation}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Event Details
                    </p>
                    <p className="font-medium">
                      {exhibitor.event_name || "IGTF"} {exhibitor.event_location ? `(${exhibitor.event_location})` : ""}
                    </p>
                  </div>
                  {exhibitor.industry && (
                    <div>
                      <p className="text-sm text-muted-foreground">Industry</p>
                      <p className="font-medium">{exhibitor.industry}</p>
                    </div>
                  )}
                  {exhibitor.investment_required && (
                    <div>
                      <p className="text-sm text-muted-foreground">Investment Required</p>
                      <p className="font-medium text-primary font-bold">{exhibitor.investment_required}</p>
                    </div>
                  )}
                  {exhibitor.roi && (
                    <div>
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="font-medium text-green-600 font-bold">{exhibitor.roi}</p>
                    </div>
                  )}
                  {exhibitor.units_operating !== undefined && exhibitor.units_operating !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Units Operating</p>
                      <p className="font-medium">{exhibitor.units_operating}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="lg:w-48">
                <p className="text-sm font-medium mb-3">Update Status</p>
                <div className="space-y-2">
                  <button
                    onClick={() => updateStatus(exhibitor.id, "pending")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${exhibitor.status === "pending"
                        ? "bg-yellow-600 text-white cursor-not-allowed"
                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }`}
                    disabled={exhibitor.status === "pending"}
                  >
                    {exhibitor.status === "pending"
                      ? "Currently Pending"
                      : "Mark Pending"}
                  </button>
                  <button
                    onClick={() => updateStatus(exhibitor.id, "contacted")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${exhibitor.status === "contacted"
                        ? "bg-blue-600 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    disabled={exhibitor.status === "contacted"}
                  >
                    {exhibitor.status === "contacted"
                      ? "Currently Contacted"
                      : "Mark Contacted"}
                  </button>
                  <button
                    onClick={() => updateStatus(exhibitor.id, "paid")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${exhibitor.status === "paid"
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    disabled={exhibitor.status === "paid"}
                  >
                    {exhibitor.status === "paid"
                      ? "Currently Paid"
                      : "Mark Paid"}
                  </button>
                  <button
                    onClick={() => updateStatus(exhibitor.id, "rejected")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${exhibitor.status === "rejected"
                        ? "bg-red-600 text-white cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    disabled={exhibitor.status === "rejected"}
                  >
                    {exhibitor.status === "rejected"
                      ? "Currently Rejected"
                      : "Mark Rejected"}
                  </button>

                  {role === "admin" && (
                    <div className="pt-2 border-t border-red-200 space-y-2">
                       {(() => {
                         const associatedEvent = events.find(ev => ev.title === exhibitor.event_name);
                         if (associatedEvent?.has_stall_layout && exhibitor.status === "contacted") {
                           return (
                             <button
                               onClick={() => {
                                 if (!exhibitor.product_category) {
                                   alert("Please add a sector/category first by using the 'Modify Event' button below.");
                                   return;
                                 }
                                 handleOpenStallModal(exhibitor.id, exhibitor.company_name, exhibitor.product_category, exhibitor.stall_number || "");
                               }}
                               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                             >
                               Assign Stall No.
                             </button>
                           );
                         }
                          return null;
                       })()}
                       {exhibitor.status === "contacted" && (
                         <button
                          onClick={() => setEventModal({
                            isOpen: true,
                            id: exhibitor.id,
                            companyName: exhibitor.company_name,
                             productCategory: exhibitor.product_category || "",
                            eventName: exhibitor.event_name || "",
                            eventLocation: exhibitor.event_location || "",
                          })}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Modify Event
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, exhibitor })}
                        className="w-full px-4 py-2 rounded-md text-sm font-bold bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 transition-colors uppercase tracking-wider"
                      >
                        Delete Exhibitor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredExhibitors.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No matching exhibitors found.
          </div>
        )}
      </div>

      {stallModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-md rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setStallModal({ ...stallModal, isOpen: false })}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="font-serif text-2xl font-semibold mb-2">Assign Stall</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Assign a stall number for <span className="font-bold text-foreground">{stallModal.companyName}</span>.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stall Number ({stallModal.productCategory})</label>
                  {(() => {
                    // Find pavilion from category
                    const pavilionId = Object.entries(pavilionCategories).find(([_, cat]) => cat === stallModal.productCategory)?.[0];
                    
                    if (!pavilionId) {
                      return (
                        <div className="p-3 bg-yellow-50 text-yellow-700 text-xs rounded-md border border-yellow-200">
                          This sector is not mapped to any pavilion. Please assign a stall manually in the book stalls page or contact support.
                        </div>
                      );
                    }

                    // Generate stalls (Anchor + S1-S8)
                    const stalls = [pavilionId, ...Array.from({ length: 8 }, (_, i) => `${pavilionId}-S${i + 1}`)];
                    
                    return (
                      <select 
                        value={stallModal.stallNumber}
                        onChange={(e) => setStallModal({ ...stallModal, stallNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-border bg-muted/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                      >
                        <option value="">Select a Stall</option>
                        {stalls.map(s => {
                          const isOccupied = occupiedStalls?.includes(s);
                          const isAnchor = !s.includes("-");
                          return (
                            <option key={s} value={s} disabled={isOccupied}>
                              {s} {isAnchor ? "(Premium Anchor)" : "(Standard)"} {isOccupied ? " - SOLD OUT" : ""}
                            </option>
                          );
                        })}
                      </select>
                    );
                  })()}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setStallModal({ ...stallModal, isOpen: false })}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitStallModal}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors shadow-sm"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {eventModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-500/10 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-background border border-border w-full max-w-md rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setEventModal({ ...eventModal, isOpen: false })}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="font-serif text-2xl font-semibold mb-2">Modify Event</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Update the event details for <span className="font-bold text-foreground">{eventModal.companyName}</span>.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Select Event</label>
                  <select 
                    value={eventModal.eventName}
                    onChange={(e) => {
                      const selectedEvent = events.find(ev => ev.title === e.target.value);
                      setEventModal({ 
                        ...eventModal, 
                        eventName: e.target.value,
                        eventLocation: selectedEvent ? selectedEvent.location : "" 
                      });
                    }}
                    className="w-full px-3 py-2 border border-border bg-muted/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  >
                    <option value="">Select an Event</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.title}>{ev.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Event Location</label>
                  <div className="w-full px-3 py-2 border border-border bg-muted/80 rounded-md font-medium text-muted-foreground">
                    {eventModal.eventLocation || "No location set"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Sector/Product/Service</label>
                  <select 
                    value={eventModal.productCategory}
                    onChange={(e) => setEventModal({ ...eventModal, productCategory: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-muted/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  >
                    <option value="">Select a Sector</option>
                    {events.find(ev => ev.title === eventModal.eventName)?.sectors?.map((sector) => (
                      <option key={sector.id} value={sector.name}>
                        {sector.name}
                      </option>
                    ))}
                    {!events.find(ev => ev.title === eventModal.eventName)?.sectors?.length && (
                      <option value="" disabled>No sectors defined for this event</option>
                    )}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setEventModal({ ...eventModal, isOpen: false })}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitEventModal}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.exhibitor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Delete Exhibitor</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-bold text-foreground">{deleteModal.exhibitor.company_name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, exhibitor: null })}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteExhibitor) deleteExhibitor(deleteModal.exhibitor!.id);
                    setDeleteModal({ isOpen: false, exhibitor: null });
                  }}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

