"use client";

import { Search, Filter, Briefcase, IndianRupee, Globe, Mail, Phone, Calendar, User, X } from "lucide-react";
import Image from "next/image";
import { InvestorRegistration, getSourceDisplay, Event } from "@/utils/api";
import { useState } from "react";

interface InvestorsTabProps {
  investors: InvestorRegistration[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;

  stats: {
    totalInvestors: number;
    pendingInvestors: number;
    contactedInvestors: number;
    convertedInvestors: number;
    rejectedInvestors: number;
  };

  updateStatus: (id: number, status: InvestorRegistration["status"]) => void;
  isUpdating: boolean;
  loading: boolean;
  role?: string;
  events?: Event[];
  deleteInvestor?: (id: number) => void;
  updateEventDetails?: (id: number, eventName: string, eventLocation: string, extraData?: { interested_sector?: string }) => void;
  convertToExhibitor?: (investor: InvestorRegistration, stallNumber?: string) => void;
}

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

export default function InvestorsTab({
  investors,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  updateStatus,
  isUpdating,
  stats,
  loading,
  role,
  events = [],
  deleteInvestor,
  updateEventDetails,
  convertToExhibitor,
}: InvestorsTabProps) {
  const [eventModal, setEventModal] = useState<{
    isOpen: boolean;
    id: number | null;
    fullName: string;
    eventName: string;
    eventLocation: string;
    interestedSector: string;
  }>({
    isOpen: false,
    id: null,
    fullName: "",
    eventName: "",
    eventLocation: "",
    interestedSector: "",
  });

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; investor: InvestorRegistration | null }>({
    isOpen: false,
    investor: null,
  });

  const [convertModal, setConvertModal] = useState<{ isOpen: boolean; investor: InvestorRegistration | null }>({
    isOpen: false,
    investor: null,
  });

  const [stallNumberInput, setStallNumberInput] = useState("");

