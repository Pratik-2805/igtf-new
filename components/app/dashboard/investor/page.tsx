'use client';

import { useEffect, useState, useCallback } from 'react';
import NextImage from 'next/image';
import { RefreshCw, Save, TrendingUp, PieChart, Wallet, Target, Briefcase, MapPin, Upload, Camera, X } from 'lucide-react';
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

// THE FIELDS THE INVESTOR MANAGAES
const INVESTOR_MANAGEABLE_FIELDS = [
  'full_name',
  'firm_name',
  'logo',
  'phone_number',
  'investment_budget',
  'interested_sector',
  'about',
  'business_experience',
  'companies_financed',
  'preferred_location'
];

export default function InvestorDashboard() {
  const [profile, setProfile] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Logo Cropping State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/investor-registrations/`);
      if (res.ok) {
        const data = await res.json();
        const profileData = Array.isArray(data) ? data[0] : data.results ? data.results[0] : data;
        if (profileData) {
          const initializedProfile = { ...profileData };
          INVESTOR_MANAGEABLE_FIELDS.forEach(field => {
             if (!(field in initializedProfile)) initializedProfile[field] = '';
          });
          setProfile(initializedProfile);
        }
      }
    } catch (err) {
      toast.error('Failed to reload your portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
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
      const file = new File([croppedBlob], 'logo.jpg', { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(croppedBlob);
      setProfile(prev => ({ ...prev, logo: previewUrl, _logo_file: file }));
      setShowCropper(false);
      setImageSrc(null);
      toast.success('Identity visual updated!');
    } catch (e) {
      toast.error('Identity secure crop failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const profileId = profile.id;
    if (!profileId) { toast.error('Account not synced correctly'); setSaving(false); return; }

    try {
      const payload = new FormData();
      INVESTOR_MANAGEABLE_FIELDS.forEach(field => {
        if (field === 'logo') return;
        if (profile[field] !== null && profile[field] !== undefined) {
          payload.append(field, profile[field]);
        }
      });
      
      if (profile._logo_file) {
        payload.append('logo', profile._logo_file);
      }
      
      const res = await authFetchForm(`${API_URL}/api/investor-registrations/${profileId}/`, {
        method: 'PATCH',
        body: payload
      });
      
      if (res.ok) {
        const updated = await res.json();
        setProfile(prev => ({ ...prev, ...updated }));
        toast.success('Capital allocation preferences updated!');
      } else {
        const errorData = await res.json();
        const errorMsg = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        toast.error(errorMsg || 'Failed to update preferences');
      }
    } catch (err) {
      toast.error('Network error during synchronization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[500px]">
           <RefreshCw className="animate-spin text-blue-600 mb-6" size={40} />
           <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Accessing Secure Vault...</p>
        </div>
     );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl w-full">
      {loading && <LoadingScreen />}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
          <div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">Investor Console</h1>
            <p className="text-xl text-gray-500 font-medium">Strategize your capital across India's booming franchise sectors.</p>
          </div>
          <div className="flex gap-4">
            <div className="group flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 shadow-xl rounded-2xl transition-all hover:scale-105">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Wallet size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Tier</p>
                  <p className="text-sm font-bold text-gray-900">PREMIUM INVESTOR</p>
               </div>
            </div>
          </div>
        </div>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
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
                      <div className="w-full h-full rounded-2xl border-4 border-blue-50 overflow-hidden bg-gray-50 flex items-center justify-center relative">
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
                         <label className="absolute inset-0 bg-blue-700/80 opacity-0 group-hover/logo:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-white gap-2">
                            <Camera size={24} />
                            <span className="text-[10px] font-black uppercase">Upload</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                         </label>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg pointer-events-none">
                         <Upload size={14} />
                      </div>
                   </div>
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Portfolio Readiness</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Target size={16}/></div>
                      <div>
                         <p className="text-xs font-bold text-gray-900 mb-1">Target Matching</p>
                         <p className="text-[10px] text-gray-500 leading-tight">Your criteria align with 142 new opportunities.</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Briefcase size={16}/></div>
                      <div>
                         <p className="text-xs font-bold text-gray-900 mb-1">Deal Flow</p>
                         <p className="text-[10px] text-gray-500 leading-tight">High activity in selected sectors (Food, Tech).</p>
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
             <p className="text-xs text-blue-300 font-medium mb-6 leading-relaxed">System-generated insights help allocate capital where ROI is highest.</p>
             <button type="button" onClick={fetchProfile} className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold tracking-widest uppercase transition-all">Audit Synced Data</button>
          </div>
        </div>

        {/* Main Console: Configuration */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 h-20 w-40 opacity-5 pointer-events-none">
             <MapPin size={100} />
          </div>
          
          <div className="p-8 md:p-14">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 tracking-tight">Investment Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
              {INVESTOR_MANAGEABLE_FIELDS.map((key) => {
                const value = profile[key];
                const label = key === 'about' ? 'About' : key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const isTextArea = key === 'about' || key === 'experience';
                const isFullRange = key === 'preferred_industries' || key === 'preferred_locations';

                return (
                  <div key={key} className={isTextArea || isFullRange ? 'md:col-span-2' : ''}>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                      {label}
                    </label>
                    {isTextArea ? (
                      <textarea
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        rows={5}
                        className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-transparent rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 resize-none font-medium leading-relaxed"
                        placeholder={`Strategize your ${label.toLowerCase()}...`}
                      />
                    ) : key === 'investment_budget' ? (
                      <div className="flex items-center gap-1 sm:gap-2 w-full px-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-[2.5rem] focus-within:bg-white focus-within:ring-8 focus-within:ring-blue-500/5 focus-within:border-blue-600 transition-all duration-500 overflow-hidden">
                        <span className="text-gray-500 font-bold shrink-0">₹</span>
                        <input type="number" placeholder="10" className="min-w-0 w-8 sm:w-12 bg-transparent outline-none text-gray-900 font-black text-lg no-spinners"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const minUnit = currentParts[0]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh';
                            handleChange(key, `₹${e.target.value} ${minUnit} - ${currentParts[1] || '₹0 Lakh'}`);
                          }}
                          value={(value || '').split(' - ')[0]?.match(/₹?([\d.]+)/)?.[1] || ''}
                        />
                        <select className="bg-transparent outline-none text-gray-600 font-semibold appearance-none cursor-pointer px-1 shrink-0"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const minNum = currentParts[0]?.match(/₹?([\d.]+)/)?.[1] || '0';
                            handleChange(key, `₹${minNum} ${e.target.value} - ${currentParts[1] || '₹0 Lakh'}`);
                          }}
                          value={(value || '').split(' - ')[0]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh'}
                        >
                          <option value="K">K</option><option value="Lakh">Lakh</option><option value="Crore">Crore</option>
                        </select>
                        <span className="text-gray-400 font-black px-0.5 shrink-0">-</span>
                        <span className="text-gray-500 font-bold shrink-0">₹</span>
                        <input type="number" placeholder="50" className="min-w-0 w-8 sm:w-12 bg-transparent outline-none text-gray-900 font-black text-lg no-spinners"
                          onChange={(e) => {
                            const currentParts = (value || '₹0 Lakh - ₹0 Lakh').split(' - ');
                            const maxUnit = currentParts[1]?.match(/(K|Lakh|Crore)/i)?.[0] || 'Lakh';
                            handleChange(key, `${currentParts[0] || '₹0 Lakh'} - ₹${e.target.value} ${maxUnit}`);
                          }}
                          value={(value || '').split(' - ')[1]?.match(/₹?([\d.]+)/)?.[1] || ''}
                        />
                        <select className="bg-transparent outline-none text-gray-600 font-semibold appearance-none cursor-pointer px-1 shrink-0"
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
                    ) : (
                      <input
                        type={key.includes('number') ? 'tel' : 'text'}
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="block w-full px-8 py-6 bg-gray-50/50 border-2 border-transparent rounded-[2.5rem] text-gray-900 focus:bg-white focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all duration-500 font-black text-lg"
                        placeholder={`Define ${label.toLowerCase()}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-8 md:px-14 py-10 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm font-medium text-gray-400">All capital targeting is encrypted via bank-grade protocols.</p>
            <button
              type="submit"
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-4 px-14 py-6 bg-blue-700 text-white font-black rounded-3xl shadow-2xl shadow-blue-700/30 hover:shadow-blue-700/50 hover:-translate-y-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 uppercase tracking-tighter text-lg"
            >
              {saving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} />}
              {saving ? 'Synchronizing...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </form>
      {showCropper && imageSrc && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center text-gray-900 font-bold">
               <h3 className="text-2xl font-black tracking-tighter uppercase">Sync Identity Visual</h3>
               <button onClick={() => setShowCropper(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <X size={24} />
               </button>
            </div>
            <div className="relative h-[400px] bg-gray-900">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
                  <span>Zoom Scale</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCropper(false)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl uppercase tracking-widest text-xs"
                >
                  ABORT
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 py-4 bg-blue-700 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-blue-700/20"
                >
                  SECURE & SYNC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
