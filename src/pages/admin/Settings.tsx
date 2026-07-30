import React, { useState } from 'react';
import { useVehicles, sanitizeHeroImage } from '../../context/VehicleContext';
import { UploadCloud, Trash2, Plus, Image as ImageIcon, Link as LinkIcon, AlertCircle, Wifi, WifiOff, Check } from 'lucide-react';
import { uploadImageToStorage, cleanupLegacyImageVariants, supabase } from '../../lib/supabase';

export default function AdminSettings() {
  const { siteConfig, updateSiteConfig } = useVehicles();
  const [success, setSuccess] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'not_configured' | 'error'>('checking');
  const [supabaseErrorMsg, setSupabaseErrorMsg] = useState('');

  React.useEffect(() => {
    const checkConnection = async () => {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key || url === 'YOUR_SUPABASE_URL' || url === 'https://placeholder.supabase.co' || url.includes('placeholder')) {
        setSupabaseStatus('not_configured');
        return;
      }

      try {
        const { error } = await supabase.from('metadata_versions').select('key').limit(1);
        if (error) {
          setSupabaseStatus('error');
          setSupabaseErrorMsg(error.message || JSON.stringify(error));
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err: any) {
        setSupabaseStatus('error');
        setSupabaseErrorMsg(err?.message || String(err));
      }
    };

    checkConnection();
  }, []);
  
  const handleCleanupLegacyVariants = async () => {
    setIsCleaning(true);
    setErrorText('');
    try {
      const { deletedCount, errors } = await cleanupLegacyImageVariants();
      if (errors.length > 0) {
        console.error('Cleanup encountered errors:', errors);
        setErrorText(`Cleaned ${deletedCount} images but encountered ${errors.length} errors.`);
      } else {
        setSuccess(`Successfully cleaned up ${deletedCount} legacy image variants.`);
      }
      setTimeout(() => setSuccess(''), 5000);
      setTimeout(() => setErrorText(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorText('Failed to perform cleanup.');
    } finally {
      setIsCleaning(false);
    }
  };

  
  const [reelUrl, setReelUrl] = useState('');
  const [customAboutUrl, setCustomAboutUrl] = useState('');
  const [customHeroVideoUrl, setCustomHeroVideoUrl] = useState('');
  const [customHeroMobileVideoUrl, setCustomHeroMobileVideoUrl] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'aboutImage' | 'homeHeroVideo' | 'homeHeroMobileVideo' | 'homeHeroImage' | 'homeHeroMobileImage') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsCompressing(true);
      setErrorText('');
      try {
        const publicUrl = await uploadImageToStorage(file, 'site_settings', 'site_settings');
        
        updateSiteConfig({ [key]: publicUrl });
        const labels: Record<string, string> = {
          logo: 'Logo',
          homeHeroVideo: 'Home Hero Video',
          homeHeroMobileVideo: 'Home Hero Mobile Video',
          homeHeroImage: 'Home Hero Photo',
          homeHeroMobileImage: 'Home Hero Mobile Photo',
          aboutImage: 'About Image'
        };
        const labelText = labels[key] || 'Asset';
        setSuccess(`${labelText} updated successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        console.error('Image upload failed', err);
        setErrorText(err.message || 'Failed to process custom asset upload.');
        setTimeout(() => setErrorText(''), 5000);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleSaveUrl = (key: 'aboutImage' | 'homeHeroVideo' | 'homeHeroMobileVideo', url: string) => {
    if (url.trim()) {
      updateSiteConfig({ [key]: url.trim() });
      const labels: Record<string, string> = {
        homeHeroVideo: 'Hero Video URL',
        homeHeroMobileVideo: 'Hero Mobile Video URL',
        aboutImage: 'About Image URL'
      };
      const labelText = labels[key] || 'Asset URL';
      setSuccess(`${labelText} updated successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      if (key === 'homeHeroVideo') setCustomHeroVideoUrl('');
      if (key === 'homeHeroMobileVideo') setCustomHeroMobileVideoUrl('');
      if (key === 'aboutImage') setCustomAboutUrl('');
    }
  };

  const handleDeliveryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsCompressing(true);
      setErrorText('');
      try {
        const publicUrl = await uploadImageToStorage(file, 'site_settings', 'site_settings');
        
        const current = siteConfig.clientDeliveries || [];
        updateSiteConfig({ clientDeliveries: [...current, publicUrl] });
        setSuccess('Client delivery photo uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        console.error('Delivery photo upload failed', err);
        setErrorText(err.message || 'Failed to process delivery photo.');
        setTimeout(() => setErrorText(''), 5000);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleRemoveDelivery = (index: number) => {
    const current = siteConfig.clientDeliveries || [];
    const updated = current.filter((_, idx) => idx !== index);
    updateSiteConfig({ clientDeliveries: updated });
    setSuccess('Client delivery photo removed!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddReelUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (reelUrl.trim()) {
      const current = siteConfig.instagramReels || [];
      updateSiteConfig({ instagramReels: [...current, reelUrl.trim()] });
      setReelUrl('');
      setSuccess('Instagram Reel added!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleRemoveReel = (index: number) => {
    const current = siteConfig.instagramReels || [];
    const updated = current.filter((_, idx) => idx !== index);
    updateSiteConfig({ instagramReels: updated });
    setSuccess('Instagram Reel removed!');
    setTimeout(() => setSuccess(''), 3000);
  };


  return (
    <div className="space-y-8 max-w-4xl font-sans text-zinc-300">
      <div>
        <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase">Website Settings Manager</h1>
        <p className="text-zinc-400 text-xs mt-2 font-mono uppercase tracking-wider font-semibold">Manage public showroom imagery, branding, logos, and custom client delivery photos.</p>
      </div>



      <div className="bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              supabaseStatus === 'connected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              supabaseStatus === 'error' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-zinc-800 border-zinc-700 text-zinc-400'
            }`}>
              {supabaseStatus === 'connected' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-serif text-white uppercase tracking-widest">Supabase Database Health</h2>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border ${
                  supabaseStatus === 'connected' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  supabaseStatus === 'error' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}>
                  {supabaseStatus === 'connected' ? 'Connected & Active' :
                   supabaseStatus === 'error' ? 'SQL Tables Missing or Uninitialized' :
                   'Not Configured'}
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] font-mono mt-0.5">
                {supabaseStatus === 'connected' ? 'Supabase Postgres tables (vehicles, vehicle_images, site_settings) are ready.' :
                 'Your storage buckets work, but Postgres tables need to be created in Supabase SQL Editor.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const sqlScript = `-- Production Database Schema & RLS Policies for Jackpot Cars
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INT NOT NULL,
    price BIGINT NOT NULL,
    mileage INT NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    engine TEXT,
    color TEXT,
    ownership TEXT,
    registration TEXT,
    status TEXT DEFAULT 'Available',
    featured BOOLEAN DEFAULT false,
    description TEXT,
    instagram_reel TEXT,
    inspection_notes TEXT,
    features TEXT[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT,
    google_maps_url TEXT,
    about_image_url TEXT,
    home_hero_image_url TEXT,
    logo_url TEXT,
    client_deliveries TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metadata_versions (
    key TEXT PRIMARY KEY,
    version BIGINT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.metadata_versions (key, version) VALUES ('vehicles', 1) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.metadata_versions (key, version) VALUES ('site_settings', 1) ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_versions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('site_settings', 'site_settings', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access to Vehicle Images" ON storage.objects;
CREATE POLICY "Public Access to Vehicle Images" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Public Insert to Vehicle Images" ON storage.objects;
CREATE POLICY "Public Insert to Vehicle Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Public Update to Vehicle Images" ON storage.objects;
CREATE POLICY "Public Update to Vehicle Images" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicle-images');

DROP POLICY IF EXISTS "Public Access to Site Settings Images" ON storage.objects;
CREATE POLICY "Public Access to Site Settings Images" ON storage.objects FOR SELECT USING (bucket_id = 'site_settings');

DROP POLICY IF EXISTS "Public Insert to Site Settings Images" ON storage.objects;
CREATE POLICY "Public Insert to Site Settings Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site_settings');

DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are viewable by everyone" ON public.vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vehicles are insertable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are insertable by everyone" ON public.vehicles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Vehicles are updatable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are updatable by everyone" ON public.vehicles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Vehicles are deletable by everyone" ON public.vehicles;
CREATE POLICY "Vehicles are deletable by everyone" ON public.vehicles FOR DELETE USING (true);

DROP POLICY IF EXISTS "Vehicle images are viewable by everyone" ON public.vehicle_images;
CREATE POLICY "Vehicle images are viewable by everyone" ON public.vehicle_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vehicle images managed by everyone" ON public.vehicle_images;
CREATE POLICY "Vehicle images managed by everyone" ON public.vehicle_images FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Leads insertable by everyone" ON public.leads;
CREATE POLICY "Leads insertable by everyone" ON public.leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Leads viewable by everyone" ON public.leads;
CREATE POLICY "Leads viewable by everyone" ON public.leads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Site settings viewable by everyone" ON public.site_settings;
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Site settings managed by everyone" ON public.site_settings;
CREATE POLICY "Site settings managed by everyone" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Metadata viewable by everyone" ON public.metadata_versions;
CREATE POLICY "Metadata viewable by everyone" ON public.metadata_versions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Metadata managed by everyone" ON public.metadata_versions;
CREATE POLICY "Metadata managed by everyone" ON public.metadata_versions FOR ALL USING (true) WITH CHECK (true);
`;
              navigator.clipboard.writeText(sqlScript);
              setSuccess('SQL Schema copied to clipboard! Paste it into Supabase SQL Editor and click Run.');
              setTimeout(() => setSuccess(''), 6000);
            }}
            className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all shrink-0 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Copy SQL Setup Script</span>
          </button>
        </div>

        {supabaseStatus === 'error' && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs font-mono space-y-2">
            <p className="text-amber-400 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Why tables are empty or vehicle details are not updating:
            </p>
            <p className="text-zinc-300 leading-relaxed">
              Your image uploads go directly into Supabase Storage buckets, but vehicle data rows cannot be written because the database tables do not exist in your Supabase project yet.
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-white/5 space-y-1.5 text-zinc-400">
              <p className="text-white font-bold text-[11px] uppercase tracking-wider">How to enable Supabase Database in 30 seconds:</p>
              <p>1. Click the <strong className="text-white">"Copy SQL Setup Script"</strong> button above.</p>
              <p>2. Go to your <strong className="text-white">Supabase Dashboard → SQL Editor</strong>.</p>
              <p>3. Paste the script and click <strong className="text-emerald-400">Run</strong>.</p>
            </div>
            {supabaseErrorMsg && (
              <p className="text-[10px] text-zinc-500 truncate pt-1 border-t border-amber-500/10">
                Supabase query error: {supabaseErrorMsg}
              </p>
            )}
          </div>
        )}
      </div>



      <div className="bg-zinc-950/65 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl p-4 sm:p-6 md:p-8 space-y-10">
        
        {/* Logo Section */}
        <div>
          <h2 className="text-sm font-bold font-serif text-white mb-1 uppercase tracking-widest">Showroom Brand Logo</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mb-6">Updates logo displayed inside primary front-end header and footer bars.</p>
          <div className="flex flex-col md:flex-row items-stretch md:items-start gap-6">
            <div className="w-52 h-24 overflow-hidden rounded-xl border border-white/5 flex items-center justify-center p-4 bg-black/40 shrink-0 shadow-inner">
              <img src={siteConfig.logo} alt="Logo Preview" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="flex-grow space-y-4">
              <label className="block w-full cursor-pointer bg-zinc-900/25 border-2 border-dashed border-white/10 hover:border-white hover:bg-white/5 rounded-xl p-6 transition-all text-center">
                <input type="file" accept="image/*" className="hidden" disabled={isCompressing} onChange={(e) => handleImageUpload(e, 'logo')} />
                <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {isCompressing ? 'Compacting Logo...' : 'Upload New Logo'}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase tracking-wider">Supports PNG or SVGs (automatically compressed)</p>
              </label>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Home Hero Background Photo (Desktop) */}
        <div className="border-l-2 border-white pl-4">
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-sm font-serif font-bold text-white uppercase tracking-widest">Home Page Background Photo (Desktop)</h2>
            <span className="bg-white/10 text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded tracking-wider uppercase border border-white/15">Desktop</span>
            <span className="bg-white text-zinc-950 text-[8px] font-bold font-mono px-2 py-0.5 rounded tracking-wider uppercase">Active</span>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mb-6">High-resolution horizontal showcase image displayed as the desktop homepage background.</p>
          <div className="flex flex-col md:flex-row items-stretch md:items-start gap-6">
            <div className="w-52 aspect-video overflow-hidden rounded-xl border border-white/5 bg-zinc-900/30 shrink-0 relative shadow-sm flex items-center justify-center">
              {siteConfig.homeHeroImage ? (
                <img src={siteConfig.homeHeroImage} className="w-full h-full object-cover" alt="Hero Desktop Backdrop" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">No photo configured</p>
                  <p className="text-[8px] text-zinc-600 font-mono mt-1">Default dark solid background will show</p>
                </div>
              )}
            </div>
            <div className="flex-grow space-y-4">
              <label className="block w-full cursor-pointer bg-zinc-900/25 border-2 border-dashed border-white/10 hover:border-white hover:bg-white/5 rounded-xl p-6 transition-all text-center">
                <input type="file" accept="image/*" className="hidden" disabled={isCompressing} onChange={(e) => handleImageUpload(e, 'homeHeroImage')} />
                <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {isCompressing ? 'Uploading Photo...' : 'Upload Showroom Background Photo'}
                </p>
                <p className="text-[10px] text-zinc-550 font-mono mt-0.5 uppercase tracking-wider">Supports JPG, PNG format files (uploads directly to Supabase)</p>
              </label>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Home Hero Background Photo (Mobile) */}
        <div className="border-l-2 border-white pl-4">
          <div className="flex items-center space-x-2 mb-1">
            <h2 className="text-sm font-serif font-bold text-white uppercase tracking-widest">Home Page Background Photo (Mobile)</h2>
            <span className="bg-white/10 text-white text-[8px] font-bold font-mono px-2 py-0.5 rounded tracking-wider uppercase border border-white/15">Mobile</span>
            <span className="bg-white text-zinc-950 text-[8px] font-bold font-mono px-2 py-0.5 rounded tracking-wider uppercase">Active</span>
          </div>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mb-6">Optional portrait showcase image optimized for mobile devices.</p>
          <div className="flex flex-col md:flex-row items-stretch md:items-start gap-6">
            <div className="w-52 h-44 overflow-hidden rounded-xl border border-white/5 bg-zinc-900/30 shrink-0 relative shadow-sm flex items-center justify-center">
              {siteConfig.homeHeroMobileImage ? (
                <img src={siteConfig.homeHeroMobileImage} className="w-full h-full object-cover" alt="Hero Mobile Backdrop" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-[10px] text-zinc-500 font-mono uppercase">No mobile photo</p>
                  <p className="text-[8px] text-zinc-600 font-mono mt-1">Falls back to Desktop Photo</p>
                </div>
              )}
            </div>
            <div className="flex-grow space-y-4">
              <label className="block w-full cursor-pointer bg-zinc-900/25 border-2 border-dashed border-white/10 hover:border-white hover:bg-white/5 rounded-xl p-6 transition-all text-center">
                <input type="file" accept="image/*" className="hidden" disabled={isCompressing} onChange={(e) => handleImageUpload(e, 'homeHeroMobileImage')} />
                <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  {isCompressing ? 'Uploading Mobile Photo...' : 'Upload Mobile Background Photo'}
                </p>
                <p className="text-[10px] text-zinc-550 font-mono mt-0.5 uppercase tracking-wider">Supports JPG, PNG format files (uploads directly to Supabase)</p>
              </label>
            </div>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Client Delivery Photos Manager */}
        <div>
          <h2 className="text-sm font-bold font-serif text-white mb-1 uppercase tracking-widest">Client Delivery Wall of Fame</h2>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mb-6">Manage delivery celebration photos rendered in the public customer about page.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left: Add Delivery Photo Tools */}
            <div className="space-y-6">
              <div className="border border-white/5 p-6 rounded-2xl bg-zinc-900/20 shadow-lg">
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mb-4 flex items-center font-mono">
                  <ImageIcon className="w-4 h-4 mr-2 text-zinc-400" />
                  Upload Local File
                </h3>
                <label className="block w-full cursor-pointer bg-zinc-950 border border-dashed border-white/10 hover:border-white hover:bg-white/5 rounded-xl p-6 transition-all text-center">
                  <input type="file" accept="image/*" className="hidden" disabled={isCompressing} onChange={handleDeliveryUpload} />
                  <UploadCloud className="w-6 h-6 text-zinc-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                    {isCompressing ? 'Compacting Photograph...' : 'Upload Patron Moment'}
                  </p>
                  <p className="text-[9px] text-zinc-550 font-mono mt-0.5 uppercase tracking-wider font-semibold">PNG, JPG, JPEG files (Max 2MB)</p>
                </label>
              </div>
            </div>

            {/* Right: Current Grid Preview */}
            <div className="border border-white/5 p-6 rounded-2xl bg-zinc-950/40 shadow-lg">
              <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-4 font-mono">
                Current Delivery Gallery ({(siteConfig.clientDeliveries || []).length})
              </h3>
              
              {(!siteConfig.clientDeliveries || siteConfig.clientDeliveries.length === 0) ? (
                <div className="text-center py-10 text-zinc-600 font-mono text-[10px] uppercase tracking-wider">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                  No delivery photos uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {(siteConfig.clientDeliveries || []).map((img, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden border border-white/5 bg-zinc-900/50 aspect-[4/3] shadow-inner">
                      <img src={img} alt={`Patron Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[1px]">
                        <button 
                          onClick={() => handleRemoveDelivery(idx)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl shadow-md hover:scale-105 transition-all"
                          title="Remove Photograph"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 bg-zinc-950/85 text-[8px] font-bold tracking-widest uppercase text-white px-2 py-0.5 rounded border border-white/5 font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        <hr className="border-white/5" />

        {/* Instagram Reels Manager */}
        <div>
          <h2 className="text-sm font-bold font-serif text-white mb-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> Linked Instagram Reels Feed
          </h2>
          <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-wider mb-6">Link and arrange your Instagram Reels to showcase actual highlight clips on your home and inventory pages.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left: Add Reel Link */}
            <div className="space-y-6">
              <form onSubmit={handleAddReelUrl} className="border border-white/5 p-6 rounded-2xl bg-zinc-900/20 shadow-lg space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase flex items-center font-mono">
                  <LinkIcon className="w-4 h-4 mr-2 text-zinc-400" />
                  Add Instagram Reel URL
                </h3>
                <div className="text-[10px] text-zinc-500 space-y-1 font-mono uppercase bg-black/30 p-4 rounded-xl border border-white/5">
                  <p className="text-white font-bold">Supported Formats:</p>
                  <p>• https://www.instagram.com/reel/C8O7w-pS9f3/</p>
                  <p>• https://www.instagram.com/p/C3_Y2I1S_0r/</p>
                  <p className="text-zinc-650 mt-2 text-[9px] normal-case">Linked reels render as fully interactive embedded players on the live website.</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="url"
                    value={reelUrl}
                    onChange={(e) => setReelUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/..."
                    className="flex-grow text-xs px-4 py-3 border border-white/5 bg-zinc-950 rounded-xl text-white outline-none placeholder-zinc-700/60 focus:border-white transition-all font-mono"
                  />
                  <button 
                    type="submit"
                    className="bg-white hover:bg-zinc-900 text-zinc-950 hover:text-white border border-transparent hover:border-white/20 font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-mono transition-all flex items-center shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Reels List with ID extraction */}
            <div className="border border-white/5 p-6 rounded-2xl bg-zinc-950/40 shadow-lg">
              <h3 className="text-[10px] font-bold text-white tracking-widest uppercase mb-4 font-mono">
                Current Connected Reels ({(siteConfig.instagramReels || []).length})
              </h3>
              
              {(!siteConfig.instagramReels || siteConfig.instagramReels.length === 0) ? (
                <div className="text-center py-10 text-zinc-600 font-mono text-[10px] uppercase tracking-wider">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-zinc-700" />
                  No Instagram Reels linked yet.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                  {(siteConfig.instagramReels || []).map((url, idx) => {
                    const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/)([A-Za-z0-9_-]+)/);
                    const reelId = match ? match[1] : null;
                    return (
                      <div key={idx} className="flex items-center gap-4 bg-zinc-900/30 border border-white/5 rounded-xl p-3.5 justify-between group">
                        <div className="truncate flex-grow">
                          <p className="text-[8px] font-mono font-bold text-zinc-400">REEL #{idx + 1}</p>
                          <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">{url}</p>
                          {reelId && (
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-white/10 border border-white/20 text-white px-1.5 py-0.5 rounded mt-1.5 inline-block font-mono">
                              ID: {reelId}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleRemoveReel(idx)}
                          className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                          title="Remove Reel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
