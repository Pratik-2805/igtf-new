"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// Layout
import Header from "./layout/Header";

// Tabs
import ExhibitorsTab from "@/components/admin/ExhibitorsTab";
import VisitorsTab from "@/components/admin/VisitorsTab";
import InvestorsTab from "@/components/admin/InvestorsTab";
import FranchisorsTab from "@/components/admin/FranchisorsTab";
import ContactInquiriesTab from "@/components/admin/ContactInquiriesTab";
import EventsTab from "@/components/admin/EventsTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import GalleryTab from "@/components/admin/GalleryTab";
import ManageTeamTab from "@/components/admin/ManageTeamTab";
import NfisExecutivesTab from "@/components/admin/NfisExecutivesTab";
import AccountTab from "./AccountTab";
import SettingsTab from "./SettingsTab";

// Hooks (ENABLED flags ONLY)
import { useExhibitors } from "@/hooks/useExhibitors";
import { useVisitors } from "@/hooks/useVisitors";
import { useInvestors } from "@/hooks/useInvestors";
import { useFranchisors } from "@/hooks/useFranchisors";
import { useContactInquiries } from "@/hooks/useContactInquiries";
import { useEvents } from "@/hooks/useEvents";
import { useCategories } from "@/hooks/useCategories";
import { useGallery } from "@/hooks/useGallery";
import { useTeam } from "@/hooks/useTeam";
import { useNfisExecutives } from "@/hooks/useNfisExecutives";
import { useAccount } from "@/hooks/useAccount";

// Role config
import { UserRole, roleTabs } from "@/utils/roleConfig";
import { useAuth } from "@/hooks/useAuth";

interface DecodedToken {
  id?: number;
  email?: string;
  role?: UserRole;
  exp?: number;
}

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { logout } = useAuth();

  /* ------------------------------------------
   * AUTH STATE
   * ----------------------------------------*/
  const [role, setRole] = useState<UserRole | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  /* ------------------------------------------
   * CHECK AUTH (RUN ONCE)
   * ----------------------------------------*/
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";")[0];
    };

    const token = getCookie("access");
    if (!token) {
      setAuthChecked(true);
      router.replace("/login");
      return;
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (
        !decoded?.role ||
        !["admin", "manager", "sales"].includes(decoded.role)
      ) {
        setAuthChecked(true);
        router.replace("/login");
        return;
      }

      setRole(decoded.role);
      setAuthChecked(true);
    } catch {
      setAuthChecked(true);
      router.replace("/login");
    }
  }, [router]);

  /* ------------------------------------------
   * ALLOWED TABS BASED ON ROLE
   * ----------------------------------------*/
  const allowedTabs = useMemo(() => {
    if (!role) return [];
    return roleTabs[role];
  }, [role]);

  /* ------------------------------------------
   * ACTIVE TAB — local state for instant switching
   * URL is kept in sync as a side-effect
   * ----------------------------------------*/
  const tabFromUrl = searchParams?.get("tab") ?? "";

  const [activeTab, setActiveTab] = useState<string>("");

  // Initialise once when auth + allowed tabs are ready
  useEffect(() => {
    if (!authChecked || !role) return;
    const initial = allowedTabs.includes(tabFromUrl) ? tabFromUrl : allowedTabs[0] ?? "";
    setActiveTab(initial);
  // Run only once (on auth ready); tab navigations are driven by setActiveTab below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, role]);

  // Keep URL in sync whenever activeTab changes (non-blocking – no await)
  useEffect(() => {
    if (!activeTab) return;
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    router.replace(`${pathname}?${params.toString()}`);
  }, [activeTab, pathname, router]);

  /* ------------------------------------------
   * DATA HOOKS — ONLY ENABLED FOR ACTIVE TAB
   * ----------------------------------------*/
  const exhibitors = useExhibitors(role !== null && activeTab === "exhibitors");
  const visitors = useVisitors(role !== null && activeTab === "visitors");
  const investorLeads = useInvestors(role !== null && activeTab === "investors");
  const franchisorsHook = useFranchisors(role !== null && activeTab === "franchisors");
  const contactInquiriesHook = useContactInquiries(role !== null && activeTab === "contact-inquiries");
  const events = useEvents(role !== null && (activeTab === "events" || activeTab === "exhibitors" || activeTab === "visitors" || activeTab === "investors"));
  const categories = useCategories(role !== null && activeTab === "categories");
  const galleryHook = useGallery({ enabled: role !== null && activeTab === "gallery" });
  const gallery = useMemo(
    () => ({
      ...galleryHook,
      addGalleryImage: (data: Record<string, FormDataEntryValue>) =>
        galleryHook.addGalleryImage({
          page: String(data.page),
          section: String(data.section),
        }),
    }),
    [galleryHook]
  );
  const activeRole = role || "sales"; // fallback
  const team = useTeam(activeTab === "manage-team" && activeRole === "admin");
  const nfisExecutivesHook = useNfisExecutives(activeTab === "nfis-executives" && activeRole === "admin");

  const accountHook = useAccount(); // always allowed

  /* ------------------------------------------
   * LOGOUT
   * ----------------------------------------*/
  const handleLogout = async () => {
    setActiveTab("");     // kills all enabled flags → stops any pending hook fetches
    setRole(null);        // clears role before navigation
    await logout();       // clears backend session and all auth cookies
    router.push("/login");
  };

  /* ------------------------------------------
   * LOADING WHILE AUTH CHECKS
   * ----------------------------------------*/
  if (!authChecked || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  /* ------------------------------------------
   * RENDER UI
   * ----------------------------------------*/
  return (
    <div className="min-h-screen bg-background">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (allowedTabs.includes(tab)) {
            setActiveTab(tab);
          }
        }}
        onLogout={handleLogout}
        role={role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "exhibitors" && (
          <ExhibitorsTab
            {...exhibitors}
            role={role}
            events={events.events}
            deleteExhibitor={exhibitors.deleteExhibitor}
            updateStallNumber={exhibitors.updateStallNumber}
            updateEventDetails={exhibitors.updateEventDetails}
          />
        )}
        {activeTab === "visitors" && (
          <VisitorsTab
            {...visitors}
            role={role}
            events={events.events}
            deleteVisitor={visitors.deleteVisitor}
            convertVisitor={visitors.convertVisitor}
            updateEventDetails={visitors.updateEventDetails}
          />
        )}
        {activeTab === "investors" && (
          <InvestorsTab
            {...investorLeads}
            role={role}
            events={events.events}
            deleteInvestor={investorLeads.deleteInvestor}
            updateEventDetails={investorLeads.updateEventDetails}
            convertToExhibitor={investorLeads.convertToExhibitor}
          />
        )}
        {activeTab === "franchisors" && (
          <FranchisorsTab
            {...franchisorsHook}
            role={role}
            events={events.events}
            deleteFranchisor={franchisorsHook.deleteFranchisor}
            updateEventDetails={franchisorsHook.updateEventDetails}
            convertToExhibitor={franchisorsHook.convertToExhibitor}
          />
        )}
        {activeTab === "contact-inquiries" && <ContactInquiriesTab {...contactInquiriesHook} />}
        {activeTab === "events" && <EventsTab {...events} />}
        {activeTab === "categories" && <CategoriesTab {...categories} />}
        {activeTab === "gallery" && <GalleryTab {...gallery} />}
        {activeTab === "manage-team" && <ManageTeamTab {...team} />}
        {activeTab === "nfis-executives" && <NfisExecutivesTab {...nfisExecutivesHook} />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "account" && <AccountTab />}
      </div>
    </div>
  );
}
