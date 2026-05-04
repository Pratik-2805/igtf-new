"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, ChevronDown } from "lucide-react";

interface RequestInfoButtonProps {
  franchiseName?: string;
  investorName?: string;
  className?: string;
  buttonText?: string;
}

export default function RequestInfoButton({
  franchiseName,
  investorName,
  className,
  buttonText = "Request Information",
}: RequestInfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    business_type: "",
    investment_capacity: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const targetName = franchiseName || investorName || "Unknown";
      const targetType = investorName ? "Investor" : "Franchise";

      const payload = {
        ...formData,
        message: `Requested ${targetType} Information for: ${targetName}`,
        source_platform: "NFIS",
        is_email_verified: false,
        is_phone_verified: false,
      };

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to submit request.");
      }
    } catch (err: any) {
      setError("An error occurred while submitting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        full_name: "",
        email: "",
        phone_number: "",
        business_type: "",
        investment_capacity: "",
      });
      setError("");
    }, 300);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={
          className ||
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-[#004282] text-white shadow hover:bg-[#004282]/90 h-10 px-4 py-2 w-full"
        }
      >
        {buttonText}
      </button>

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={closeModal}></div>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-100">
              <button
                onClick={closeModal}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 md:p-10">
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                  Apply for Franchise
                </h2>
                <p className="text-gray-500 mb-8 font-medium">
                  Please fill in your details and we'll get back to you.
                </p>

                {submitted ? (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">
                      Request Submitted!
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Your interest in <b>{franchiseName || investorName}</b>{" "}
                      has been registered. Our team will contact you shortly.
                    </p>
                    <button
                      onClick={closeModal}
                      className="w-full bg-gray-900 text-white px-8 py-4 rounded-xl hover:bg-black font-black uppercase tracking-widest text-xs transition-all shadow-xl"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm font-bold animate-shake">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          placeholder="e.g. John Doe"
                          required
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-900"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            placeholder="+91 98XXX XXXXX"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          Business Type (Optional)
                        </label>
                        <div className="relative group">
                          <select
                            name="business_type"
                            value={formData.business_type}
                            onChange={handleChange}
                            className="appearance-none w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-900"
                          >
                            <option value="">Select a business type</option>
                            <option value="Proprietorship">
                              Proprietorship
                            </option>
                            <option value="Partnership">Partnership</option>
                            <option value="Private Limited">
                              Private Limited
                            </option>
                            <option value="LLP">LLP</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          Investment Capacity (Optional)
                        </label>
                        <div className="relative group">
                          <select
                            name="investment_capacity"
                            value={formData.investment_capacity}
                            onChange={handleChange}
                            className="appearance-none w-full px-4 py-3.5 rounded-xl border-2 border-gray-100 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold text-gray-900"
                          >
                            <option value="">Select investment range</option>
                            <option value="Up to ₹25 Lakhs">
                              Up to ₹25 Lakhs
                            </option>
                            <option value="₹25 Lakhs - ₹50 Lakhs">
                              ₹25 Lakhs - ₹50 Lakhs
                            </option>
                            <option value="₹50 Lakhs - ₹1 Crore">
                              ₹50 Lakhs - ₹1 Crore
                            </option>
                            <option value="₹1 Crore - ₹2.5 Crores">
                              ₹1 Crore - ₹2.5 Crores
                            </option>
                            <option value="₹2.5 Crores - ₹5 Crores">
                              ₹2.5 Crores - ₹5 Crores
                            </option>
                            <option value="₹5 Crores+">₹5 Crores+</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : (
                          "Submit Application"
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
