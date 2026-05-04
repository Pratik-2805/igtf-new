'use client';

import { useEffect, useState, useCallback } from 'react';
import NextImage from 'next/image';
import { RefreshCw, Save, Upload, Camera, X, AlertCircle } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import { toast } from 'sonner';
import { authFetch, authFetchForm } from '@/lib/authFetch';
import LoadingScreen from '@/components/loading-screen';

const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas is empty')); return; }
      resolve(blob);
    }, 'image/jpeg');
  });
};

// THESE ARE THE ONLY FIELDS THE USER SHOULD MANAGE
const MANAGEABLE_FIELDS = [
  'company_name',
  'contact_person_name',
  'logo',
  'designation',
  'company_address',
  'industry',
  'product_category',
  'about',
  'founded_year',
  'investment_required',
  'franchise_fee',
  'royalty',
  'space_requirement',
  'location_type',
  'roi',
  'break_even',
  'units_operating',
  'cities',
  'training_support',
  'setup_support',
  'marketing_support'
];

const READONLY_FIELDS = [
  'email_address',
  'contact_number'
];

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

export default function FranchisorDashboard() {
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noProfile, setNoProfile] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchProfile = async () => {
    setLoading(true);
    setNoProfile(false);
    try {
      const token = localStorage.getItem('access_token');
      const userEmail = localStorage.getItem('user_email');

      // On NFIS, fetching shouldn't strictly require a valid token if we can identify via email
      // We try the token first, but fallback to a public email-based search
      let res;
      if (token) {
        res = await authFetch(`${API_URL}/api/franchisor-registrations/`);
      } else if (userEmail) {
        res = await fetch(`${API_URL}/api/franchisor-registrations/?email_address=${userEmail}`);
      } else {
        toast.error('Login session not found. Please sign in.');
        setNoProfile(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        // If it's a 401/403 and we have an email, try the public route as a fallback
        if ((res.status === 401 || res.status === 403) && userEmail) {
          res = await fetch(`${API_URL}/api/franchisor-registrations/?email_address=${userEmail}`);
        }

        if (!res.ok) {
          toast.error(`Could not retrieve brand data (${res.status})`);
          setNoProfile(true);
          setLoading(false);
          return;
        }
      }

      const data = await res.json();
      const records = Array.isArray(data) ? data : data.results ?? [];

      if (records.length === 0) {
        setNoProfile(true);
        setLoading(false);
        return;
      }

      const profileData = records[0];

      // Ensure all manageable fields exist in the state even if not in the initial response
      const initializedProfile: Record<string, any> = { ...profileData };
      MANAGEABLE_FIELDS.forEach(field => {
        if (!(field in initializedProfile)) initializedProfile[field] = '';
      });
      READONLY_FIELDS.forEach(field => {
        if (!(field in initializedProfile)) initializedProfile[field] = '';
      });
      setProfile(initializedProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Network error. Could not load profile data.');
      setNoProfile(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
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
      const file = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(croppedBlob);
      // Map the file properly in profile data state
      setProfile(prev => ({ ...prev, logo: previewUrl, _logo_file: file }));
      setShowCropper(false);
      setImageSrc(null);
      toast.success('Logo cropped!');
    } catch (e) {
      toast.error('Failed to crop image');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const profileId = profile.id;
    if (!profileId) { toast.error('No profile ID found'); setSaving(false); return; }

    try {
      const token = localStorage.getItem('access_token');
      const payload = new FormData();

      // ONLY send manageable fields
      MANAGEABLE_FIELDS.forEach(field => {
        if (field === 'logo') return; // Handled separately
        if (profile[field] !== null && profile[field] !== undefined) {
          payload.append(field, profile[field]);
        }
      });

      // Send the file blob using the explicit field "logo" 
      if (profile._logo_file) {
        payload.append('logo', profile._logo_file);
      }

      const res = await authFetchForm(`${API_URL}/api/franchisor-registrations/${profileId}/`, {
        method: 'PATCH',
        body: payload
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(prev => ({ ...prev, ...updated }));
        toast.success('Changes saved successfully');
      } else {
        const errorData = await res.json();
        const errorMsg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        toast.error(errorMsg || 'Save failed. Please check your data.');
      }
    } catch (err) {
      toast.error('Network error during save');
    } finally {
      setSaving(false);
    }
  };


  if (noProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <AlertCircle className="text-red-500" size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-3">No franchisor profile found</h2>
        <p className="text-gray-500 font-medium max-w-md mb-8 leading-relaxed">
          Your account doesn&apos;t have a registered franchisor profile linked to it yet.
          Please complete the registration process first, or contact support if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/register" className="px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm">
            Register as Franchisor
          </a>
          <button onClick={fetchProfile} className="px-8 py-4 border-2 border-gray-200 text-gray-700 font-black rounded-2xl hover:border-red-300 hover:text-red-600 transition-all uppercase tracking-widest text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl w-full">
      {loading && <LoadingScreen />}
      <header className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">NFIS Brand Console</h1>
        <p className="text-gray-500 text-lg font-medium">Manage only the essential details required for your presence.</p>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-400"></div>
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Camera size={20} className="text-red-500" />Brand Identity</h3>
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer w-48 h-48 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner bg-gray-50 mb-6 transition-all hover:scale-[1.02]">
                {profile.logo ? (
                  <NextImage
                    src={profile.logo}
                    alt="Logo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <Upload size={48} strokeWidth={1} />
                    <span className="text-xs font-bold mt-2 uppercase tracking-tighter">No Logo</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <Camera className="text-white mb-2" size={32} />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Update Logo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                </label>
              </div>
              <p className="text-xs text-center text-gray-400 font-medium px-4 leading-relaxed">Recommended for event collateral: 512x512px SVG or PNG.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Manageable Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">

              {/* Render Read-Only Fields */}
              {READONLY_FIELDS.map((key) => {
                const value = profile[key];
                const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return (
                  <div key={key}>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{label} <span className="text-[9px] text-red-500">(Non-editable)</span></label>
                    <input type="text" value={value || ''} disabled className="block w-full px-5 py-4 bg-gray-100/50 border-2 border-transparent rounded-2xl text-gray-500 cursor-not-allowed font-semibold" />
                  </div>
                );
              })}

              {/* Render Editable Fields */}
              {MANAGEABLE_FIELDS.map((key) => {
                if (key === 'logo') return null; // We handle logo outside of the generic grid
                const value = profile[key];
                const label = key === 'about' ? 'About' : key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const isTextArea = key === 'company_address' || key === 'about';
                return (
                  <div key={key} className={isTextArea ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{label}</label>
                    {isTextArea ? (
                      <textarea value={value || ''} onChange={(e) => handleChange(key, e.target.value)} rows={5} className="block w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 resize-none font-medium leading-relaxed" placeholder={`Enter ${label.toLowerCase()}`} />
                    ) : key === 'industry' ? (
                      <select value={value || ''} onChange={(e) => handleChange(key, e.target.value)} className="block w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 font-semibold appearance-none">
                        <option value="">Select an industry</option>
                        {Object.keys(PRODUCT_CATEGORIES_BY_INDUSTRY).map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                        {value && !PRODUCT_CATEGORIES_BY_INDUSTRY[value] && (
                          <option value={value}>{value}</option>
                        )}
                      </select>
                    ) : key === 'location_type' ? (
                      <select value={value || ''} onChange={(e) => handleChange(key, e.target.value)} className="block w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 font-semibold appearance-none">
                        <option value="">Select location type</option>
                        {['Mall', 'High Street', 'Kiosk', 'Commercial Complex', 'Other'].map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                        {value && !['Mall', 'High Street', 'Kiosk', 'Commercial Complex', 'Other'].includes(value) && (
                          <option value={value}>{value}</option>
                        )}
                      </select>
                    ) : key === 'product_category' ? (
                      <select value={value || ''} onChange={(e) => handleChange(key, e.target.value)} disabled={!profile.industry} className="block w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 font-semibold appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                        <option value="">{profile.industry ? 'Select a category' : 'Select Industry First'}</option>
                        {(PRODUCT_CATEGORIES_BY_INDUSTRY[profile.industry] || []).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        {value && !(PRODUCT_CATEGORIES_BY_INDUSTRY[profile.industry] || []).includes(value) && (
                          <option value={value}>{value}</option>
                        )}
                      </select>
                    ) : key === 'founded_year' ? (
                      <select value={value || ''} onChange={(e) => handleChange(key, e.target.value)} className="block w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 font-semibold appearance-none">
                        <option value="">Select year</option>
                        {Array.from({ length: 75 }, (_, i) => new Date().getFullYear() - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    ) : key === 'investment_required' ? (
                      <div className="flex items-center gap-1 sm:gap-2 w-full px-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-500 transition-all duration-300 overflow-hidden">
                        <span className="text-gray-500 font-bold shrink-0">₹</span>
                        <input type="number" placeholder="10" className="min-w-0 w-8 sm:w-12 bg-transparent outline-none text-gray-900 font-semibold no-spinners"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const minUnit = currentParts[0]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh';
                            handleChange(key, `₹${e.target.value} ${minUnit} - ${currentParts[1] || '₹0 Lakh'}`);
                          }}
                          value={(value || '').split(' - ')[0]?.match(/₹?([\d.]+)/)?.[1] || ''}
                        />
                        <select className="bg-transparent outline-none text-gray-600 font-semibold appearance-none cursor-pointer shrink-0"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const minNum = currentParts[0]?.match(/₹?([\d.]+)/)?.[1] || '0';
                            handleChange(key, `₹${minNum} ${e.target.value} - ${currentParts[1] || '₹0 Lakh'}`);
                          }}
                          value={(value || '').split(' - ')[0]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh'}
                        >
                          <option value="K">K</option><option value="Lakh">Lakh</option><option value="Crore">Crore</option>
                        </select>
                        <span className="text-gray-400 font-black shrink-0 px-0.5">-</span>
                        <span className="text-gray-500 font-bold shrink-0">₹</span>
                        <input type="number" placeholder="50" className="min-w-0 w-8 sm:w-12 bg-transparent outline-none text-gray-900 font-semibold no-spinners"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const maxUnit = currentParts[1]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh';
                            handleChange(key, `${currentParts[0] || '₹0 Lakh'} - ₹${e.target.value} ${maxUnit}`);
                          }}
                          value={(value || '').split(' - ')[1]?.match(/₹?([\d.]+)/)?.[1] || ''}
                        />
                        <select className="bg-transparent outline-none text-gray-600 font-semibold appearance-none cursor-pointer shrink-0"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const maxNum = currentParts[1]?.match(/₹?([\d.]+)/)?.[1] || '0';
                            handleChange(key, `${currentParts[0] || '₹0 Lakh'} - ₹${maxNum} ${e.target.value}`);
                          }}
                          value={(value || '').split(' - ')[1]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh'}
                        >
                          <option value="K">K</option><option value="Lakh">Lakh</option><option value="Crore">Crore</option>
                        </select>
                      </div>
                    ) : key === 'roi' ? (
                      <div className="flex items-center gap-2 w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-500 transition-all duration-300">
                        <input type="text" value={value || ''} onChange={(e) => handleChange(key, e.target.value)} className="bg-transparent outline-none text-gray-900 font-semibold flex-grow no-spinners" placeholder="e.g. 12-18 months" />
                      </div>
                    ) : key === 'training_support' || key === 'setup_support' || key === 'marketing_support' ? (
                      <label className={`flex items-center justify-between p-5 mt-1 rounded-2xl border-2 transition-colors cursor-pointer ${value ? 'bg-red-50 border-red-200' : 'bg-gray-50/50 border-transparent hover:border-gray-200'}`}>
                        <span className={`text-sm font-bold ${value ? 'text-red-900' : 'text-gray-600'}`}>{value ? 'Provided' : 'Not Provided'}</span>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${value ? 'bg-red-500' : 'bg-gray-300'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${value ? 'left-7' : 'left-1'}`}></div>
                        </div>
                        <input type="checkbox" checked={!!value} onChange={(e) => setProfile(prev => ({ ...prev, [key]: e.target.checked }))} className="hidden" />
                      </label>
                    ) : (
                      <input type={key.includes('email') ? 'email' : key.includes('number') || key === 'units_operating' ? 'number' : 'text'} value={value || ''} onChange={(e) => handleChange(key, e.target.value)} className="block w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-gray-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all duration-300 font-semibold no-spinners" placeholder={`Enter ${label.toLowerCase()}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="px-8 md:px-12 py-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-3 px-10 py-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 uppercase tracking-widest text-sm">{saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}{saving ? 'Synchronizing...' : 'Save Configuration'}</button>
          </div>
        </div>
      </form>

      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center"><h3 className="text-2xl font-bold text-gray-900">Crop Logo</h3><button onClick={() => setShowCropper(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button></div>
            <div className="relative h-[400px] bg-gray-900"><Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} /></div>
            <div className="p-8 space-y-8">
              <div className="space-y-4"><div className="flex justify-between text-sm font-bold text-gray-500 uppercase"><span>Zoom</span><span>{Math.round(zoom * 100)}%</span></div><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600" /></div>
              <div className="flex gap-4"><button onClick={() => setShowCropper(false)} className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl">CANCEL</button><button onClick={handleCropSave} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl uppercase tracking-widest">Apply</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
