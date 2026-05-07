"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Building2,
  DollarSign,
  Phone,
  MapPin,
  Check,
  Search,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import LoadingScreen from "@/components/loading-screen";

export const PRODUCT_CATEGORIES_BY_INDUSTRY: Record<string, string[]> = {
  QSR: [
    "Fast Food",
    "Cafe & Bakery",
    "Cloud Kitchen",
    "Ice Cream & Desserts",
    "Beverages",
    "Fine Dining",
    "Other Food",
  ],
  "Health & Wellness": [
    "Gym & Health Club",
    "Wellness Center",
    "Yoga & Pilates",
    "Skin Care & Beauty",
    "Healthcare Services",
    "Other Wellness",
  ],
  "Education & Training": [
    "Pre-school/K-12",
    "Tutoring & Coaching",
    "Vocational Training",
    "Language School",
    "Other Education",
  ],
  "Global Pavilion": [
    "International Brands",
    "Foreign Investment",
    "Import/Export",
    "Overseas Expansion",
  ],
  "Retail & Lifestyle": [
    "Apparel & Fashion",
    "Supermarket & Grocery",
    "Electronics",
    "Home & Lifestyle",
    "Cosmetics",
    "Other Retail",
  ],
  "Hospitality & Stay": [
    "Hotels & B&B",
    "Resorts",
    "Travel Agency",
    "Homestays",
    "Other Hospitality",
  ],
  "Kids & Entertainment": [
    "Play Centers",
    "Themed Parks",
    "Gaming Zones",
    "Toy Stores",
    "Other Entertainment",
  ],
  "Ecosystem & Support": [
    "Consulting",
    "B2B Services",
    "Logistics",
    "Manpower",
    "Marketing",
  ],
  "Automobile & EV": [
    "EV Showrooms",
    "Service Centers",
    "Accessories",
    "Charging Stations",
    "Tyres & Spares",
  ],
  "Business Services": [
    "B2B Consulting",
    "Facility Management",
    "Legal & Accounting",
    "IT Services",
    "Other B2B",
  ],
  "Home Services": [
    "Interior Design",
    "Pest Control",
    "Real Estate Brokerage",
    "Home Automation",
    "Other Home Services",
  ],
  "Finance & Banking": [
    "NBFCs",
    "Investment Services",
    "Loan Hubs",
    "Financial Consulting",
    "Digital Banking",
  ],
};

export default function RegisterPage() {
  const [userType, setUserType] = useState<
    "franchisee" | "franchisor" | "investor" | null
  >(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams?.get("type");
    if (
      type === "visitor" ||
      type === "franchisee" ||
      type === "visitor-registration"
    ) {
      setUserType("franchisee");
    } else if (type === "franchisor") {
      setUserType("franchisor");
    } else if (type === "investor") {
      setUserType("investor");
    }
  }, [searchParams]);

  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-110 mb-8"
            >
              <div className="relative w-24 h-24 bg-white rounded-full p-2 shadow-xl border border-blue-100/50 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src="/logo.png"
                    alt="NFIS Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">
              Join the National Franchise Investment Summit
            </h1>
            <p className="text-xl text-gray-600 text-balance">
              Choose your role and start your franchise journey today
            </p>
          </div>

          {/* User Type Selection */}
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {/* Franchisor Card */}
              <button
                onClick={() => setUserType("franchisor")}
                className="group bg-white rounded-lg border-2 border-gray-200 p-8 hover:border-blue-600 hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <DollarSign
                    size={24}
                    className="text-blue-600 group-hover:text-white transition-all"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Franchisor
                </h3>
                <p className="text-gray-600 mb-4">
                  I want to expand my business through franchising
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-blue-600" />
                    Recruit franchisees
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-blue-600" />
                    Manage network
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-blue-600" />
                    Scale operations
                  </li>
                </ul>
              </button>

              {/* Investor Card */}
              <button
                onClick={() => setUserType("investor")}
                className="group bg-white rounded-lg border-2 border-gray-200 p-8 hover:border-green-600 hover:shadow-lg transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
                  <DollarSign
                    size={24}
                    className="text-green-600 group-hover:text-white transition-all"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Investor
                </h3>
                <p className="text-gray-600 mb-4">
                  I want to invest in franchise opportunities
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    Browse investments
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    Analyze returns
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={16} className="text-green-600" />
                    Network with partners
                  </li>
                </ul>
              </button>
            </div>

            <div className="flex justify-center">
              {/* Visitor Card */}
              <button
                onClick={() => setUserType("franchisee")}
                className="group bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-red-600 hover:shadow-lg transition-all duration-300 text-left relative max-w-md w-full"
              >
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-all">
                  <User
                    size={24}
                    className="text-red-600 group-hover:text-white transition-all"
                  />
                </div>
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">Visitor</h3>
                  <span className="text-xs font-semibold text-gray-500">
                    (No Sign-In Needed)
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  I want to explore franchise brands and attend the summit
                </p>
              </button>
            </div>
          </div>

          {/* Already registered */}
          <div className="text-center mt-12">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userType === "franchisee") {
    return <FranchiseeRegistration onBack={() => setUserType(null)} />;
  }

  if (userType === "franchisor") {
    return <FranchisorRegistration onBack={() => setUserType(null)} />;
  }

  return <InvestorRegistration onBack={() => setUserType(null)} />;
}

