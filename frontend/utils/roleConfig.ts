export type UserRole = "admin" | "manager" | "sales";

export const roleTabs = {
  admin: [
    "exhibitors",
    "visitors",
    "investors",
    "franchisors",
    "nfis-executives",
    "contact-inquiries",
    "events",
    "categories",
    "gallery",
    "manage-team",
    "account",
    "settings",
  ],
  manager: ["exhibitors", "visitors", "investors", "franchisors", "categories", "events", "gallery", "account"],
  sales: ["exhibitors", "visitors", "investors", "franchisors", "account"],
};

// Dashboard title for each role
export const roleTitles: Record<UserRole, string> = {
  admin: "Admin Dashboard",
  manager: "Manager Dashboard",
  sales: "Sales Dashboard",
};
