"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChatBot } from "@/components/chat-bot";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, MapPin, Search } from "lucide-react";

type StallType = "standard" | "anchor" | "other";
type StallStatus = "available" | "occupied" | "reserved";

const StallSlot = ({
  id,
  label,
  type,
  status,
  isSelected,
  onClick,
  className = "",
}: {
  id: string;
  label: string;
  type: StallType;
  status: StallStatus;
  isSelected: boolean;
  onClick: (id: string) => void;
  className?: string;
}) => {
  const getBaseColors = () => {
    if (type === "anchor")
      return "bg-gradient-to-br from-[#FFE8CC] to-[#FDCB95] border-[#D19B5E] text-[#69421A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]"; // Elegant gradient orange
    if (type === "other")
      return "bg-gradient-to-br from-white to-slate-50 border-slate-300 text-slate-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]";
    return "bg-gradient-to-br from-[#F4F5F7] to-[#D1D5DB] border-[#9CA3AF] text-[#374151] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]"; // Sleek gradient grey
  };

  const getStatusColors = () => {
    if (status === "occupied")
      return "bg-red-200 border-red-300 text-red-700 cursor-not-allowed opacity-70";
    if (status === "reserved")
      return "bg-yellow-100 border-yellow-200 text-yellow-700 cursor-not-allowed opacity-70";
    if (isSelected)
      return "ring-2 ring-primary ring-offset-[1px] scale-[1.03] z-20 shadow-lg shadow-primary/30";
    return "hover:scale-105 hover:shadow-md hover:z-10 cursor-pointer transition-all duration-200";
  };

  return (
    <div
      onClick={() => status === "available" && onClick(id)}
      className={`relative flex items-center justify-center font-medium text-[13px] border rounded-[6px] box-border transition-all duration-200 ${getBaseColors()} ${getStatusColors()} ${className}`}
    >
      {status === "occupied" ? (
        <span className="text-[9px] font-black text-red-500/80 rotate-[-12deg] tracking-tighter uppercase border border-red-500/30 px-1 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          SOLD
        </span>
      ) : (
        label
      )}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -top-1.5 -right-1.5 bg-primary text-white p-0.5 z-20 shadow-md rounded-full shadow-primary/40 ring-2 ring-white"
        >
          <Check size={10} strokeWidth={4} />
        </motion.div>
      )}
    </div>
  );
};