function FranchiseeRegistration({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    industry: "",
    event_name: "",
    event_location: "",
    brands: [] as string[],
  });

  const [eventsList, setEventsList] = useState<any[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEventsAndBrands = async () => {
      setIsEventsLoading(true);
      setIsBrandsLoading(true);
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const NFIS_PLATFORMS = "nfis,NFIS,nfis.in,manual,MANUAL";

      try {
        const eventsRes = await fetch(`${API_URL}/api/events/`);
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const results = data.results || data;
          if (Array.isArray(results)) {
            setEventsList(results.filter((ev: any) => ev.is_active));
          }
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsEventsLoading(false);
      }

      try {
        const franchisorRes = await fetch(
          `${API_URL}/api/franchisor-registrations/?source_platform=${NFIS_PLATFORMS}`,
        );
        let allNames: string[] = [];
        if (franchisorRes.ok) {
          const data = await franchisorRes.json();
          const results = data.results || data;
          if (Array.isArray(results)) {
            allNames = results.map((r: any) => r.company_name).filter(Boolean);
          }
        }
        setBrandsList(Array.from(new Set(allNames)).sort());
      } catch (err) {
        console.error("Failed to connect to brands network:", err);
      } finally {
        setIsBrandsLoading(false);
      }
    };
    fetchEventsAndBrands();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors: Record<string, string> = {};

    if (!formData.event_name)
      newErrors.event_name = "Selecting an event is required";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.industry)
      newErrors.industry = "Industry interest is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_type: "franchisee",
          email: formData.email,
          username: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_name: formData.companyName || "N/A",
          phone: formData.phone,
          contact_number: formData.phone,
          event_location: formData.event_location || "N/A",
          preferred_location: formData.event_location || "N/A",
          industry: formData.industry,
          preferred_industry: formData.industry,
          interested_brands: formData.brands.join(", "),
          source_platform: "NFIS",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        const errorMsg = Object.entries(errorData)
          .map(
            ([key, val]) =>
              `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
          )
          .join("\n");
        toast.error(
          errorMsg ||
            "Registration failed. Please ensure all details are correct.",
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Network error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying. Our team will review your application and
            contact you soon.
          </p>
          <Link
            href="/franchises"
            className="inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
          >
            Browse Franchises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && <LoadingScreen />}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-950 transition-all font-semibold mb-6 group text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Roles
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12 shadow-xl">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visitor Registration
          </h1>
          <p className="text-gray-600 mb-8">
            Register as a visitor to explore premium franchise brands and attend
            the summit.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Event */}
            <div>
              <label
                htmlFor="event_name"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Select Event <span className="text-red-500">*</span>
              </label>
              <select
                name="event_name"
                id="event_name"
                value={formData.event_name}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const selectedEventObj = eventsList.find(
                    (ev) => ev.title === selectedName,
                  );
                  setFormData({
                    ...formData,
                    event_name: selectedName,
                    event_location: selectedEventObj
                      ? selectedEventObj.location
                      : "N/A",
                  });
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all font-semibold ${
                  errors.event_name ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Choose an upcoming exhibition</option>
                {eventsList.map((ev, idx) => (
                  <option key={idx} value={ev.title}>
                    {ev.title} ({ev.location})
                  </option>
                ))}
              </select>
              {errors.event_name && (
                <p className="text-red-500 text-sm mt-1">{errors.event_name}</p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                placeholder="Enter company name"
              />
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Industry Interest */}
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Industry Interest <span className="text-red-500">*</span>
              </label>
              <select
                name="industry"
                id="industry"
                value={formData.industry}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all ${
                  errors.industry ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select an industry</option>
                {Object.keys(PRODUCT_CATEGORIES_BY_INDUSTRY).map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-[#154666] hover:bg-[#0f344d] text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-lg mt-4"
            >
              Submit Registration
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function FranchisorRegistration({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPersonName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState<"email" | "phone" | null>(
    null,
  );
  const [isSendingOtp, setIsSendingOtp] = useState<"email" | "phone" | null>(
    null,
  );

  const sendOtp = async (type: "email" | "phone") => {
    const value = type === "email" ? formData.email : formData.phone;
    if (!value) {
      toast.error(`Please enter your ${type} first.`);
      return;
    }

    setIsSendingOtp(type);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      const data = await response.json();
      if (response.ok) {
        if (type === "email") setIsEmailOtpSent(true);
        else setIsPhoneOtpSent(true);
        toast.success(data.message || "OTP sent successfully!");
      } else {
        toast.error(data.detail || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP.");
    } finally {
      setIsSendingOtp(null);
    }
  };

  const verifyOtp = async (type: "email" | "phone") => {
    const value = type === "email" ? formData.email : formData.phone;
    const otp = type === "email" ? emailOtp : phoneOtp;

    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsVerifying(type);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        if (type === "email") setIsEmailVerified(true);
        else setIsPhoneVerified(true);
        toast.success(data.message || "Verified successfully!");
      } else {
        toast.error(data.detail || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Verification failed.");
    } finally {
      setIsVerifying(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors: Record<string, string> = {};

    if (!formData.companyName)
      newErrors.companyName = "Company name is required";
    if (!formData.contactPersonName)
      newErrors.contactPersonName = "Contact person name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_type: "franchisor",
          email: formData.email,
          username: formData.email,
          password: formData.password,
          company_name: formData.companyName,
          contact_person_name: formData.contactPersonName,
          contact_number: formData.phone,
          is_email_verified: isEmailVerified,
          is_phone_verified: isPhoneVerified,
          source_platform: "NFIS",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Franchisor registration response:", data);

        if (!data.access) {
          toast.error(
            "Registration succeeded but auto-login failed. Please sign in manually.",
          );
          window.location.replace("/login");
          return;
        }

        localStorage.setItem("access_token", data.access);
        document.cookie = `access_token=${data.access}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
        if (formData.email) localStorage.setItem("user_email", formData.email);

        const role = data.user?.role || data.role || "franchisor";
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_name", formData.contactPersonName);
        localStorage.setItem("company_name", formData.companyName);

        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome to NFIS! Taking you to your dashboard...");
        setTimeout(() => window.location.replace("/dashboard/franchisor"), 800);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = Object.entries(errorData)
          .map(
            ([key, val]) =>
              `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
          )
          .join("\n");
        console.error("Franchisor registration error:", errorData);
        toast.error(errorMsg || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to NFIS. Our team will verify your business details and
            you'll be able to start recruiting franchisees soon.
          </p>
          <Link
            href="/exhibitions"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            View Exhibitions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && <LoadingScreen />}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-950 transition-all font-semibold mb-6 group text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Roles
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Franchisor Registration
          </h1>
          <p className="text-gray-600 mb-8">
            Register your franchise company and reach potential franchisees
            worldwide.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Company Name
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your Company Ltd."
                />
              </div>
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label
                htmlFor="contactPersonName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Contact Person Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="contactPersonName"
                  id="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                    errors.contactPersonName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Jane Smith"
                />
              </div>
              {errors.contactPersonName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactPersonName}
                </p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Business Email
                </label>
                {!isEmailOtpSent || isEmailVerified ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        disabled={isEmailVerified}
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } ${isEmailVerified ? "bg-green-50 border-green-200" : ""}`}
                        placeholder="jane@company.com"
                      />
                    </div>
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={() => sendOtp("email")}
                        disabled={
                          !formData.email ||
                          isVerifying === "email" ||
                          isSendingOtp === "email"
                        }
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px]"
                      >
                        {isSendingOtp === "email" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                    {isEmailVerified && (
                      <div className="flex items-center text-green-600 font-semibold text-sm gap-1">
                        <Check size={18} /> Verified
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Enter Email OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => verifyOtp("email")}
                      disabled={isVerifying === "email"}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isVerifying === "email" ? "..." : "Verify"}
                    </button>
                  </div>
                )}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Phone Number
                </label>
                {!isPhoneOtpSent || isPhoneVerified ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        disabled={isPhoneVerified}
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } ${isPhoneVerified ? "bg-green-50 border-green-200" : ""}`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={() => sendOtp("phone")}
                        disabled={
                          !formData.phone ||
                          isVerifying === "phone" ||
                          isSendingOtp === "phone"
                        }
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px]"
                      >
                        {isSendingOtp === "phone" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                    {isPhoneVerified && (
                      <div className="flex items-center text-green-600 font-semibold text-sm gap-1">
                        <Check size={18} /> Verified
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Enter Phone OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => verifyOtp("phone")}
                      disabled={isVerifying === "phone"}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isVerifying === "phone" ? "..." : "Verify"}
                    </button>
                  </div>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Passwords */}
            <div
              className={`space-y-6 transition-all duration-300 ${!isEmailVerified || !isPhoneVerified ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !isEmailVerified ||
                !isPhoneVerified ||
                !formData.companyName ||
                !formData.contactPersonName ||
                !formData.password ||
                formData.password !== formData.confirmPassword
              }
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center font-bold"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Register as Franchisor"
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function InvestorRegistration({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPersonName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState<"email" | "phone" | null>(
    null,
  );
  const [isSendingOtp, setIsSendingOtp] = useState<"email" | "phone" | null>(
    null,
  );

  const sendOtp = async (type: "email" | "phone") => {
    const value = type === "email" ? formData.email : formData.phone;
    if (!value) {
      toast.error(`Please enter your ${type} first.`);
      return;
    }

    setIsSendingOtp(type);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
      const data = await response.json();
      if (response.ok) {
        if (type === "email") setIsEmailOtpSent(true);
        else setIsPhoneOtpSent(true);
        toast.success(data.message || "OTP sent successfully!");
      } else {
        toast.error(data.detail || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Failed to send OTP.");
    } finally {
      setIsSendingOtp(null);
    }
  };

  const verifyOtp = async (type: "email" | "phone") => {
    const value = type === "email" ? formData.email : formData.phone;
    const otp = type === "email" ? emailOtp : phoneOtp;

    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsVerifying(type);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        if (type === "email") setIsEmailVerified(true);
        else setIsPhoneVerified(true);
        toast.success(data.message || "Verified successfully!");
      } else {
        toast.error(data.detail || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Verification failed.");
    } finally {
      setIsVerifying(null);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors: Record<string, string> = {};

    if (!formData.companyName)
      newErrors.companyName = "Company name is required";
    if (!formData.contactPersonName)
      newErrors.contactPersonName = "Contact person name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_type: "investor",
          email: formData.email,
          username: formData.email,
          password: formData.password,
          company_name: formData.companyName,
          full_name: formData.contactPersonName,
          phone_number: formData.phone,
          is_email_verified: isEmailVerified,
          is_phone_verified: isPhoneVerified,
          source_platform: "NFIS",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Investor registration response:", data);

        if (!data.access) {
          toast.error(
            "Registration succeeded but auto-login failed. Please sign in manually.",
          );
          window.location.replace("/login");
          return;
        }

        localStorage.setItem("access_token", data.access);
        document.cookie = `access_token=${data.access}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

        if (data.refresh) localStorage.setItem("refresh_token", data.refresh);
        if (formData.email) localStorage.setItem("user_email", formData.email);

        const role = data.user?.role || data.role || "investor";
        localStorage.setItem("user_role", role);
        localStorage.setItem("user_name", formData.contactPersonName);
        localStorage.setItem("company_name", formData.companyName);

        window.dispatchEvent(new Event("auth-change"));
        toast.success("Welcome to NFIS! Taking you to your dashboard...");
        setTimeout(() => window.location.replace("/dashboard/investor"), 800);
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = Object.entries(errorData)
          .map(
            ([key, val]) =>
              `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
          )
          .join("\n");
        console.error("Investor registration error:", errorData);
        toast.error(errorMsg || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Welcome to NFIS. Start exploring franchise investment opportunities
            that match your goals.
          </p>
          <Link
            href="/franchises"
            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all"
          >
            Browse Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {isLoading && <LoadingScreen />}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-950 transition-all font-semibold mb-6 group text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Roles
        </button>
        <div className="bg-white rounded-lg border border-gray-200 p-8 md:p-12">
          {/* Header */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Investor Registration
          </h1>
          <p className="text-gray-600 mb-8">
            Join our community of investors and discover franchise
            opportunities.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Info */}
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Company Name
              </label>
              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                    errors.companyName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Your Company/Firm Name"
                />
              </div>
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label
                htmlFor="contactPersonName"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Contact Person Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="contactPersonName"
                  id="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                    errors.contactPersonName
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Jane Smith"
                />
              </div>
              {errors.contactPersonName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactPersonName}
                </p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Email Address
                </label>
                {!isEmailOtpSent || isEmailVerified ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        disabled={isEmailVerified}
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        } ${isEmailVerified ? "bg-green-50 border-green-200" : ""}`}
                        placeholder="jane@example.com"
                      />
                    </div>
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={() => sendOtp("email")}
                        disabled={
                          !formData.email ||
                          isVerifying === "email" ||
                          isSendingOtp === "email"
                        }
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px]"
                      >
                        {isSendingOtp === "email" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                    {isEmailVerified && (
                      <div className="flex items-center text-green-600 font-semibold text-sm gap-1">
                        <Check size={18} /> Verified
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Enter Email OTP"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => verifyOtp("email")}
                      disabled={isVerifying === "email"}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isVerifying === "email" ? "..." : "Verify"}
                    </button>
                  </div>
                )}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  Phone Number
                </label>
                {!isPhoneOtpSent || isPhoneVerified ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        disabled={isPhoneVerified}
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } ${isPhoneVerified ? "bg-green-50 border-green-200" : ""}`}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={() => sendOtp("phone")}
                        disabled={
                          !formData.phone ||
                          isVerifying === "phone" ||
                          isSendingOtp === "phone"
                        }
                        className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[90px]"
                      >
                        {isSendingOtp === "phone" ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    )}
                    {isPhoneVerified && (
                      <div className="flex items-center text-green-600 font-semibold text-sm gap-1">
                        <Check size={18} /> Verified
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Lock
                        size={18}
                        className="absolute left-3 top-3 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Enter Phone OTP"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => verifyOtp("phone")}
                      disabled={isVerifying === "phone"}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
                    >
                      {isVerifying === "phone" ? "..." : "Verify"}
                    </button>
                  </div>
                )}
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Passwords */}
            <div
              className={`space-y-6 transition-all duration-300 ${!isEmailVerified || !isPhoneVerified ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-900 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isLoading ||
                !isEmailVerified ||
                !isPhoneVerified ||
                !formData.companyName ||
                !formData.contactPersonName ||
                !formData.password ||
                formData.password !== formData.confirmPassword
              }
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center font-bold"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </>
              ) : (
                "Register as Investor"
              )}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
