"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, Mail, Phone, Building2, Briefcase } from "lucide-react";
import { ContactInquiry } from "@/hooks/useContactInquiries";
import { getSourceDisplay } from "@/utils/api";

interface ContactInquiriesTabProps {
  inquiries: ContactInquiry[];
  loading: boolean;
  deleteInquiry: (id: number) => Promise<boolean>;
  updateStatus: (id: number, status: string) => Promise<boolean>;
}

export default function ContactInquiriesTab({
  inquiries,
  loading,
  deleteInquiry,
  updateStatus,
}: ContactInquiriesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<"all" | "franchise" | "investor">("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; inquiry: ContactInquiry | null }>({
    isOpen: false,
    inquiry: null,
  });

  if (loading) {
    return (
      <div className="py-40 flex justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  const safeList = Array.isArray(inquiries) ? inquiries : [];

  const getInquiryType = (inq: ContactInquiry) => {
    const type = (inq.inquiry_type || "").toLowerCase();
    if (type === "franchise" || type === "investor") return type;
    
    // Fallback for older data or 'general' tagged ones that are actually specific
    const msg = inq.message.toLowerCase();
    if (msg.includes("investor")) return "investor";
    if (msg.includes("franchise")) return "franchise";
    return "general";
  };

  const filteredInquiries = safeList.filter((q) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = (
      q.full_name.toLowerCase().includes(search) ||
      q.email.toLowerCase().includes(search) ||
      q.phone_number.toLowerCase().includes(search) ||
      (q.business_type || "").toLowerCase().includes(search) ||
      q.message.toLowerCase().includes(search) ||
      q.source_platform.toLowerCase().includes(search) ||
      (q.status || "").toLowerCase().includes(search) ||
      (q.target_name || "").toLowerCase().includes(search)
    );

    const type = getInquiryType(q);
    const matchesType = activeType === "all" || type === activeType;

    return matchesSearch && matchesType;
  });

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    await updateStatus(id, newStatus);
  };

  const handleDelete = (inquiry: ContactInquiry) => {
    setDeleteModal({ isOpen: true, inquiry });
  };

  const totalInquiries = safeList.length;
  const franchiseCount = safeList.filter(q => getInquiryType(q) === "franchise").length;
  const investorCount = safeList.filter(q => getInquiryType(q) === "investor").length;

  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-primary/10 border border-primary p-6 rounded-lg">
          <p className="text-sm text-primary mb-1">Total Inquiries</p>
          <p className="text-3xl font-bold text-primary">
            {totalInquiries}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <p className="text-sm text-blue-700 mb-1">Franchise Applications</p>
          <p className="text-3xl font-bold text-blue-700">
            {franchiseCount}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
          <p className="text-sm text-purple-700 mb-1">Investor Inquiries</p>
          <p className="text-3xl font-bold text-purple-700">
            {investorCount}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <p className="text-sm text-yellow-700 mb-1">Pending Tasks</p>
          <p className="text-3xl font-bold text-yellow-700">
            {safeList.filter(q => !q.status || q.status === "pending").length}
          </p>
        </div>
      </div>

      {/* Tabs & Search Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
        <div className="flex-1 w-full">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">Search Inquiries</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by name, email, brand, message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 rounded-xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
            </div>
        </div>
        
        <div className="bg-gray-100/50 p-1 rounded-xl flex gap-1 w-full md:w-auto border border-gray-200 shadow-inner">
            <button
                onClick={() => setActiveType("all")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                    activeType === "all" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
                All
            </button>
            <button
                onClick={() => setActiveType("franchise")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                    activeType === "franchise" ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Franchisors
            </button>
            <button
                onClick={() => setActiveType("investor")}
                className={`flex-1 md:flex-none px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                    activeType === "investor" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-gray-500 hover:text-gray-700"
                }`}
            >
                Investors
            </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-black text-gray-900">
                {activeType === "all" ? "All Inquiries" : activeType === "franchise" ? "Franchise Applications" : "Investor Leads"}
                <span className="ml-3 text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{filteredInquiries.length}</span>
            </h2>
        </div>

        {filteredInquiries.map((inq) => (
          <div
            key={inq.id}
            className={`border-2 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 bg-white group ${
                getInquiryType(inq) === "franchise" ? "border-blue-50/50 hover:border-blue-100" : "border-purple-50/50 hover:border-purple-100"
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between gap-10">
              {/* Left Section */}
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">
                            {inq.full_name}
                        </h3>
                        {inq.target_name && (
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                getInquiryType(inq) === "franchise" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                            }`}>
                                {inq.target_name}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground gap-2 flex-wrap">
                      <span>Submitted on {new Date(inq.created_at).toLocaleString()}</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className="font-semibold text-primary">Source: {getSourceDisplay(inq.source_platform)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div
                      className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                        inq.status === 'contacted' ? 'bg-green-100 text-green-700' :
                        inq.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-500 text-white'
                      }`}
                    >
                      {inq.status || "pending"}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                    <a href={`mailto:${inq.email}`} className="font-medium hover:text-primary transition">{inq.email}</a>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</span>
                    <a href={`tel:${inq.phone_number}`} className="font-medium hover:text-primary transition">{inq.phone_number}</a>
                  </div>

                  {inq.business_type && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> Business Type</span>
                      <span className="font-medium">{inq.business_type}</span>
                    </div>
                  )}

                  {inq.investment_capacity && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" /> Investment</span>
                      <span className="font-medium">{inq.investment_capacity}</span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Message:</p>
                  <div className="bg-muted/30 p-4 rounded-md border border-border text-sm whitespace-pre-wrap">
                    {inq.message}
                  </div>
                </div>
              </div>

              {/* Status Actions (Right Section) */}
              <div className="lg:w-48 shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
                <p className="text-sm font-medium mb-3 text-gray-700">Update Status</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleUpdateStatus(inq.id, "pending")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${
                      inq.status === "pending" || !inq.status
                        ? "bg-yellow-600 text-white cursor-not-allowed"
                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                    }`}
                    disabled={inq.status === "pending" || !inq.status}
                  >
                    {inq.status === "pending" || !inq.status
                      ? "Currently Pending"
                      : "Mark Pending"}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, "contacted")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${
                      inq.status === "contacted"
                        ? "bg-blue-600 text-white cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                    disabled={inq.status === "contacted"}
                  >
                    {inq.status === "contacted"
                      ? "Currently Contacted"
                      : "Mark Contacted"}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inq.id, "rejected")}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition ${
                      inq.status === "rejected"
                        ? "bg-red-600 text-white cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                    disabled={inq.status === "rejected"}
                  >
                    {inq.status === "rejected"
                      ? "Currently Rejected"
                      : "Mark Rejected"}
                  </button>
                  <div className="pt-2">
                    <button
                      onClick={() => handleDelete(inq)}
                      disabled={deletingId === inq.id}
                      className="w-full px-4 py-2 rounded-md text-sm font-bold text-red-600 border-2 border-red-600 hover:bg-red-50 disabled:opacity-50 transition uppercase flex items-center justify-center gap-2"
                      title="Delete Inquiry"
                    >
                      Delete Inquiry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredInquiries.length === 0 && (
          <div className="text-center text-muted-foreground py-12 bg-muted/10 rounded-lg border border-dashed border-border">
            No matching inquiries found.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.inquiry && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Delete Inquiry</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete the inquiry from <span className="font-bold text-foreground">{deleteModal.inquiry.full_name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, inquiry: null })}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    const id = deleteModal.inquiry!.id;
                    setDeletingId(id);
                    await deleteInquiry(id);
                    setDeletingId(null);
                    setDeleteModal({ isOpen: false, inquiry: null });
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
