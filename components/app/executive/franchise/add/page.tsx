'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, Info, ChevronRight, ChevronLeft, Image as ImageIcon, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/authFetch';

const PRODUCT_CATEGORIES_BY_INDUSTRY: Record<string, string[]> = {
  'QSR': ['Fast Food', 'Cafe & Bakery', 'Cloud Kitchen', 'Ice Cream & Desserts', 'Beverages', 'Fine Dining', 'Other Food'],
  'Health & Wellness': ['Gym & Health Club', 'Wellness Center', 'Yoga & Pilates', 'Skin Care & Beauty', 'Healthcare Services', 'Other Wellness'],
  'Education & Training': ['Pre-school/K-12', 'Tutoring & Coaching', 'Vocational Training', 'Language School', 'Other Education'],
  'Global Pavilion': ['International Brands', 'Foreign Investment', 'Import/Export', 'Overseas Expansion'],
  'Retail & Lifestyle': ['Apparel & Fashion', 'Supermarket & Grocery', 'Electronics', 'Home & Lifestyle', 'Cosmetics', 'Other Retail'],
  'Hospitality & Stay': ['Hotels & B&B', 'Resorts', 'Travel Agency', 'Homestays', 'Other Hospitality'],
  'Kids & Entertainment': ['Play Centers', 'Themed Parks', 'Gaming Zones', 'Toy Stores', 'Other Entertainment'],
  'Ecosystem & Support': ['Consulting', 'B2B Services', 'Logistics', 'Manpower', 'Marketing'],
  'Automobile & EV': ['EV Showrooms', 'Service Centers', 'Accessories', 'Charging Stations', 'Tyres & Spares'],
  'Business Services': ['B2B Consulting', 'Facility Management', 'Legal & Accounting', 'IT Services', 'Other B2B'],
  'Home Services': ['Interior Design', 'Pest Control', 'Real Estate Brokerage', 'Home Automation', 'Other Home Services'],
  'Finance & Banking': ['NBFCs', 'Investment Services', 'Loan Hubs', 'Financial Consulting', 'Digital Banking']
};

