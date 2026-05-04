'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Info, UploadCloud, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddInvestorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    firmName: '',
    email: '',
    phone: '',
    budget: '',
    sector: '',
    experience: '',
    companiesFinanced: '',
    logo: null as File | null,
    logoPreview: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData(prev => ({ 
          ...prev, 
          logo: file,
          logoPreview: URL.createObjectURL(file)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return "Full Name is required.";
    if (!formData.firmName.trim()) return "Firm Name is required.";
    if (!formData.email.trim()) return "Email Address is required.";
    if (!formData.phone.trim()) return "Phone Number is required.";
    if (!formData.budget) return "Investment Budget is required.";
    if (!formData.sector) return "Interested Sector is required.";
    if (!formData.experience) return "Business Experience is required.";
    if (!formData.companiesFinanced) return "Number of Companies Financed is required.";
    if (!formData.logo) return "Firm Logo is required.";
    return null;
  };

  const isFormValid = !!(
    formData.fullName.trim() &&
    formData.firmName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.budget &&
    formData.sector &&
    formData.experience &&
    formData.companiesFinanced &&
    formData.logo
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append('full_name', formData.fullName);
      payload.append('firm_name', formData.firmName);
      payload.append('email', formData.email || `info@${formData.fullName.toLowerCase().replace(/\s+/g, '')}.com`);
      payload.append('phone_number', formData.phone || "0000000000");
      payload.append('investment_budget', formData.budget);
      payload.append('interested_sector', formData.sector);
      payload.append('business_experience', formData.experience);
      payload.append('companies_financed', formData.companiesFinanced);
      payload.append('source_platform', 'nfis');
      payload.append('status', 'contacted');

      if (formData.logo) {
        payload.append('logo', formData.logo);
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/investor-registrations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: payload
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/executive/dashboard');
        }, 2000);
      } else {
        const data = await res.json();
        setError(`Failed to save: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-md w-full text-center border border-gray-100">
          <CheckCircle size={60} className="text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Saved Successfully!</h2>
          <p className="text-gray-500 font-medium mb-8">The investor lead has been successfully onboarded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/executive/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="mb-8 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Add Investor Lead</h1>
          <p className="text-gray-500 font-medium mt-2">Executive dashboard to register a new investor profile.</p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <Info size={20} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50 pointer-events-none"></div>
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">1</span>
              Personal Details
            </h2>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Firm Logo <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group hover:border-blue-400 transition-all cursor-pointer">
                    {formData.logoPreview ? (
                      <img src={formData.logoPreview} className="w-full h-full object-cover" alt="Logo preview" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center">
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-bold mt-1">NO LOGO</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                      <UploadCloud className="text-white" size={24} />
                      <input type="file" name="logo" accept="image/*" onChange={handleChange} className="hidden" />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700">Upload Firm Identity</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">This logo will be displayed on your public investor profile card.</p>
                    <label className="mt-3 inline-flex px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-colors">
                      Select File
                      <input type="file" name="logo" accept="image/*" onChange={handleChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input required placeholder="e.g. John Doe" type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Firm Name <span className="text-red-500">*</span></label>
                <input required type="text" name="firmName" value={formData.firmName} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-semibold" placeholder="e.g. Acme Capital" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email Address <span className="text-red-500">*</span></label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-semibold" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number <span className="text-red-500">*</span></label>
                <input required type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white font-semibold" placeholder="+91 9876543210" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
              Investment Preferences
            </h2>
            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Investment Budget <span className="text-red-500">*</span></label>
                <select required name="budget" value={formData.budget} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold appearance-none">
                  <option value="">Select budget range</option>
                  <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs - ₹50 Lakhs</option>
                  <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                  <option value="₹1 Crore - ₹2.5 Crores">₹1 Crore - ₹2.5 Crores</option>
                  <option value="₹2.5 Crores - ₹5 Crores">₹2.5 Crores - ₹5 Crores</option>
                  <option value="₹5 Crores+">₹5 Crores+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Interested Sector <span className="text-red-500">*</span></label>
                <select required name="sector" value={formData.sector} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold appearance-none">
                  <option value="">Select a sector</option>
                  <option value="QSR">QSR</option>
                  <option value="Health & Wellness">Health & Wellness</option>
                  <option value="Education & Training">Education & Training</option>
                  <option value="Global Pavilion">Global Pavilion</option>
                  <option value="Retail & Lifestyle">Retail & Lifestyle</option>
                  <option value="Hospitality & Stay">Hospitality & Stay</option>
                  <option value="Kids & Entertainment">Kids & Entertainment</option>
                  <option value="Ecosystem & Support">Ecosystem & Support</option>
                  <option value="Automobile & EV">Automobile & EV</option>
                  <option value="Business Services">Business Services</option>
                  <option value="Home Services">Home Services</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Business Experience (Years) <span className="text-red-500">*</span></label>
                <select required name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold appearance-none">
                  <option value="">Select experience level</option>
                  <option value="0-2 years">0-2 years</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Companies Financed <span className="text-red-500">*</span></label>
                <select required name="companiesFinanced" value={formData.companiesFinanced} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white font-semibold appearance-none">
                  <option value="">Select number of companies</option>
                  <option value="0">0</option>
                  <option value="1-2">1-2</option>
                  <option value="3-5">3-5</option>
                  <option value="5+">5+</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-8 mb-20 flex md:justify-end">
            <button 
              disabled={loading || !isFormValid} 
              type="submit" 
              className={`w-full md:w-auto px-12 py-5 bg-gray-900 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                loading || !isFormValid ? 'opacity-50 cursor-not-allowed translate-y-0' : 'hover:bg-black hover:-translate-y-1'
              }`}
            >
              {loading ? 'Saving...' : <><Save size={18} /> Save Lead</>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