const StallBlock = ({
  side,
  anchorId,
  pavilionLabel,
  selectedStall,
  onSelect,
  occupiedStalls,
}: {
  side: "left" | "right";
  anchorId: string;
  pavilionLabel: string;
  selectedStall: string | null;
  onSelect: (id: string) => void;
  occupiedStalls: string[];
}) => {
  const sTopLeft = ["S7", "S5", "S3", "S1"];
  const sBottomLeft = ["S8", "S6", "S4", "S2"];

  const sTopRight = ["S1", "S3", "S5", "S7"];
  const sBottomRight = ["S2", "S4", "S6", "S8"];

  const topRow = side === "left" ? sTopLeft : sTopRight;
  const bottomRow = side === "left" ? sBottomLeft : sBottomRight;

  return (
    <div className="relative w-full">
      {/* P-Label over the border */}
      <div
        id={`pavilion-${pavilionLabel}`}
        className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center shadow-md z-[60] font-black text-[10px] text-primary
          ${side === "left" ? "left-[-44px]" : "right-[-44px]"}`}
      >
        {pavilionLabel}
      </div>

      <div
        className={`flex w-full h-[120px] gap-[6px] p-1.5 bg-white/50 border border-slate-200/60 rounded-sm shadow-sm ${side === "right" ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* 4x2 Grid of S-stalls */}
        <div className="grid grid-cols-4 grid-rows-2 gap-[6px] w-[66%] h-full">
          {topRow.map((label) => (
            <StallSlot
              key={`${anchorId}-${label}`}
              id={`${anchorId}-${label}`}
              label={label}
              type="standard"
              status={
                occupiedStalls.includes(`${anchorId}-${label}`)
                  ? "occupied"
                  : "available"
              }
              isSelected={selectedStall === `${anchorId}-${label}`}
              onClick={onSelect}
              className="w-full h-full border hover:z-10 shadow-sm"
            />
          ))}
          {bottomRow.map((label) => (
            <StallSlot
              key={`${anchorId}-${label}`}
              id={`${anchorId}-${label}`}
              label={label}
              type="standard"
              status={
                occupiedStalls.includes(`${anchorId}-${label}`)
                  ? "occupied"
                  : "available"
              }
              isSelected={selectedStall === `${anchorId}-${label}`}
              onClick={onSelect}
              className="w-full h-full border hover:z-10 shadow-sm"
            />
          ))}
        </div>

        {/* Anchor Stall */}
        <div className="flex-1 h-full">
          <StallSlot
            id={anchorId}
            label={anchorId}
            type="anchor"
            status={
              occupiedStalls.includes(anchorId) ? "occupied" : "available"
            }
            isSelected={selectedStall === anchorId}
            onClick={onSelect}
            className="w-full h-full border shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

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

export default function BookYourSlotPage() {
  const router = useRouter();
  const [selectedStall, setSelectedStall] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [occupiedStalls, setOccupiedStalls] = useState<string[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/`,
        );
        const data = await res.json();
        const list = data?.results || data || [];
        setEvents(list.filter((e: any) => e.is_active));
      } catch (err) {
        console.error("Failed to fetch events", err);
      }
    };
    fetchEvents();

    const fetchOccupiedStalls = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/exhibitor-registrations/occupied_stalls/`,
        );
        const data = await res.json();
        setOccupiedStalls(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch occupied stalls", err);
      }
    };
    fetchOccupiedStalls();
  }, []);

  // Get the pavilion ID (e.g., A1, A2) from the stall ID (e.g., A1, A1-S1)
  const getPavilionInfo = (id: string | null) => {
    if (!id) return null;
    const pavilionId = id.split("-")[0];
    return pavilionCategories[pavilionId] || "Special Category";
  };

  const handleStallSelect = (id: string) => {
    setSelectedStall(id);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />

      <div className="pt-24 pb-12 px-2 md:px-4 font-sans text-slate-900">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-emerald-950">
              Exhibition Floor Plan
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Select your preferred exhibition booth from our interactive floor
              plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Booking Map Container */}
            <div className="lg:col-span-8 bg-white p-2 md:p-8 rounded-2xl shadow-xl border border-border/50">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6 mx-2">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-[#F4F5F7] to-[#D1D5DB] border border-[#9CA3AF] rounded-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                      Standard (3x4)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-[#FFE8CC] to-[#FDCB95] border border-[#D19B5E] rounded-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                      Anchor (6x8)
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Layout Map */}
              <div className="w-full overflow-x-auto pb-6 custom-scrollbar flex justify-center">
                <div
                  style={{
                    width: "820px",
                    minWidth: "820px",
                    height: "1700px",
                    position: "relative",
                  }}
                >
                  <div
                    className="absolute top-0 left-[80px] rounded-[12px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-slate-200"
                    style={{
                      transform: "scale(1.2)",
                      transformOrigin: "top left",
                      width: "546px",
                      height: "1380px",
                      border: "14px solid #CBD5E1",
                      backgroundColor: "#FCFAF0",
                      backgroundImage:
                        "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
                      backgroundSize: "15px 15px",
                      backgroundPosition: "center top",
                    }}
                  >
                    {/* Inner depth shadow for architectural feeling */}
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none z-[5]" />
                    <div className="pt-6 pb-0 px-0 w-full h-full flex flex-col justify-between relative">
                      {/* Upper Section */}
                      <div className="flex justify-between w-full">
                        <div className="w-[44%]">
                          <StallBlock
                            side="left"
                            anchorId="A6"
                            pavilionLabel="P6"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                        <div className="w-[44%]">
                          <StallBlock
                            side="right"
                            anchorId="A7"
                            pavilionLabel="P7"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between w-full mt-4">
                        <div className="w-[44%]">
                          <StallBlock
                            side="left"
                            anchorId="A5"
                            pavilionLabel="P5"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                        <div className="w-[44%]">
                          <StallBlock
                            side="right"
                            anchorId="A8"
                            pavilionLabel="P8"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                      </div>

                      {/* G3 / G6 LAYER */}
                      <div className="flex justify-between items-center w-full h-8 relative my-2">
                        <div className="absolute left-[-22px] w-8 h-8 bg-white border border-slate-400 flex items-center justify-center shadow-sm z-20">
                          <span className="text-[10px] text-slate-700 tracking-widest uppercase">
                            G3
                          </span>
                        </div>
                        <div className="absolute right-[-22px] w-8 h-8 bg-white border border-slate-400 flex items-center justify-center shadow-sm z-20">
                          <span className="text-[10px] text-slate-700 tracking-widest uppercase">
                            G6
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between w-full">
                        <div className="w-[44%]">
                          <StallBlock
                            side="left"
                            anchorId="A4"
                            pavilionLabel="P4"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                        <div className="w-[44%]">
                          <StallBlock
                            side="right"
                            anchorId="A9"
                            pavilionLabel="P9"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                      </div>

                      {/* CENTRAL OPEN AREA */}
                      <div className="flex justify-between w-full h-[360px] relative my-6">
                        {/* Left: Facility Management Hub */}
                        <div className="flex flex-col items-start h-full w-[38%] pt-6 pl-6">
                          <div className="h-20 w-20 bg-gradient-to-br from-[#E8F5D0] to-[#D4E7AF] border border-[#9CA883] flex flex-col items-center justify-center text-[10px] font-medium text-[#4B5E2F] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] transform transition hover:-translate-y-0.5 rounded-sm relative z-10 leading-tight">
                            <span>Meeting</span>
                            <span>Room</span>
                          </div>

                          <div className="h-48 w-24 bg-gradient-to-br from-[#FEFCE8] to-[#F7F0B0] border border-[#CAB85D] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] transform transition hover:-translate-y-0.5 ml-20 -mt-px rounded-sm relative z-0">
                            <span className="-rotate-90 text-[11px] font-medium text-[#7D7122] tracking-widest uppercase whitespace-nowrap">
                              Cafeteria
                            </span>
                          </div>

                          <div className="h-20 w-20 bg-gradient-to-br from-[#E8F5D0] to-[#D4E7AF] border border-[#9CA883] flex flex-col items-center justify-center text-[10px] font-medium text-[#4B5E2F] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] transform transition hover:-translate-y-0.5 -mt-px rounded-sm relative z-10 leading-tight">
                            <span>Meeting</span>
                            <span>Room</span>
                          </div>
                        </div>

                        {/* Right: Public Interaction Zone */}
                        <div className="flex items-center justify-end w-[55%] h-full">
                          <div className="w-full h-full bg-gradient-to-br from-[#DEF6FF] to-[#A3E1F5] border border-r-0 border-[#6FA9B9] rounded-l-[4px] flex flex-col items-center justify-center font-medium text-sm text-[#276475] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] relative pt-4 pb-4 pl-4 pr-16 transform transition hover:-translate-y-0.5">
                            <span>Seating Area</span>
                            <div className="absolute right-0 w-[25%] h-[65%] bg-gradient-to-br from-[#CCD5FF] to-[#AEB9EF] border-y border-l border-[#7C87C1] rounded-l-[4px] flex items-center justify-center font-medium text-sm text-[#3E4984] shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)]">
                              Stage
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LOWER SECTION */}
                      <div className="flex justify-between w-full mt-4">
                        <div className="w-[44%]">
                          <StallBlock
                            side="left"
                            anchorId="A3"
                            pavilionLabel="P3"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                        <div className="w-[44%]">
                          <StallBlock
                            side="right"
                            anchorId="A10"
                            pavilionLabel="P10"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between w-full mt-8">
                        <div className="w-[44%]">
                          <StallBlock
                            side="left"
                            anchorId="A2"
                            pavilionLabel="P2"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                        <div className="w-[44%]">
                          <StallBlock
                            side="right"
                            anchorId="A11"
                            pavilionLabel="P11"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between w-full mt-8">
                        <div className="w-[44%]">
                          <StallBlock
                            side="left"
                            anchorId="A1"
                            pavilionLabel="P1"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                        <div className="w-[44%]">
                          <StallBlock
                            side="right"
                            anchorId="A12"
                            pavilionLabel="P12"
                            selectedStall={selectedStall}
                            onSelect={handleStallSelect}
                            occupiedStalls={occupiedStalls}
                          />
                        </div>
                      </div>

                      {/* FINAL FLOOR LAYER - Administrative Entrance */}
                      <div className="relative w-full mt-10 mb-0 h-20 px-6">
                        {/* Side Gates G4/G7 */}
                        <div className="absolute top-1 left-[-22px] w-8 h-12 bg-white border border-slate-400 flex items-center justify-center shadow-sm z-20">
                          <span className="text-[10px] text-slate-700 tracking-widest uppercase">
                            G4
                          </span>
                        </div>
                        <div className="absolute top-1 right-[-22px] w-8 h-12 bg-white border border-slate-400 flex items-center justify-center shadow-sm z-20">
                          <span className="text-[10px] text-slate-700 tracking-widest uppercase">
                            G7
                          </span>
                        </div>

                        {/* Bottom Gates G10/G9 over the border */}
                        <div className="absolute bottom-[-22px] left-[54px] w-8 h-6 bg-white border border-slate-400 flex items-center justify-center shadow-sm z-20">
                          <span className="text-[10px] text-slate-700 tracking-widest">
                            G10
                          </span>
                        </div>
                        <div className="absolute bottom-[-22px] left-[242px] w-8 h-6 bg-white border border-slate-400 flex items-center justify-center shadow-sm z-20">
                          <span className="text-[10px] text-slate-700 tracking-widest">
                            G9
                          </span>
                        </div>

                        <div className="flex w-full h-full items-end justify-between px-2">
                          <div className="flex items-end h-full gap-4">
                            <div className="w-10 h-6"></div>{" "}
                            {/* Spacer for G10 gap */}
                            <div className="w-36 h-8 bg-[#F2B2BD] border border-[#BC6A78] flex items-center justify-center shadow-sm hover:-translate-y-0.5 transition transform text-xs text-[#702130] rounded-t-[6px]">
                              Registration Desk
                            </div>
                          </div>

                          <div className="flex items-end h-full gap-5 pb-0">
                            <div className="w-6 h-6"></div>{" "}
                            {/* Spacer for G9 gap */}
                            <div className="w-48 h-10 bg-[#EDDF63] border border-[#AD9B1B] flex items-center justify-center shadow-sm hover:-translate-y-0.5 transition transform text-xs text-[#5D5102] rounded-t-[6px]">
                              Lounge Area
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selection Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <AnimatePresence mode="wait">
                  {selectedStall ? (
                    <motion.div
                      key={selectedStall}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 40 }}
                      className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100"
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <span
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block ${!selectedStall.includes("-") ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {!selectedStall.includes("-")
                              ? "PREMIUM ANCHOR"
                              : "STANDARD BOOTH"}
                          </span>
                          <h2 className="text-4xl font-serif text-slate-900 tracking-tight leading-none">
                            {selectedStall}
                          </h2>
                          <div className="mt-3 inline-block bg-primary/5 py-1.5 px-3 rounded-lg border border-primary/10">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest block opacity-50 mb-0.5">
                              Pavilion Category
                            </span>
                            <p className="text-xs font-bold text-slate-700">
                              {getPavilionInfo(selectedStall)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`${occupiedStalls.includes(selectedStall) ? "bg-red-500 shadow-red-200" : "bg-emerald-500 shadow-emerald-200"} text-white px-4 py-2 rounded-full text-[11px] font-black shadow-lg uppercase tracking-wider`}
                        >
                          {occupiedStalls.includes(selectedStall)
                            ? "SOLD OUT"
                            : "AVAILABLE"}
                        </div>
                      </div>

                      <div className="space-y-4 mb-10">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                            <MapPin size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                              Location
                            </p>
                            <p className="text-base font-bold text-slate-700">
                              Main Exhibition Hall
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                            <Info size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                              Specifications
                            </p>
                            <p className="text-base font-bold text-slate-700">
                              {!selectedStall.includes("-")
                                ? "6m x 8m (48 sq.m)"
                                : "3m x 4m (12 sq.m)"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 text-white p-8 rounded-[2rem] mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full -translate-y-24 translate-x-24 blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
                        <div className="relative z-10">
                          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-2 leading-none">
                            Investment Amount
                          </p>
                          <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-black">
                                {!selectedStall.includes("-")
                                  ? "₹ 9,99,999"
                                  : "₹ 3,99,999"}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 font-bold tracking-widest">
                              + GST
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (
                            !selectedStall ||
                            (selectedStall &&
                              occupiedStalls.includes(selectedStall))
                          )
                            return;
                          const category = getPavilionInfo(selectedStall);
                          const activeEvent = events[0] || {
                            title: "IGTF Exhibition",
                            location: "Main Hall",
                          };

                          const params = new URLSearchParams({
                            stall: selectedStall || "",
                            category: category || "",
                            event: activeEvent.title,
                            location: activeEvent.location,
                          });

                          router.push(
                            `/exhibition?${params.toString()}#registration-form`,
                          );
                        }}
                        disabled={
                          !!(
                            selectedStall &&
                            occupiedStalls.includes(selectedStall)
                          )
                        }
                        className={`w-full ${selectedStall && occupiedStalls.includes(selectedStall) ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-primary hover:shadow-2xl hover:shadow-primary/40 active:scale-95 shadow-xl shadow-primary/20"} text-white py-5 rounded-2xl font-black text-lg transition-all transform tracking-widest uppercase`}
                      >
                        {selectedStall && occupiedStalls.includes(selectedStall)
                          ? "STALL SOLD OUT"
                          : "BOOK YOUR STALL"}
                      </button>

                      <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-3 gap-2">
                        {(!selectedStall.includes("-")
                          ? [
                              "3 SOFAS",
                              "3 CENTRAL TABLES",
                              "6 CHAIRS",
                              "15-18 LIGHTS",
                              "1 FASCIA",
                            ]
                          : [
                              "1 SOFA",
                              "1 CENTRAL TABLE",
                              "2 CHAIRS",
                              "6 LIGHTS",
                              "1 FASCIA",
                            ]
                        ).map((tag) => (
                          <div
                            key={tag}
                            className="text-[9px] font-black text-slate-500 bg-slate-50 py-2 px-2 rounded-lg text-center tracking-wider border border-slate-100 shadow-sm uppercase"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white border-2 border-slate-100 p-16 rounded-[2.5rem] text-center shadow-xl shadow-slate-200/50"
                    >
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300 ring-2 ring-slate-100 shadow-inner">
                        <Search size={36} />
                      </div>
                      <h3 className="text-xl font-serif mb-3 text-slate-900">
                        Select Your Space
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-[220px] mx-auto">
                        Explore the interactive layout above and choose an
                        available exhibition booth.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Refined Legend */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-[2px] w-6 bg-primary rounded-full"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      Hall Designation
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-6">
                    {[
                      {
                        classes:
                          "bg-gradient-to-br from-[#F4F5F7] to-[#D1D5DB]",
                        label: "Standard",
                      },
                      {
                        classes:
                          "bg-gradient-to-br from-[#FFE8CC] to-[#FDCB95]",
                        label: "Anchor",
                      },
                      {
                        classes:
                          "bg-gradient-to-br from-[#DEF6FF] to-[#A3E1F5]",
                        label: "Seating",
                      },
                      {
                        classes:
                          "bg-gradient-to-br from-[#CCD5FF] to-[#AEB9EF]",
                        label: "Stage Hub",
                      },
                      {
                        classes:
                          "bg-gradient-to-br from-[#FFFFFF] to-[#FCFAF0]",
                        label: "Main Aisle",
                      },
                      {
                        classes:
                          "bg-gradient-to-br from-[#E8F5D0] to-[#D4E7AF]",
                        label: "Facilities",
                      },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg shadow-sm border border-black/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] ${item.classes}`}
                        ></div>
                        <span className="text-xs font-black text-slate-800 tracking-tight uppercase">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pavilion Categories Table */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-[2px] w-6 bg-primary rounded-full"></div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                      Pavilion Categories
                    </h4>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              ID
                            </th>
                            <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Category Name
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {Object.entries(pavilionCategories)
                            .sort(([a], [b]) => {
                              const numA = parseInt(a.replace("A", ""));
                              const numB = parseInt(b.replace("A", ""));
                              return numA - numB;
                            })
                            .map(([key, category]) => {
                              const pId = key.replace("A", "P");
                              const isSelected =
                                selectedStall === key ||
                                selectedStall?.startsWith(`${key}-`);

                              return (
                                <tr
                                  key={key}
                                  onClick={() => {
                                    setSelectedStall(key);
                                    const element = document.getElementById(
                                      `pavilion-${pId}`,
                                    );
                                    if (element) {
                                      element.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                        inline: "center",
                                      });
                                    }
                                  }}
                                  className={`cursor-pointer transition-colors group ${isSelected ? "bg-primary/5" : "hover:bg-slate-50"}`}
                                >
                                  <td className="px-4 py-2.5">
                                    <span
                                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 text-[10px] font-black
                                    ${isSelected ? "bg-primary text-white ring-4 ring-primary/10" : "bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white"}`}
                                    >
                                      {pId}
                                    </span>
                                  </td>
                                  <td
                                    className={`px-4 py-2.5 text-[11px] font-bold tracking-tight transition-colors duration-200 ${isSelected ? "text-primary" : "text-slate-700"}`}
                                  >
                                    {category}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  );
}
