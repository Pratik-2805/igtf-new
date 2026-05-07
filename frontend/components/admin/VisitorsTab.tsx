"use client";

import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { VisitorRegistration, getSourceDisplay, Event } from "@/utils/api";

interface VisitorsTabProps {
  visitors: VisitorRegistration[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;

  stats: {
    totalVisitors: number;
    paidVisitors: number;
    contactedVisitors: number;
    pendingVisitors: number;
    rejectedVisitors: number;
  };

  updateStatus: (id: number, status: VisitorRegistration["status"]) => void;
  deleteVisitor?: (id: number) => void;
  convertVisitor?: (id: number, stallNumber: string) => void;
  role?: string;
  isUpdating: boolean;
  loading: boolean;
  events?: Event[];
  updateEventDetails?: (id: number, eventName: string, eventLocation: string) => void;
}

export default function VisitorsTab({
  visitors,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  updateStatus,
  deleteVisitor,
  convertVisitor,
  role,
  isUpdating,
  stats,
  loading,
  events = [],
  updateEventDetails,
}: VisitorsTabProps) {
  const [convertModal, setConvertModal] = useState<{
    isOpen: boolean;
    visitorId: number | null;
    visitorName: string;
    stallNumber: string;
  }>({
    isOpen: false,
    visitorId: null,
    visitorName: "",
    stallNumber: "",
  });

  const [eventModal, setEventModal] = useState<{
    isOpen: boolean;
    id: number | null;
    visitorName: string;
    eventName: string;
    eventLocation: string;
  }>({
    isOpen: false,
    id: null,
    visitorName: "",
    eventName: "",
    eventLocation: "",
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; visitor: VisitorRegistration | null }>({
    isOpen: false,
    visitor: null,
  });

  const handleOpenConvertModal = (id: number, name: string) => {
    setConvertModal({
      isOpen: true,
      visitorId: id,
      visitorName: name,
      stallNumber: "",
    });
  };

  const submitConvertModal = () => {
    if (convertModal.visitorId && convertVisitor) {
      convertVisitor(convertModal.visitorId, convertModal.stallNumber);
    }
    setConvertModal({ ...convertModal, isOpen: false });
  };

  const submitEventModal = () => {
    if (eventModal.id && updateEventDetails) {
      updateEventDetails(eventModal.id, eventModal.eventName, eventModal.eventLocation);
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
          <p className="text-gray-500">Loading visitors...</p>
        </div>
      </div>
    );
  }

  // --- UI Helpers ---
  const getStatusColor = (status: VisitorRegistration["status"]) => {
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

  const getStatusBadgeColor = (status: VisitorRegistration["status"]) => {
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

  const safeList = Array.isArray(visitors) ? visitors : [];

  const filteredVisitors = safeList.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.first_name.toLowerCase().includes(q) ||
      v.last_name.toLowerCase().includes(q) ||
      v.company_name.toLowerCase().includes(q) ||
      v.email_address.toLowerCase().includes(q) ||
      v.phone_number.toLowerCase().includes(q) ||
      v.industry_interest.toLowerCase().includes(q) ||
      (v.franchisor_interest || "").toLowerCase().includes(q)
    );
  });

  const getEventName = (v: VisitorRegistration) => {
    if (v.event_name && v.event_name !== "IGTF") return v.event_name;
    const matched = (events || []).find(
      (e) => e.location && e.location.toLowerCase() === (v.event_location || "").toLowerCase()
    );
    return matched ? matched.title : (v.event_name || "IGTF");
  };

  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-purple-500/10 border border-purple-500 p-6 rounded-lg">
          <p className="text-sm text-purple-700 mb-1">Total Visitors</p>
          <p className="text-3xl font-bold text-purple-700">
            {stats.totalVisitors}
          </p>
        </div>
        <div className="bg-green-500/10 border border-green-500 p-6 rounded-lg">
          <p className="text-sm text-green-700 mb-1">Paid</p>
          <p className="text-3xl font-bold text-green-700">
            {stats.paidVisitors}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500 p-6 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Contacted</p>
          <p className="text-3xl font-bold text-blue-700">
            {stats.contactedVisitors}
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500 p-6 rounded-lg">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">
            {stats.pendingVisitors}
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg">
          <p className="text-sm text-red-700 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-700">
            {stats.rejectedVisitors}
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
              placeholder="Search Visitors..."
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

      {/* visitor List */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl mb-4">
          visitor Registrations ({filteredVisitors.length})
        </h2>

        {filteredVisitors.map((visitor) => (
          <div
            key={visitor.id}
            className={`border-2 rounded-lg p-6 hover:shadow-lg transition ${getStatusColor(
              visitor.status
            )}`}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              {/* Left Section */}
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-serif text-xl">
                      {visitor.first_name} {visitor.last_name}
                    </h3>

                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>Registered on {new Date(visitor.created_at).toLocaleDateString()}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="font-semibold text-primary">Source: {getSourceDisplay(visitor.source_platform)}</span>
                      {visitor.api_source && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border"></span>
                          <span className="font-semibold text-primary">API: {getSourceDisplay(visitor.api_source)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-0 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                      visitor.status
                    )}`}
                  >
                    {visitor.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{visitor.company_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Industry</p>
                    <p className="font-medium">{visitor.industry_interest}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{visitor.email_address}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{visitor.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Event Details
                    </p>
                    <p className="font-medium">
                      {getEventName(visitor)} {visitor.event_location ? `(${visitor.event_location})` : ""}
                    </p>
                  </div>
                  {visitor.investment_budget && (
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-medium">{visitor.investment_budget}</p>
                    </div>
                  )}
                  {visitor.business_experience && (
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{visitor.business_experience}</p>
                    </div>
                  )}

                  {visitor.franchisor_interest && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground font-semibold text-primary mb-1">Interested Brands</p>
                      <div className="flex flex-wrap gap-2">
                        {visitor.franchisor_interest.split(',').map((brand, i) => (
                          <span key={i} className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-bold uppercase tracking-wider">
                            {brand.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Actions */}
              <div className="lg:w-48">
                <p className="text-sm font-medium mb-3">Update Status</p>
                <div className="space-y-2">
                  <button
                    onClick={() => updateStatus(visitor.id, "pending")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${visitor.status === "pending"
                        ? "bg-yellow-600 text-white cursor-not-allowed"
                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                      }`}
                    disabled={visitor.status === "pending"}
                  >
                    {visitor.status === "pending"
                      ? "Currently Pending"
                      : "Mark Pending"}
                  </button>
                  <button
                    onClick={() => updateStatus(visitor.id, "contacted")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${visitor.status === "contacted"
                        ? "bg-blue-600 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    disabled={visitor.status === "contacted"}
                  >
                    {visitor.status === "contacted"
                      ? "Currently Contacted"
                      : "Mark Contacted"}
                  </button>
                  <button
                    onClick={() => updateStatus(visitor.id, "paid")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${visitor.status === "paid"
                        ? "bg-green-600 text-white cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    disabled={visitor.status === "paid"}
                  >
                    {visitor.status === "paid" ? "Currently Paid" : "Mark Paid"}
                  </button>
                  <button
                    onClick={() => updateStatus(visitor.id, "rejected")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium ${visitor.status === "rejected"
                        ? "bg-red-600 text-white cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    disabled={visitor.status === "rejected"}
                  >
                    {visitor.status === "rejected"
                      ? "Currently Rejected"
                      : "Mark Rejected"}
                  </button>

                  {role === "admin" && (
                    <div className="pt-2 border-t border-red-200 space-y-2">
                      <button
                        onClick={() => {
                          const name = `${visitor.first_name} ${visitor.last_name}`.trim();
                          handleOpenConvertModal(visitor.id, name);
                        }}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Convert to Exhibitor
                      </button>
                      {visitor.status === "contacted" && (
                        <button
                          onClick={() => setEventModal({
                            isOpen: true,
                            id: visitor.id,
                            visitorName: `${visitor.first_name} ${visitor.last_name}`,
                            eventName: visitor.event_name || "",
                            eventLocation: visitor.event_location || "",
                          })}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          Modify Event
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, visitor })}
                        className="w-full px-4 py-2 rounded-md text-sm font-bold bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 transition-colors uppercase tracking-wider"
                      >
                        Delete Visitor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredVisitors.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            No matching Visitors found.
          </div>
        )}
      </div>

      {convertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-md rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setConvertModal({ ...convertModal, isOpen: false })}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="font-serif text-2xl font-semibold mb-2">Convert to Exhibitor</h3>
              <p className="text-sm text-muted-foreground mb-6">
                You are about to convert <span className="font-bold text-foreground">{convertModal.visitorName}</span> into an Exhibitor. You can optionally assign a stall number below.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stall Number (Optional)</label>
                  <input 
                    type="text" 
                    value={convertModal.stallNumber}
                    onChange={(e) => setConvertModal({ ...convertModal, stallNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-muted/50 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    placeholder="e.g. A-12"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setConvertModal({ ...convertModal, isOpen: false })}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-medium transition-colors border border-border"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitConvertModal}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors shadow-sm"
                  >
                    Confirm Conversion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {eventModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
                Update the event details for <span className="font-bold text-foreground">{eventModal.visitorName}</span>.
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
      {deleteModal.isOpen && deleteModal.visitor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Delete Visitor</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-bold text-foreground">{deleteModal.visitor.first_name} {deleteModal.visitor.last_name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, visitor: null })}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteVisitor) deleteVisitor(deleteModal.visitor!.id);
                    setDeleteModal({ isOpen: false, visitor: null });
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
