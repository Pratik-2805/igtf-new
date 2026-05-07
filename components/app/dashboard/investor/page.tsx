"use client";

import { useEffect, useState, useCallback } from "react";
import NextImage from "next/image";
import {
  RefreshCw,
  Save,
  TrendingUp,
  PieChart,
  Wallet,
  Target,
  Briefcase,
  MapPin,
  Upload,
  Camera,
  X,
} from "lucide-react";
import Cropper, { Area } from "react-easy-crop";
import { toast } from "sonner";
import { authFetch, authFetchForm } from "@/lib/authFetch";
import LoadingScreen from "@/components/loading-screen";

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/jpeg");
  });
};

// THE FIELDS THE INVESTOR MANAGES (logo removed — uploaded via sidebar only)
const INVESTOR_MANAGEABLE_FIELDS = [
  "full_name",
  "firm_name",
  "phone_number",
  "investment_budget",
  "interested_sector",
  "about",
  "business_experience",
  "companies_financed",
  "preferred_location",
];

const SECTORS = [
  "General",
  "Food & Beverage",
  "Retail",
  "Education",
  "Healthcare",
  "Technology",
  "Real Estate",
  "Finance",
  "Automotive",
  "Fashion & Apparel",
  "Fitness & Wellness",
  "Hospitality & Hotels",
  "Agriculture",
  "Logistics",
  "Beauty & Personal Care",
  "Entertainment",
  "Manufacturing",
  "E-Commerce",
  "Other",
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Pan India",
  "Overseas",
];

// Parse "X years Y months" <-> stored string
function parseExperience(val: string) {
  const yMatch = val?.match(/(\d+)\s*year/);
  const mMatch = val?.match(/(\d+)\s*month/);
  return { years: yMatch ? yMatch[1] : "0", months: mMatch ? mMatch[1] : "0" };
}
function buildExperience(years: string) {
  return `${years} year${Number(years) !== 1 ? "s" : ""}`;
}

