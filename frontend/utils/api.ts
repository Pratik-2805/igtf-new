import { useAuth } from "@/hooks/useAuth";

// --- Configuration ---
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const URLS = {
  EXHIBITORS: `${BASE_URL}/exhibitor-registrations/`,
  VISITORS: `${BASE_URL}/visitor-registrations/`,
  EVENTS: `${BASE_URL}/events/`,
  CATEGORIES: `${BASE_URL}/categories/`,
  GALLERY: `${BASE_URL}/gallery/`,
  INVESTORS: `${BASE_URL}/investor-registrations/`,
  FRANCHISORS: `${BASE_URL}/franchisor-registrations/`,
};

// --- Formatters ---
export const getSourceDisplay = (source: string) => {
  if (!source) return "UNKNOWN";
  const s = source.toLowerCase();
  if (s.includes("nfis")) return "NFIS";
  if (s.includes("igtf")) return "IGTF";
  if (s.includes("manual")) return "MANUAL";
  return source.toUpperCase();
};

// --- Helper ---
export const useAuthHeaders = () => {
  const { access } = useAuth();

  return () => {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (access) {
      headers.Authorization = `Bearer ${access}`;
    }

    return headers;
  };
};

// --- Interfaces ---

// Exhibitor
export interface ExhibitorRegistration {
  id: number;
  logo?: string;
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
  industry?: string;
  investment_required?: string;
  roi?: string;
  units_operating?: number;
  status: "pending" | "contacted" | "paid" | "rejected";
  source_platform: string;
  api_source: string;
  created_at: string;
}

// Visitor
export interface VisitorRegistration {
  id: number;
  first_name: string;
  last_name: string;
  company_name: string;
  email_address: string;
  phone_number: string;
  industry_interest: string;
  franchisor_interest?: string;
  investment_budget?: string;
  business_experience?: string;
  created_at: string;
  event_location: string;
  event_name?: string;
  status: "pending" | "contacted" | "paid" | "rejected";
  source_platform: string;
  api_source: string;
}

// Investor
export interface InvestorRegistration {
  id: number;
  logo?: string;
  full_name: string;
  firm_name?: string;
  email: string;
  phone_number: string;
  investment_budget: string;
  interested_sector: string;
  business_experience?: string;
  companies_financed?: string;
  status: "pending" | "contacted" | "converted" | "rejected";
  event_name?: string;
  event_location?: string;
  source_platform: string;
  created_at: string;
}

// Franchisor
export interface FranchisorRegistration {
  id: number;
  logo?: string;
  company_name: string;
  contact_person_name: string;
  designation?: string;
  email_address: string;
  contact_number: string;
  industry?: string;
  product_category?: string;
  franchise_fee?: string;
  royalty?: string;
  space_requirement?: string;
  location_type?: string;
  break_even?: string;
  cities?: string;
  training_support?: string | boolean;
  setup_support?: string | boolean;
  marketing_support?: string | boolean;
  founded_year?: number;
  units_operating?: number;
  investment_required?: string;
  roi?: string;
  about?: string;
  company_address?: string;
  event_location?: string;
  event_name?: string;
  status: "pending" | "contacted" | "paid" | "rejected";
  source_platform: string;
  api_source: string;
  created_at: string;
}

// Event
export interface Event {
  id: number;
  title: string;
  location: string;
  start_date: string;
  end_date: string;
  time: string;
  exhibitors: number;
  buyers: number;
  countries: number;
  sectors_count: string;
  sectors?: { id: number; name: string; description?: string }[];
  description: string;
  is_active: boolean;
  opt_out_date: boolean;
  has_stall_layout: boolean;
  image?: string;
}

// Category (clean)
export interface Category {
  id: number;
  name: string;
  image: string;
  created_at: string;
}

// Gallery (clean)
export interface GalleryImage {
  id: number;
  image: string;

  page: "about" | "gallery";
  section:
  | "banner"
  | "why_exhibit"
  | "why_choose_igtf"
  | "main"
  | "exhibition_moments";

  display_order: number;
  created_at: string;
}