export default function AddFranchiseForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    brandName: '',
    logo: null as File | null,
    logoPreview: '',
    category: '', // Industry
    productCategory: '',
    description: '',
    // Contact Details
    contactPersonName: '',
    designation: '',
    emailAddress: '',
    contactNumber: '',
    // Investment Range
    investmentMin: '',
    investmentMinUnit: 'Lakhs',
    investmentMax: '',
    investmentMaxUnit: 'Lakhs',
    // Franchise Fee
    franchiseFeeAmount: '',
    franchiseFeeUnit: 'Lakhs',
    royaltyAmount: '',
    royaltyUnit: '%',
    spaceMin: '',
    spaceMax: '',
    spaceUnit: 'sq ft',
    locationType: 'Mall',
    roiMin: '',
    roiMax: '',
    roiUnit: 'Months',
    breakEvenMin: '',
    breakEvenMax: '',
    breakEvenUnit: 'Months',
    totalOutlets: 0,
    cities: '',
    training: false,
    setupSupport: false,
    marketingSupport: false
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const isEmailValid = (email: string) => /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);
  const isPhoneValid = (phone: string) => /^\d{10}$/.test(phone);

  const getErrors = () => {
    const errs: Record<string, string> = {};
    if (!formData.brandName.trim()) errs.brandName = 'Required';
    if (!formData.logo) errs.logo = 'Required';
    if (!formData.category) errs.category = 'Required';
    if (!formData.productCategory) errs.productCategory = 'Required';
    if (!formData.description.trim()) errs.description = 'Required';
    
    if (!formData.contactPersonName.trim()) errs.contactPersonName = 'Required';
    
    if (!formData.emailAddress.trim()) {
      errs.emailAddress = 'Required';
    } else if (!isEmailValid(formData.emailAddress)) {
      errs.emailAddress = 'Valid email required (must contain @)';
    }

    if (!formData.contactNumber.trim()) {
      errs.contactNumber = 'Required';
    } else if (!isPhoneValid(formData.contactNumber)) {
      errs.contactNumber = 'Must be exactly 10 digits';
    }

    if (!formData.investmentMin) errs.investmentMin = 'Required';
    if (!formData.investmentMax) errs.investmentMax = 'Required';
    if (!formData.spaceMin || !formData.spaceMax) errs.spaceRequirement = 'Required';
    if (!formData.roiMin || !formData.roiMax) errs.roiTime = 'Required';
    
    if (formData.totalOutlets === null || formData.totalOutlets === undefined || String(formData.totalOutlets) === '') {
      errs.totalOutlets = 'Required';
    }

    return errs;
  };

  const errors = getErrors();

  const isStepValid = () => {
    if (step === 1) return !errors.brandName && !errors.logo && !errors.category && !errors.productCategory && !errors.description && !errors.contactPersonName && !errors.emailAddress && !errors.contactNumber;
    if (step === 2) return !errors.investmentMin && !errors.investmentMax && !errors.spaceRequirement;
    if (step === 3) return !errors.roiTime && !errors.totalOutlets;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormData(prev => ({ 
          ...prev, 
          logo: file,
          logoPreview: URL.createObjectURL(file)
        }));
        setTouched(prev => ({ ...prev, logo: true }));
      }
    } else {
      if (name === 'contactNumber') {
        setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '') }));
      } else if (name === 'emailAddress') {
        setFormData(prev => ({ ...prev, [name]: value.toLowerCase().replace(/\s/g, '') }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const validateForm = () => {
    if (!formData.brandName.trim()) return "Brand Name is required.";
    if (!formData.investmentMin.trim()) return "Investment Range (min) is required.";
    if (!formData.investmentMax.trim()) return "Investment Range (max) is required.";
    if (formData.description.length > 200) return "Description must be max 200 characters.";
    return null;
  };

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
      payload.append('company_name', formData.brandName);
      payload.append('industry', formData.category);
      payload.append('product_category', formData.productCategory);
      payload.append('about', formData.description);
      const investmentRange = `₹${formData.investmentMin} ${formData.investmentMinUnit} - ₹${formData.investmentMax} ${formData.investmentMaxUnit}`;
      const franchiseFeeStr = formData.franchiseFeeAmount ? `₹${formData.franchiseFeeAmount} ${formData.franchiseFeeUnit}` : '';
      const royaltyStr = formData.royaltyAmount ? `${formData.royaltyAmount}${formData.royaltyUnit}` : '';
      const spaceStr = `${formData.spaceMin}-${formData.spaceMax} ${formData.spaceUnit}`;

      payload.append('investment_required', investmentRange);
      payload.append('franchise_fee', franchiseFeeStr);
      payload.append('contact_person_name', formData.contactPersonName);
      payload.append('designation', formData.designation);
      payload.append('email_address', formData.emailAddress);
      payload.append('contact_number', formData.contactNumber);
      payload.append('royalty', royaltyStr);
      payload.append('space_requirement', spaceStr);
      payload.append('location_type', formData.locationType);
      
      const roiStr = `${formData.roiMin}-${formData.roiMax} ${formData.roiUnit}`;
      const breakEvenStr = formData.breakEvenMin && formData.breakEvenMax ? `${formData.breakEvenMin}-${formData.breakEvenMax} ${formData.breakEvenUnit}` : '';
      
      payload.append('roi', roiStr);
      payload.append('break_even', breakEvenStr);
      payload.append('units_operating', String(formData.totalOutlets));
      payload.append('cities', formData.cities);
      payload.append('training_support', formData.training ? 'True' : 'False');
      payload.append('setup_support', formData.setupSupport ? 'True' : 'False');
      payload.append('marketing_support', formData.marketingSupport ? 'True' : 'False');
      payload.append('source_platform', 'nfis');
      payload.append('status', 'contacted');
      
      if (formData.logo) {
        payload.append('logo', formData.logo);
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // We do not set Content-Type header so browser sets multipart/form-data with boundary
      const res = await fetch(`${API_URL}/api/franchisor-registrations/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: payload
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/franchisor'); // Back to dashboard
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2rem] p-10 shadow-2xl max-w-md w-full text-center border border-gray-100">
          <CheckCircle size={70} className="text-green-500 mx-auto mb-6 drop-shadow-md" />
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Saved Successfully!</h2>
          <p className="text-gray-500 font-medium mb-8">The franchisor profile has been fully onboarded and is now live.</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <Link href="/executive/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Franchisor Onboarding</h1>
          <p className="text-gray-500 font-medium mt-1">Detailed – Fast Completion. Capture info in under 5 minutes.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`text-xs font-black tracking-widest uppercase ${step >= s ? 'text-black' : 'text-gray-300'}`}>
                {s === 1 && 'Brand'}
                {s === 2 && 'Investment'}
                {s === 3 && 'Performance'}
                {s === 4 && 'Support'}
                {s === 5 && 'Review'}
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <Info size={20} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-xl border border-gray-100 min-h-[400px] relative overflow-hidden">
          {/* STEP 1: BRAND IDENTITY */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Brand Identity</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Brand Name <span className="text-red-500">*</span></label>
                  <input required placeholder="Enter your brand name" type="text" name="brandName" value={formData.brandName} onChange={handleChange} onBlur={handleBlur} className={`w-full px-5 py-4 bg-gray-50 border ${touched.brandName && errors.brandName ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold outline-none`} />
                  {touched.brandName && errors.brandName && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.brandName}</p>}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Brand Logo <span className="text-red-500">*</span></label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden">
                      {formData.logoPreview ? (
                        <div className="absolute inset-0">
                          <img src={formData.logoPreview} alt="Preview" className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold uppercase tracking-wider">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <UploadCloud size={30} className="mb-2 text-gray-400" />
                          <span className="text-xs font-bold">Upload (Max 2MB)</span>
                        </div>
                      )}
                      <input type="file" name="logo" accept="image/png, image/jpeg, image/svg+xml" onChange={handleChange} className="hidden" />
                    </label>
                    {touched.logo && errors.logo && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.logo}</p>}
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Industry <span className="text-red-500">*</span></label>
                      <select required name="category" value={formData.category} onChange={handleChange} onBlur={handleBlur} className={`w-full px-5 py-3.5 bg-gray-50 border ${touched.category && errors.category ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold outline-none appearance-none`}>
                        <option value="">Select an industry</option>
                        {Object.keys(PRODUCT_CATEGORIES_BY_INDUSTRY).map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                      {touched.category && errors.category && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Product Category <span className="text-red-500">*</span></label>
                      <select required disabled={!formData.category} name="productCategory" value={formData.productCategory} onChange={handleChange} onBlur={handleBlur} className={`w-full px-5 py-3.5 bg-gray-50 border ${touched.productCategory && errors.productCategory ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}>
                        <option value="">{formData.category ? 'Select a category' : 'Select Industry First'}</option>
                        {(PRODUCT_CATEGORIES_BY_INDUSTRY[formData.category] || []).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {touched.productCategory && errors.productCategory && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.productCategory}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Short Description (USP) <span className="text-red-500">*</span></label>
                  <textarea maxLength={200} required placeholder="Describe your business in 1-2 lines (what makes it unique?)" name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} className={`w-full px-5 py-4 bg-gray-50 border ${touched.description && errors.description ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold h-24 resize-none outline-none`} />
                  <div className="flex justify-between items-center mt-1">
                    {touched.description && errors.description ? <p className="text-[10px] text-red-500 font-bold">{errors.description}</p> : <div></div>}
                    <p className="text-[10px] text-gray-400 font-bold">{formData.description.length}/200</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-5">Franchisor Contact Details</h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Contact Person Name <span className="text-red-500">*</span></label>
                      <input required type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. Rajesh Sharma" className={`w-full px-5 py-4 bg-gray-50 border ${touched.contactPersonName && errors.contactPersonName ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold outline-none`} />
                      {touched.contactPersonName && errors.contactPersonName && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.contactPersonName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Designation</label>
                      <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="e.g. CEO, Franchise Head" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input required type="email" name="emailAddress" value={formData.emailAddress} onChange={handleChange} onBlur={handleBlur} placeholder="e.g. hello@brand.com" spellCheck={false} className={`w-full px-5 py-4 bg-gray-50 border ${touched.emailAddress && errors.emailAddress ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:ring-4 focus:ring-gray-200 focus:bg-white transition-all font-semibold outline-none`} />
                      {touched.emailAddress && errors.emailAddress && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.emailAddress}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number <span className="text-red-500">*</span></label>
                      <div className={`flex items-center gap-2 px-5 py-4 bg-gray-50 border ${touched.contactNumber && errors.contactNumber ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-200 transition-all`}>
                        <span className="text-gray-500 font-bold shrink-0">+91</span>
                        <div className="w-px h-5 bg-gray-300 shrink-0"></div>
                        <input required type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} onBlur={handleBlur} placeholder="98765 43210" maxLength={10} className="flex-grow bg-transparent outline-none font-semibold text-gray-900 tracking-wider" />
                      </div>
                      {touched.contactNumber && errors.contactNumber && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.contactNumber}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INVESTMENT & SPACE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Investment & Cost Setup</h2>
              
              <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100 mb-8">
                <label className="block text-xs font-black uppercase tracking-widest text-orange-800 mb-2">Total Investment Range <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2 w-full px-5 py-4 bg-white border border-orange-200 rounded-2xl focus-within:ring-4 focus-within:ring-orange-200 transition-all shadow-sm flex-wrap">
                  <span className="text-orange-500 font-bold shrink-0 text-lg">₹</span>
                  <input
                    required
                    type="number"
                    placeholder="5"
                    className="w-16 bg-transparent outline-none text-gray-900 font-black text-lg no-spinners"
                    value={formData.investmentMin}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentMin: e.target.value }))}
                  />
                  <select
                    className="bg-orange-100 text-orange-800 font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer border-0 appearance-none"
                    value={formData.investmentMinUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentMinUnit: e.target.value }))}
                  >
                    <option value="K">K</option>
                    <option value="Lakhs">Lakhs</option>
                    <option value="Crores">Crores</option>
                  </select>
                  <span className="text-orange-300 font-black px-1 text-lg">—</span>
                  <span className="text-orange-500 font-bold shrink-0 text-lg">₹</span>
                  <input
                    required
                    type="number"
                    placeholder="50"
                    className="w-16 bg-transparent outline-none text-gray-900 font-black text-lg no-spinners"
                    value={formData.investmentMax}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentMax: e.target.value }))}
                  />
                  <select
                    className="bg-orange-100 text-orange-800 font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer border-0 appearance-none"
                    value={formData.investmentMaxUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentMaxUnit: e.target.value }))}
                  >
                    <option value="K">K</option>
                    <option value="Lakhs">Lakhs</option>
                    <option value="Crores">Crores</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Franchise Fee</label>
                  <div className="flex items-center gap-2 w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-200 transition-all">
                    <span className="text-gray-500 font-bold shrink-0">₹</span>
                    <input
                      type="number"
                      placeholder="2"
                      className="w-14 bg-transparent outline-none text-gray-900 font-semibold no-spinners"
                      value={formData.franchiseFeeAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, franchiseFeeAmount: e.target.value }))}
                    />
                    <select
                      className="bg-gray-100 text-gray-700 font-semibold rounded-xl px-3 py-1.5 outline-none cursor-pointer border-0 appearance-none flex-grow"
                      value={formData.franchiseFeeUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, franchiseFeeUnit: e.target.value }))}
                    >
                      <option value="K">K</option>
                      <option value="Lakhs">Lakhs</option>
                      <option value="Crores">Crores</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Royalty / Ongoing</label>
                  <div className="flex items-center gap-2 w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-200 transition-all">
                    <select
                      className="bg-transparent outline-none text-gray-900 font-semibold flex-grow cursor-pointer appearance-none"
                      value={formData.royaltyAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, royaltyAmount: e.target.value }))}
                    >
                      <option value="">Select royalty</option>
                      <option value="None">None</option>
                      {['1','2','3','4','5','6','7','8','9','10','12','15','20'].map(v => (
                        <option key={v} value={v}>{v}%</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Space Requirement <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-200 transition-all">
                    <input
                      type="number"
                      placeholder="200"
                      className="w-16 bg-transparent outline-none text-gray-900 font-semibold no-spinners"
                      value={formData.spaceMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, spaceMin: e.target.value }))}
                    />
                    <span className="text-gray-400 font-bold">–</span>
                    <input
                      type="number"
                      placeholder="500"
                      className="w-16 bg-transparent outline-none text-gray-900 font-semibold no-spinners"
                      value={formData.spaceMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, spaceMax: e.target.value }))}
                    />
                    <select
                      className="bg-gray-100 text-gray-700 font-semibold rounded-xl px-3 py-1.5 outline-none cursor-pointer border-0 appearance-none ml-auto"
                      value={formData.spaceUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, spaceUnit: e.target.value }))}
                    >
                      <option value="sq ft">sq ft</option>
                      <option value="sq m">sq m</option>
                      <option value="sq yd">sq yd</option>
                    </select>
                  </div>
                  {touched.spaceRequirement && errors.spaceRequirement && <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.spaceRequirement}</p>}
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Location Type</label>
                  <select name="locationType" value={formData.locationType} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-200 outline-none transition-all font-semibold">
                    {['Mall', 'High Street', 'Kiosk', 'Commercial Complex', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RETURNS & PRESENCE */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Returns & Performance</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* ROI Time */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Expected ROI Time <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 w-full px-5 py-4 bg-green-50/50 border border-green-200 rounded-2xl focus-within:ring-4 focus-within:ring-green-100 transition-all">
                    <select
                      className="bg-transparent outline-none text-gray-900 font-semibold flex-1 cursor-pointer appearance-none"
                      value={formData.roiMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, roiMin: e.target.value }))}
                    >
                      <option value="">From</option>
                      {[...Array(60)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
                    </select>
                    <span className="text-green-400 font-bold shrink-0">–</span>
                    <select
                      className="bg-transparent outline-none text-gray-900 font-semibold flex-1 cursor-pointer appearance-none"
                      value={formData.roiMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, roiMax: e.target.value }))}
                    >
                      <option value="">To</option>
                      {[...Array(60)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
                    </select>
                    <select
                      className="bg-green-100 text-green-800 font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer border-0 appearance-none shrink-0"
                      value={formData.roiUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, roiUnit: e.target.value }))}
                    >
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                  {touched.roiTime && errors.roiTime && <p className="mt-1 text-[10px] text-red-500 font-bold">Required</p>}
                </div>

                {/* Break-even */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Break-even Period</label>
                  <div className="flex items-center gap-2 w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-gray-200 transition-all">
                    <select
                      className="bg-transparent outline-none text-gray-900 font-semibold flex-1 cursor-pointer appearance-none"
                      value={formData.breakEvenMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakEvenMin: e.target.value }))}
                    >
                      <option value="">From</option>
                      {[...Array(60)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
                    </select>
                    <span className="text-gray-400 font-bold shrink-0">–</span>
                    <select
                      className="bg-transparent outline-none text-gray-900 font-semibold flex-1 cursor-pointer appearance-none"
                      value={formData.breakEvenMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakEvenMax: e.target.value }))}
                    >
                      <option value="">To</option>
                      {[...Array(60)].map((_, i) => <option key={i+1} value={String(i+1)}>{i+1}</option>)}
                    </select>
                    <select
                      className="bg-gray-100 text-gray-700 font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer border-0 appearance-none shrink-0"
                      value={formData.breakEvenUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, breakEvenUnit: e.target.value }))}
                    >
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gray-100 mb-8"></div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4">Brand Presence</h3>
              <div className="grid md:grid-cols-1 gap-6">
                <div className="flex gap-4">
                  <div className="w-1/3">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Total Outlets <span className="text-red-500">*</span></label>
                    <input required placeholder="25" type="number" name="totalOutlets" value={formData.totalOutlets || ''} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-200 outline-none transition-all font-semibold no-spinners" />
                  </div>
                  <div className="w-2/3">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Cities of Operation</label>
                    <input placeholder="e.g. Mumbai, Delhi, Bangalore" type="text" name="cities" value={formData.cities} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-gray-200 outline-none transition-all font-semibold" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SUPPORT */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-4">Support & Assistance</h2>
              <p className="text-gray-500 font-medium mb-8">Select all the support and assistance you provide to franchisees.</p>
              
              <div className="grid grid-cols-1 gap-4">
                {['training', 'setupSupport', 'marketingSupport'].map((supportField) => {
                  const isChecked = formData[supportField as keyof typeof formData] as boolean;
                  const label = supportField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <label key={supportField} className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all cursor-pointer ${isChecked ? 'bg-white border-black shadow-lg shadow-black/5' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                      <div className="flex flex-col">
                         <span className={`text-lg font-bold ${isChecked ? 'text-black' : 'text-gray-600'}`}>{label}</span>
                         <span className="text-sm font-medium text-gray-400 mt-1">{isChecked ? 'Yes, we provide this' : 'Not explicitly provided'}</span>
                      </div>
                      <div className={`w-14 h-8 rounded-full relative transition-colors ${isChecked ? 'bg-black' : 'bg-gray-300'}`}>
                         <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${isChecked ? 'left-7' : 'left-1'}`}></div>
                      </div>
                      <input type="checkbox" name={supportField} checked={isChecked} onChange={handleChange} className="hidden" />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Review & Submit</h2>
              
              <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 space-y-6">
                 {/* Brand Header */}
                 <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
                    {formData.logoPreview ? (
                      <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 p-1 shrink-0 overflow-hidden">
                        <img src={formData.logoPreview} className="w-full h-full object-contain" alt="Logo preview" />
                      </div>
                    ) : ( 
                      <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                         <ImageIcon className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900">{formData.brandName || 'Untitled Brand'}</h3>
                      <p className="text-sm font-bold text-gray-500">{formData.category} {formData.productCategory ? `> ${formData.productCategory}` : ''}</p>
                    </div>
                 </div>

                 {/* Description */}
                 {formData.description && (
                   <div className="border-b border-gray-200 pb-6">
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">Short Description (USP)</p>
                     <p className="text-sm font-medium text-gray-700">{formData.description}</p>
                   </div>
                 )}

                 {/* Contact & Geography */}
                 <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-b border-gray-200 pb-6">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Contact Person</p>
                      <p className="font-bold text-gray-900">{formData.contactPersonName || '-'} {formData.designation && <span className="text-gray-500 font-medium">({formData.designation})</span>}</p>
                      <div className="text-sm font-medium text-gray-500 mt-1">
                        {formData.emailAddress && <p>{formData.emailAddress}</p>}
                        {formData.contactNumber && <p>+91 {formData.contactNumber}</p>}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Geography</p>
                      <p className="font-bold text-gray-900 mb-1">{formData.totalOutlets || '0'} Outlets</p>
                      <p className="text-sm font-medium text-gray-500 truncate">{formData.cities || 'Any City'}</p>
                    </div>
                 </div>

                 {/* Financials & Needs */}
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-4 border-b border-gray-200 pb-6">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Investment</p>
                      <p className="font-bold text-gray-900">{formData.investmentMin ? `₹${formData.investmentMin} ${formData.investmentMinUnit} — ₹${formData.investmentMax} ${formData.investmentMaxUnit}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Franchise Fee</p>
                      <p className="font-bold text-gray-900">{formData.franchiseFeeAmount ? `₹${formData.franchiseFeeAmount} ${formData.franchiseFeeUnit}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Royalty</p>
                      <p className="font-bold text-gray-900">{formData.royaltyAmount ? (formData.royaltyAmount === 'None' ? 'None' : `${formData.royaltyAmount}%`) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Space & Type</p>
                      <p className="font-bold text-gray-900">
                        {formData.spaceMin && formData.spaceMax ? `${formData.spaceMin}–${formData.spaceMax} ${formData.spaceUnit}` : '-'}
                        {formData.locationType && <span className="text-gray-400 font-medium text-xs"> ({formData.locationType})</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">ROI Time</p>
                      <p className="font-bold text-gray-900">{formData.roiMin && formData.roiMax ? `${formData.roiMin}–${formData.roiMax} ${formData.roiUnit}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Break-even</p>
                      <p className="font-bold text-gray-900">{formData.breakEvenMin && formData.breakEvenMax ? `${formData.breakEvenMin}–${formData.breakEvenMax} ${formData.breakEvenUnit}` : '-'}</p>
                    </div>
                 </div>

                 {/* Support */}
                 <div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3">Support Provided</p>
                    <div className="flex flex-wrap gap-2">
                       {formData.training || formData.setupSupport || formData.marketingSupport ? (
                         <>
                           {formData.training && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">Training</span>}
                           {formData.setupSupport && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">Setup Support</span>}
                           {formData.marketingSupport && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200">Marketing</span>}
                         </>
                       ) : (
                         <span className="text-sm font-medium text-gray-500">None explicitly stated</span>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* NEXT / BACK ACTIONS placed absolutely at the bottom of the form container */}
          <div className="mt-12 flex justify-between items-center border-t border-gray-100 pt-6">
             <button onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-0 pointer-events-auto">
               <ChevronLeft size={20} /> Back
             </button>

             {step < 5 ? (
               <button disabled={!isStepValid()} onClick={nextStep} className="flex items-center gap-2 px-8 py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed">
                 Continue <ChevronRight size={20} />
               </button>
             ) : (
               <button disabled={loading} onClick={handleSubmit} className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black tracking-widest uppercase text-sm rounded-xl transition-all shadow-xl shadow-green-500/20 active:scale-95 disabled:opacity-50">
                 {loading ? 'Publishing...' : 'Publish Profile'} <CheckCircle size={18} />
               </button>
             )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
