"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, MapPin, X } from "lucide-react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import { Event } from "@/utils/api";

/**
 * Converts "23:59" (24h) to "11:59 PM" (12h)
 */
const to12Hour = (timeStr: string) => {
  if (!timeStr) return "10:00 AM";
  if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
  
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;
  
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

/**
 * Converts "11:59 PM" (12h) to "23:59" (24h)
 */
const to24Hour = (timeStr: string) => {
  if (!timeStr) return "";
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    const parts = timeStr.trim().split(":");
    if (parts.length === 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return timeStr;
  }
  
  let [_, h, m, period] = match;
  let hours = Number(h);
  if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${m.padStart(2, "0")}`;
};

interface EventsTabProps {
  events: Event[];
  addEvent: (data: any, file: File | null) => void;
  editEvent: (data: any, file: File | null) => void;
  deleteEvent: (id: number) => void;
  loading: boolean;
}

export default function EventsTab({
  events,
  addEvent,
  editEvent,
  deleteEvent,
  loading,
}: EventsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Event | null>(null);
  const [isOptOutDate, setIsOptOutDate] = useState(false);
  const [selectedEventDesc, setSelectedEventDesc] = useState<Event | null>(null);
  const [sectorsCount, setSectorsCount] = useState<number>(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; event: Event | null }>({
    isOpen: false,
    event: null,
  });

  // IMAGE UPLOAD & CROP STATE
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setIsOptOutDate(false);
    setImageFile(null);
    setImageSrc(null);
    setSectorsCount(0);
  };

  if (loading) {
    return (
      <div className="py-40 flex justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  // ---------- Helper to mass-normalize numbers that might be "400+" strings etc.
  const normalizeNumberLike = (val: any) => {
    if (val == null) return val;
    const asStr = String(val).trim();
    // If numeric-ish, return number; else return original string
    const digits = asStr.replace(/[^\d]/g, "");
    if (digits.length > 0 && digits.length <= 7 && /^\d+$/.test(digits)) {
      // if original contained non-digit characters, keep original (e.g. "400+")
      if (/\D/.test(asStr)) return asStr;
      return Number(digits);
    }
    return asStr;
  };

  // Build payload from form element (robust)
  // Replace existing buildPayloadFromForm with this
  const buildPayloadFromForm = (formEl: HTMLFormElement) => {
    const fd = new FormData(formEl);

    // Read the 'is_past' checkbox specifically (your form uses name="is_past")
    const isPastRaw = fd.get("is_past");
    // When checkbox is unchecked, FormData.get returns null. When checked, it returns "on" by default.
    const is_past =
      isPastRaw === null
        ? false
        : String(isPastRaw) === "true" || String(isPastRaw) === "on";

    const optOutDateRaw = fd.get("opt_out_date");
    const opt_out_date =
      optOutDateRaw === null
        ? false
        : String(optOutDateRaw) === "true" || String(optOutDateRaw) === "on";

    const hasStallLayoutRaw = fd.get("has_stall_layout");
    const has_stall_layout =
      hasStallLayoutRaw === null
        ? false
        : String(hasStallLayoutRaw) === "true" || String(hasStallLayoutRaw) === "on";

    // ensure numeric-ish fields become numbers when possible (or null)
    const toNumberOrNull = (v: FormDataEntryValue | null) => {
      if (v == null) return null;
      const s = String(v).trim();
      // allow plain numbers only
      if (/^\d+$/.test(s)) return Number(s);
      return s; // keep "400+" style if user typed that intentionally
    };

    const payload: any = {
      // these are the *form-shaped* keys your useEvents hook expects:
      title: String(fd.get("title") || "").trim(),
      location: String(fd.get("location") || "").trim(),
      // include venue (important for PUT/validation) — add a field in the form later if needed
      venue: String(fd.get("venue") || "").trim(),
      start_date: opt_out_date ? "2099-12-31" : String(fd.get("start_date") || "").trim(),
      end_date: opt_out_date ? "2099-12-31" : String(fd.get("end_date") || "").trim(),
      // hook expects `time` (it maps to time_schedule later)
      time: opt_out_date 
        ? "To be announced" 
        : `${to12Hour(String(fd.get("start_time") || "00:00"))} - ${to12Hour(String(fd.get("end_time") || "00:00"))}`,

      exhibitors: toNumberOrNull(fd.get("exhibitors")),
      buyers: toNumberOrNull(fd.get("buyers")),
      countries: toNumberOrNull(fd.get("countries")),
      sectors_count: toNumberOrNull(fd.get("sectors_count")),

      description: String(fd.get("description") || "").trim(),

      // Collect focus sectors
      focus_sectors: Array.from({ length: sectorsCount }).map((_, i) =>
        String(fd.get(`sector_name_${i}`) || "").trim()
      ).filter(n => n !== ""),

      // high-level boolean the hook expects
      is_past,
      opt_out_date,
      has_stall_layout,
    };

    return payload;
  };

  const renderDescription = (event: Event) => {
    if (!event.description) return null;
    const text = event.description;
    if (text.length > 100) {
      return (
        <p className="text-sm mt-4 text-muted-foreground whitespace-pre-wrap leading-relaxed">
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
      <p className="text-sm mt-4 text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {text}
      </p>
    );
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-serif text-3xl">Manage Events ({events.length})</h2>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsOptOutDate(false);
            setSectorsCount(0);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      {/* EVENTS GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-muted/30 p-6 rounded-lg shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-serif text-2xl mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingItem(event);
                    setIsOptOutDate(event.opt_out_date);
                    setSectorsCount(event.sectors?.length || 0);
                    setShowModal(true);
                  }}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDeleteModal({ isOpen: true, event })}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {event.image && (
              <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden border border-border">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3 mb-4 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  {event.opt_out_date ? (
                    "Date will be disclosed soon"
                  ) : (
                    <>
                      {new Date(event.start_date).toLocaleDateString()} —{" "}
                      {new Date(event.end_date).toLocaleDateString()}
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{event.time}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
              <p>
                <b>Exhibitors:</b> {event.exhibitors}
              </p>
              <p>
                <b>Buyers:</b> {event.buyers}
              </p>
              <p>
                <b>Countries:</b> {event.countries}
              </p>
              <p>
                <b>Sectors:</b> {event.sectors_count}
              </p>
            </div>

            {renderDescription(event)}

            <span
              className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-medium ${event.is_active
                ? "bg-green-500 text-white"
                : "bg-gray-600 text-white"
                }`}
            >
              {event.is_active ? "UPCOMING" : "PAST EVENT"}
            </span>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-background">
              <h2 className="font-serif text-2xl">
                {editingItem ? "Edit Event" : "Add Event"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-muted rounded-md transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formEl = e.currentTarget as HTMLFormElement;
                const payload = buildPayloadFromForm(formEl);

                // Debug logs — open browser console to see these

                // Call the hook functions with a clean, deterministic payload
                if (editingItem) {
                  // include id for clarity (the hook will use editingItem.id)
                  editEvent({ ...payload, id: editingItem.id, image: editingItem.image }, imageFile);
                } else {
                  addEvent(payload, imageFile);
                }

                closeModal();
              }}
              className="p-6 space-y-4"
            >
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingItem?.title || ""}
                  required
                  className="w-full px-4 py-2 rounded-md bg-background border border-border"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Banner (16:9)
                </label>

                <div className="flex items-center border border-border rounded-md overflow-hidden mb-3">
                  <label className="bg-primary text-white px-4 py-2 cursor-pointer hover:bg-primary/90 transition text-sm font-medium">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setImageSrc(URL.createObjectURL(file));
                        setShowCropper(true);
                      }}
                    />
                  </label>
                  <div className="flex-1 bg-muted/20 px-4 py-2 text-sm text-muted-foreground truncate">
                    {imageFile ? imageFile.name : (editingItem?.image ? "Current image kept" : "No file chosen")}
                  </div>
                </div>

                {/* Cropper Modal (Nested for simplicity) */}
                {showCropper && imageSrc && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
                    <div className="bg-background p-6 rounded-lg shadow-2xl max-w-xl w-full">
                      <h3 className="text-xl font-serif mb-4">Crop Banner (16:9)</h3>
                      <div className="relative w-full h-[300px] bg-black rounded-md overflow-hidden">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={16 / 9}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(_, area) => setCroppedAreaPixels(area)}
                        />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCropper(false);
                            setImageSrc(null);
                          }}
                          className="px-4 py-2 border rounded-md hover:bg-muted transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
                            setImageFile(cropped);
                            setShowCropper(false);
                            setImageSrc(null);
                          }}
                          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  defaultValue={editingItem?.location || ""}
                  required
                  className="w-full px-4 py-2 rounded-md bg-background border border-border"
                />
              </div>

              {/* Opt out date */}
              <label className="flex items-center gap-2 mt-4 mb-2">
                <input
                  type="checkbox"
                  name="opt_out_date"
                  checked={isOptOutDate}
                  onChange={(e) => setIsOptOutDate(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium">Opt out date (Date will be disclosed soon)</span>
              </label>

              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="has_stall_layout"
                  defaultChecked={editingItem?.has_stall_layout || false}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium">Enable Stall Layout & Booking</span>
              </label>

              {/* Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={editingItem?.start_date || ""}
                    disabled={isOptOutDate}
                    required={!isOptOutDate}
                    className={`w-full px-4 py-2 rounded-md bg-background border border-border ${isOptOutDate ? "opacity-50 bg-muted cursor-not-allowed" : ""
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingItem?.end_date || ""}
                    disabled={isOptOutDate}
                    required={!isOptOutDate}
                    className={`w-full px-4 py-2 rounded-md bg-background border border-border ${isOptOutDate ? "opacity-50 bg-muted cursor-not-allowed" : ""
                      }`}
                  />
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    defaultValue={to24Hour(editingItem?.time?.split(" - ")[0] || "10:00")}
                    disabled={isOptOutDate}
                    required={!isOptOutDate}
                    className={`w-full px-4 py-2 rounded-md bg-background border border-border ${isOptOutDate ? "opacity-50 bg-muted cursor-not-allowed" : ""
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    defaultValue={to24Hour(editingItem?.time?.split(" - ")[1] || "19:00")}
                    disabled={isOptOutDate}
                    required={!isOptOutDate}
                    className={`w-full px-4 py-2 rounded-md bg-background border border-border ${isOptOutDate ? "opacity-50 bg-muted cursor-not-allowed" : ""
                      }`}
                  />
                </div>
              </div>

              {/* Numbers */}
              <div className="grid md:grid-cols-2 gap-4">
                <InputField
                  label="Exhibitors"
                  name="exhibitors"
                  defaultValue={editingItem?.exhibitors}
                />
                <InputField
                  label="Buyers"
                  name="buyers"
                  defaultValue={editingItem?.buyers}
                />
                <InputField
                  label="Countries"
                  name="countries"
                  defaultValue={editingItem?.countries}
                />
                <div>
                  <label className="block text-sm font-medium mb-2">Sectors (Count)</label>
                  <input
                    type="number"
                    name="sectors_count"
                    defaultValue={editingItem?.sectors_count}
                    onChange={(e) => setSectorsCount(Number(e.target.value) || 0)}
                    required
                    className="w-full px-4 py-2 rounded-md bg-background border border-border"
                  />
                </div>
              </div>

              {/* Dynamic Sector Names */}
              {sectorsCount > 0 && (
                <div className="bg-muted/20 p-4 rounded-lg border border-dashed border-border">
                  <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    Enter Focus Sector Names
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: sectorsCount }).map((_, i) => (
                      <div key={i}>
                        <input
                          type="text"
                          name={`sector_name_${i}`}
                          placeholder={`Sector ${i + 1} Name`}
                          defaultValue={editingItem?.sectors?.[i]?.name || ""}
                          required
                          className="w-full px-4 py-2 rounded-md bg-background border border-border text-sm focus:border-primary transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingItem?.description || ""}
                  rows={3}
                  required
                  className="w-full px-4 py-2 rounded-md bg-background border border-border resize-none"
                />
              </div>

              {/* Past Event Checkbox — we still include hidden/checkbox but payload builder is authoritative */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  name="is_past"
                  defaultChecked={editingItem ? !editingItem.is_active : false}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-sm border-t border-transparent">Mark as Past Event</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 rounded-md border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* READ MORE MODAL */}
      {selectedEventDesc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 md:p-6 lg:p-8">
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
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-background border border-border w-full max-w-sm rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">Delete Event</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete <span className="font-bold text-foreground">{deleteModal.event.title}</span>? All registrations associated with this event will be affected.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, event: null })}
                  className="flex-1 px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-semibold transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    deleteEvent(deleteModal.event!.id);
                    setDeleteModal({ isOpen: false, event: null });
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

/* Small helper component inside file */
function InputField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | readonly string[] | undefined;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue as any}
        required
        className="w-full px-4 py-2 rounded-md bg-background border border-border"
      />
    </div>
  );
}