export default function InvestorDashboard() {
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Logo Cropping State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/investor-registrations/`);
      if (res.ok) {
        const data = await res.json();
        const profileData = Array.isArray(data)
          ? data[0]
          : data.results
            ? data.results[0]
            : data;
        if (profileData) {
          const initializedProfile = { ...profileData };
          INVESTOR_MANAGEABLE_FIELDS.forEach((field) => {
            if (!(field in initializedProfile)) initializedProfile[field] = "";
          });
          setProfile(initializedProfile);
        }
      }
    } catch (err) {
      toast.error("Failed to reload your portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], "logo.jpg", { type: "image/jpeg" });
      const previewUrl = URL.createObjectURL(croppedBlob);
      setProfile((prev) => ({ ...prev, logo: previewUrl, _logo_file: file }));
      setShowCropper(false);
      setImageSrc(null);
      toast.success("Identity visual updated!");
    } catch (e) {
      toast.error("Identity secure crop failed");
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    const profileId = profile.id;
    if (!profileId) {
      toast.error("Account not synced correctly");
      setSaving(false);
      return;
    }

    try {
      const payload = new FormData();
      INVESTOR_MANAGEABLE_FIELDS.forEach((field) => {
        if (field === "logo") return;
        if (profile[field] !== null && profile[field] !== undefined) {
          payload.append(field, profile[field]);
        }
      });

      if (profile._logo_file) {
        payload.append("logo", profile._logo_file);
      }

      const res = await authFetchForm(
        `${API_URL}/api/investor-registrations/${profileId}/`,
        {
          method: "PATCH",
          body: payload,
        },
      );

      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => ({ ...prev, ...updated }));
        setIsEditing(false);
        toast.success("Capital allocation preferences updated!");
      } else {
        const errorData = await res.json();
        const errorMsg = Object.entries(errorData)
          .map(
            ([key, val]) =>
              `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
          )
          .join("\n");
        toast.error(errorMsg || "Failed to update preferences");
      }
    } catch (err) {
      toast.error("Network error during synchronization");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <RefreshCw className="animate-spin text-blue-600 mb-6" size={40} />
        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">
          Accessing Secure Vault...
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl w-full">
      {loading && <LoadingScreen />}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">
              Investor Console
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Strategize your capital across India's booming franchise sectors.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="group flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 shadow-xl rounded-2xl transition-all hover:scale-105">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Available Tier
                </p>
                <p className="text-sm font-bold text-gray-900">
                  PREMIUM INVESTOR
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Portfolio Readiness */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-500"></div>

            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <PieChart size={24} className="text-blue-600" />
              Vault Status
            </h3>

            <div className="space-y-8">
              <div className="flex flex-col items-center">
                <div className="relative group/logo w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-50 flex items-center justify-center relative shadow-xl border border-gray-100">
                    {profile.logo ? (
                      <NextImage
                        src={profile.logo}
                        alt="Firm Logo"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <TrendingUp size={40} className="text-blue-200" />
                    )}
                    <label
                      className={`absolute inset-0 bg-blue-700/80 opacity-0 ${isEditing ? "group-hover/logo:opacity-100 cursor-pointer" : "cursor-not-allowed"} transition-all flex flex-col items-center justify-center text-white gap-2`}
                    >
                      <Camera size={24} />
                      <span className="text-[10px] font-black uppercase">
                        Upload
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={!isEditing}
                      />
                    </label>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg pointer-events-none">
                    <Upload size={14} />
                  </div>
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Portfolio Readiness
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <Target size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-1">
                      Target Matching
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Your criteria align with 142 new opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-1">
                      Deal Flow
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      High activity in selected sectors (Food, Tech).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <TrendingUp size={160} />
            </div>
            <h4 className="font-black text-xl mb-2 italic">GROWTH MODE</h4>
            <p className="text-xs text-blue-300 font-medium mb-6 leading-relaxed">
              System-generated insights help allocate capital where ROI is
              highest.
            </p>
            <button
              type="button"
              onClick={fetchProfile}
              className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all"
            >
              Audit Synced Data
            </button>
          </div>
        </div>

        {/* Main Console: Configuration */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 h-20 w-40 opacity-5 pointer-events-none">
            <MapPin size={100} />
          </div>

          <div className="p-8 md:p-14">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">
              Investment Specifications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name || ""}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  disabled={!isEditing}
                  className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 font-black text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Your full name"
                />
              </div>

              {/* Firm Name */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Firm Name
                </label>
                <input
                  type="text"
                  value={profile.firm_name || ""}
                  onChange={(e) => handleChange("firm_name", e.target.value)}
                  disabled={!isEditing}
                  className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 font-black text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Your firm / company name"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone_number || ""}
                  onChange={(e) => handleChange("phone_number", e.target.value)}
                  disabled={!isEditing}
                  className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 font-black text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              {/* Interested Sector */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Interested Sector
                </label>
                <select
                  value={profile.interested_sector || ""}
                  onChange={(e) =>
                    handleChange("interested_sector", e.target.value)
                  }
                  disabled={!isEditing}
                  className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 font-black text-lg appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <option value="">Select a sector...</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Investment Budget */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Investment Budget
                </label>
                <div className="flex items-center justify-center gap-1 sm:gap-2 w-full px-4 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] focus-within:bg-white focus-within:ring-8 focus-within:ring-blue-500/5 focus-within:border-blue-600 transition-all duration-500 overflow-hidden">
                  <span className="text-gray-500 font-bold shrink-0">₹</span>
                  <input
                    type="number"
                    placeholder="10"
                    className="min-w-0 w-16 bg-transparent outline-none text-gray-900 font-black text-lg no-spinners disabled:opacity-70"
                    disabled={!isEditing}
                    onChange={(e) => {
                      const p = (
                        profile.investment_budget || "₹0 Lakh - ₹0 Lakh"
                      ).split(" - ");
                      const u = p[0]?.match(/(K|Lakh|Crore)/i)?.[0] || "Lakh";
                      handleChange(
                        "investment_budget",
                        `₹${e.target.value} ${u} - ${p[1] || "₹0 Lakh"}`,
                      );
                    }}
                    value={
                      (profile.investment_budget || "")
                        .split(" - ")[0]
                        ?.match(/₹?([\d.]+)/)?.[1] || ""
                    }
                  />
                  <select
                    className="bg-transparent outline-none text-gray-600 font-semibold appearance-none cursor-pointer px-1 shrink-0 disabled:opacity-70"
                    disabled={!isEditing}
                    onChange={(e) => {
                      const p = (
                        profile.investment_budget || "₹0 Lakh - ₹0 Lakh"
                      ).split(" - ");
                      const n = p[0]?.match(/₹?([\d.]+)/)?.[1] || "0";
                      handleChange(
                        "investment_budget",
                        `₹${n} ${e.target.value} - ${p[1] || "₹0 Lakh"}`,
                      );
                    }}
                    value={
                      (profile.investment_budget || "")
                        .split(" - ")[0]
                        ?.match(/(K|Lakh|Crore)/i)?.[0] || "Lakh"
                    }
                  >
                    <option value="K">K</option>
                    <option value="Lakh">Lakh</option>
                    <option value="Crore">Crore</option>
                  </select>
                  <span className="text-gray-400 font-black px-2 shrink-0">
                    —
                  </span>
                  <span className="text-gray-500 font-bold shrink-0">₹</span>
                  <input
                    type="number"
                    placeholder="50"
                    className="min-w-0 w-16 bg-transparent outline-none text-gray-900 font-black text-lg no-spinners disabled:opacity-70"
                    disabled={!isEditing}
                    onChange={(e) => {
                      const p = (
                        profile.investment_budget || "₹0 Lakh - ₹0 Lakh"
                      ).split(" - ");
                      const u = p[1]?.match(/(K|Lakh|Crore)/i)?.[0] || "Lakh";
                      handleChange(
                        "investment_budget",
                        `${p[0] || "₹0 Lakh"} - ₹${e.target.value} ${u}`,
                      );
                    }}
                    value={
                      (profile.investment_budget || "")
                        .split(" - ")[1]
                        ?.match(/₹?([\d.]+)/)?.[1] || ""
                    }
                  />
                  <select
                    className="bg-transparent outline-none text-gray-600 font-semibold appearance-none cursor-pointer px-1 shrink-0 disabled:opacity-70"
                    disabled={!isEditing}
                    onChange={(e) => {
                      const p = (
                        profile.investment_budget || "₹0 Lakh - ₹0 Lakh"
                      ).split(" - ");
                      const n = p[1]?.match(/₹?([\d.]+)/)?.[1] || "0";
                      handleChange(
                        "investment_budget",
                        `${p[0] || "₹0 Lakh"} - ₹${n} ${e.target.value}`,
                      );
                    }}
                    value={
                      (profile.investment_budget || "")
                        .split(" - ")[1]
                        ?.match(/(K|Lakh|Crore)/i)?.[0] || "Lakh"
                    }
                  >
                    <option value="K">K</option>
                    <option value="Lakh">Lakh</option>
                    <option value="Crore">Crore</option>
                  </select>
                </div>
              </div>

              {/* About */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  About
                </label>
                <textarea
                  value={profile.about || ""}
                  onChange={(e) => handleChange("about", e.target.value)}
                  rows={4}
                  disabled={!isEditing}
                  className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 resize-none font-medium leading-relaxed disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Brief description about yourself or your firm..."
                />
              </div>

              {/* Business Experience — Years + Months */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Business Experience
                </label>
                <div className="flex items-center gap-3 px-8 py-5 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] focus-within:bg-white focus-within:border-blue-600 transition-all duration-500">
                  <select
                    value={
                      parseExperience(profile.business_experience || "").years
                    }
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange(
                        "business_experience",
                        buildExperience(e.target.value),
                      )
                    }
                    className="flex-1 bg-transparent outline-none text-gray-900 font-black text-lg appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="0">0</option>
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400 font-semibold shrink-0 text-sm">
                    yrs
                  </span>
                </div>
              </div>

              {/* Companies Financed */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Companies Financed
                </label>
                <div className="flex items-center justify-between gap-2 w-full px-8 py-5 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] focus-within:bg-white focus-within:border-blue-600 transition-all duration-500">
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() =>
                      handleChange(
                        "companies_financed",
                        String(
                          Math.max(
                            0,
                            Number(profile.companies_financed || 0) - 1,
                          ),
                        ),
                      )
                    }
                    className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-black text-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shrink-0 select-none disabled:opacity-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={profile.companies_financed || "0"}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("companies_financed", e.target.value)
                    }
                    className="w-20 bg-transparent outline-none text-center text-gray-900 font-black text-lg no-spinners disabled:opacity-70"
                  />
                  <button
                    type="button"
                    disabled={!isEditing}
                    onClick={() =>
                      handleChange(
                        "companies_financed",
                        String(Number(profile.companies_financed || 0) + 1),
                      )
                    }
                    className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-black text-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shrink-0 select-none disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Preferred Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Preferred Location
                </label>
                <select
                  value={profile.preferred_location || ""}
                  onChange={(e) =>
                    handleChange("preferred_location", e.target.value)
                  }
                  disabled={!isEditing}
                  className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-gray-200 rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 font-black text-lg appearance-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <option value="">Select preferred state / region...</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-8 md:px-14 py-10 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium text-gray-400">
              All capital targeting is encrypted via bank-grade protocols.
            </p>
            <button
              type="button"
              onClick={
                isEditing
                  ? () => handleSave()
                  : () => {
                      setIsEditing(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
              }
              disabled={saving}
              className={`w-full md:w-auto flex items-center justify-center gap-4 px-14 py-6 font-black rounded-3xl shadow-2xl transition-all active:scale-[0.98] uppercase tracking-tighter text-lg ${
                isEditing
                  ? "bg-blue-700 text-white shadow-blue-700/30 hover:shadow-blue-700/50 hover:-translate-y-1.5"
                  : "bg-red-600 text-white shadow-red-600/30 hover:shadow-red-600/50 hover:-translate-y-1.5"
              }`}
            >
              {saving ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : isEditing ? (
                <Save size={24} />
              ) : (
                <Briefcase size={24} />
              )}
              {saving
                ? "Synchronizing..."
                : isEditing
                  ? "Save Preferences"
                  : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
    {showCropper && imageSrc ? (
      <div className="fixed inset-0 z-[100] bg-transparent backdrop-blur-sm flex items-start justify-center p-6 pt-24">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative animate-in slide-in-from-top-8 duration-500">
          <div className="p-7 border-b border-gray-50 flex justify-between items-center text-gray-900 font-bold">
            <h3 className="text-xl font-black tracking-tight uppercase">
              Sync Identity Visual
            </h3>
            <button
              onClick={() => setShowCropper(false)}
              className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative h-[320px] bg-gray-950">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              style={{
                containerStyle: { background: '#09090b' },
                cropAreaStyle: { 
                  border: '2px solid rgba(255,255,255,0.5)', 
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                  borderRadius: '2.5rem'
                }
              }}
            />
          </div>
          <div className="p-7 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Zoom Scale</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCropper(false)}
                className="flex-1 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleCropSave}
                className="flex-1 py-4 bg-blue-700 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] shadow-xl shadow-blue-700/20 hover:-translate-y-1 transition-all"
              >
                Save Identity
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