  const submitEventModal = () => {
    if (eventModal.id && updateEventDetails) {
      updateEventDetails(eventModal.id, eventModal.eventName, eventModal.eventLocation, {
        interested_sector: eventModal.interestedSector
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
          <p className="text-gray-500">Loading investor leads...</p>
        </div>
      </div>
    );
  }

  // --- UI Helpers ---
  const getStatusColor = (status: InvestorRegistration["status"]) => {
    switch (status) {
      case "converted":
        return "bg-green-500/10 border-green-500 text-green-700";
      case "contacted":
        return "bg-blue-500/10 border-blue-500 text-blue-700";
      case "pending":
        return "bg-yellow-500/10 border-yellow-500 text-yellow-700";
      case "rejected":
        return "bg-red-500/10 border-red-500 text-red-700";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: InvestorRegistration["status"]) => {
    switch (status) {
      case "converted":
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

  const safeList = Array.isArray(investors) ? investors : [];

  const filteredInvestors = safeList.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (v.full_name || "").toLowerCase().includes(q) ||
      (v.firm_name || "").toLowerCase().includes(q) ||
      (v.email || "").toLowerCase().includes(q) ||
      (v.phone_number || "").toLowerCase().includes(q) ||
      (v.interested_sector || "").toLowerCase().includes(q);

    const matchesFilter = filterStatus === "all" || v.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-purple-500/10 border border-purple-500 p-6 rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-700 mb-1">Total Investors</p>
          <p className="text-3xl font-bold text-purple-700">{stats.totalInvestors}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500 p-6 rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.pendingInvestors}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500 p-6 rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-1">Contacted</p>
          <p className="text-3xl font-bold text-blue-700">{stats.contactedInvestors}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500 p-6 rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-1">Converted</p>
          <p className="text-3xl font-bold text-green-700">{stats.convertedInvestors}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-red-700">{stats.rejectedInvestors}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-muted/30 p-6 rounded-lg mb-8 backdrop-blur-sm border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, firm, email or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-md bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-md bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none transition cursor-pointer min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investor List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-2xl">
            Investor Leads <span className="text-muted-foreground font-sans text-lg">({filteredInvestors.length})</span>
          </h2>
        </div>

        {filteredInvestors.map((investor) => (
          <div
            key={investor.id}
            className={`group border-2 rounded-xl p-0 overflow-hidden hover:shadow-xl transition-all duration-300 ${getStatusColor(
              investor.status
            )}`}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Main Content Area */}
              <div className="flex-1 p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    {/* Logo / Fallback */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-muted flex-shrink-0 flex items-center justify-center">
                      {investor.logo ? (
                        <Image
                          src={investor.logo}
                          alt={investor.full_name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-serif text-2xl font-semibold">
                          {investor.full_name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusBadgeColor(
                            investor.status
                          )}`}
                        >
                          {investor.status}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Registered on {new Date(investor.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="font-semibold text-primary">Source: {getSourceDisplay(investor.source_platform)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-background/80 backdrop-blur-md border border-border px-4 py-2 rounded-lg shadow-sm">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Budget</p>
                      <p className="font-bold flex items-center gap-1.5 text-primary">
                        <IndianRupee className="w-4 h-4" />
                        {investor.investment_budget}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Firm Name
                    </p>
                    <p className="font-medium">{investor.firm_name || "Self-Employed / Individual"}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Interested Sector
                    </p>
                    <p className="font-medium">{investor.interested_sector}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email Address
                    </p>
                    <p className="font-medium truncate" title={investor.email}>{investor.email}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Experience
                    </p>
                    <p className="font-medium text-sm">
                      {investor.business_experience ? `${investor.business_experience} Years` : 'N/A'}
                      {investor.companies_financed ? ` • Financed ${investor.companies_financed} Companies` : ''}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone Number
                    </p>
                    <p className="font-medium">{investor.phone_number}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Event Details
                    </p>
                    <p className="font-medium">
                      {investor.event_name || "IGTF"} {investor.event_location ? `(${investor.event_location})` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Sidebar */}
              <div className="lg:w-64 bg-background/40 border-t lg:border-t-0 lg:border-l border-border/50 p-6 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center lg:text-left">Update Status</p>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <button
                    onClick={() => updateStatus(investor.id, "pending")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${investor.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 cursor-not-allowed opacity-80"
                        : "bg-background border border-yellow-200 text-yellow-700 hover:bg-yellow-500 hover:text-white"
                      }`}
                    disabled={investor.status === "pending"}
                  >
                    Set Pending
                  </button>
                  <button
                    onClick={() => updateStatus(investor.id, "contacted")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${investor.status === "contacted"
                        ? "bg-blue-100 text-blue-700 cursor-not-allowed opacity-80"
                        : "bg-background border border-blue-200 text-blue-700 hover:bg-blue-500 hover:text-white"
                      }`}
                    disabled={investor.status === "contacted"}
                  >
                    Set Contacted
                  </button>
                  <button
                    onClick={() => updateStatus(investor.id, "converted")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${investor.status === "converted"
                        ? "bg-green-100 text-green-700 cursor-not-allowed opacity-80"
                        : "bg-background border border-green-200 text-green-700 hover:bg-green-500 hover:text-white"
                      }`}
                    disabled={investor.status === "converted"}
                  >
                    Mark Converted
                  </button>
                  <button
                    onClick={() => updateStatus(investor.id, "rejected")}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${investor.status === "rejected"
                        ? "bg-red-100 text-red-700 cursor-not-allowed opacity-80"
                        : "bg-background border border-red-200 text-red-700 hover:bg-red-500 hover:text-white"
                      }`}
                    disabled={investor.status === "rejected"}
                  >
                    Set Rejected
                  </button>

                  {role === "admin" && (
                    <div className="pt-2 border-t border-red-200 mt-2 space-y-2">
                       {investor.status === "converted" && (
                         <button
                          onClick={() => setEventModal({
                            isOpen: true,
                            id: investor.id,
                            fullName: investor.full_name,
                            interestedSector: investor.interested_sector || "",
                            eventName: investor.event_name || "",
                            eventLocation: investor.event_location || "",
                          })}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold transition-all"
                        >
                          Modify Event
                        </button>
                       )}
                       {investor.status === "converted" && (
                         <button
                          onClick={() => {
                            setStallNumberInput("");
                            setConvertModal({ isOpen: true, investor });
                          }}
                          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold transition-all"
                        >
                          Convert to Exhibitor
                        </button>
                       )}
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, investor })}
                        className="w-full px-4 py-2 rounded-md text-xs font-bold bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 transition-all uppercase tracking-wider"
                      >
                        Delete Investor
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredInvestors.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-xl border border-dashed border-border">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium">No matching investor leads found</p>
            <p className="text-muted-foreground">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>

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
                Update the event details for <span className="font-bold text-foreground">{eventModal.fullName}</span>.
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
                  <label className="block text-sm font-medium mb-1.5">Interested Sector/Category</label>
                  <select 
                    value={eventModal.interestedSector}
                    onChange={(e) => setEventModal({ ...eventModal, interestedSector: e.target.value })}
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
      {deleteModal.isOpen && deleteModal.investor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Delete Investor</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-bold text-foreground">{deleteModal.investor.full_name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, investor: null })}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (deleteInvestor) deleteInvestor(deleteModal.investor!.id);
                    setDeleteModal({ isOpen: false, investor: null });
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

      {/* Convert to Exhibitor Confirmation Modal */}
      {convertModal.isOpen && convertModal.investor && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Convert to Exhibitor</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to convert <span className="font-bold text-foreground">{convertModal.investor.full_name}</span> to an Exhibitor? This will assign them an exhibitor profile.
              </p>

              <div className="mb-6 text-left">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Floor Plan Slot / Stall (Optional)
                </label>
                <select
                  value={stallNumberInput}
                  onChange={(e) => setStallNumberInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-background outline-none transition text-sm font-semibold"
                >
                  <option value="">Select a Slot (Optional)</option>
                  {Object.entries(pavilionCategories).map(([id, name]) => (
                    <optgroup key={id} label={`${id} - ${name}`}>
                      <option value={id}>{id} (Premium Anchor)</option>
                      {Array.from({ length: 8 }, (_, i) => {
                        const stall = `${id}-S${i + 1}`;
                        return (
                          <option key={stall} value={stall}>
                            {stall} (Standard)
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setConvertModal({ isOpen: false, investor: null })}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (convertToExhibitor) convertToExhibitor(convertModal.investor!, stallNumberInput);
                    setConvertModal({ isOpen: false, investor: null });
                  }}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
                >
                  Convert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

