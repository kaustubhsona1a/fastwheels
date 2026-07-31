import React, { useState, FormEvent, useRef, DragEvent, ChangeEvent } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { uploadImageToStorage } from '../lib/supabase';
import { Camera, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

export default function SellCar() {
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { addLead } = useVehicles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    name: '',
    phone: '',
    ownership: 'First',
    notes: ''
  });

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files).filter((file: any) => file.type.startsWith('image/')) as File[];
      addFiles(filesArray);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files).filter((file: any) => file.type.startsWith('image/')) as File[];
      addFiles(filesArray);
    }
  };

  const addFiles = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create local blob URLs for immediate premium preview rendering
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Clean up memory leaks for Object URLs
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUploads = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const path = `leads/l_${Date.now()}`;
      const url = await uploadImageToStorage(file, path, 'vehicle-images');
      urls.push(url);
      console.log('[LEAD UPLOAD SUCCESS]', url);
    }
    return urls;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // 1. Process all selected images
      const uploadedImageUrls = await handleImageUploads(selectedFiles);
      
      // 2. Format details and message
      const formattedMessage = `${formData.year} ${formData.make} ${formData.model} (${Number(formData.mileage).toLocaleString()} KM)\nOwnership: ${formData.ownership} Owner${formData.notes ? `\n\nNotes from Owner:\n${formData.notes}` : ''}`;
      
      // 3. Submit lead via useVehicles context hook
      await addLead({
        name: formData.name,
        phone: formData.phone,
        car: formattedMessage,
        images: uploadedImageUrls
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failure:', err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ make: '', model: '', year: '', mileage: '', name: '', phone: '', ownership: 'First', notes: '' });
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-transparent py-16 font-sans text-zinc-305 z-10 relative">
      <div className="container mx-auto max-w-3xl px-4">
        
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-[#E63946] tracking-[0.2em] uppercase text-xs font-semibold mb-3 block font-mono font-bold">Instant Asset Liquidation</span>
          <h1 className="text-xl sm:text-3xl md:text-5xl font-orbitron font-bold text-white tracking-wider uppercase mb-5">Unlock Maximum Residual Value</h1>
          <p className="text-base text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            We acquire premium on-road vehicles through a curated diagnostic walkthrough. Provide your vehicle details below for a professional, pressure-free evaluation.
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#171717] border border-[#C1121F]/30 rounded-2xl shadow-xl p-14 text-center backdrop-blur-md">
            <div className="w-16 h-16 border border-[#E63946] text-[#E63946] rounded-2xl flex items-center justify-center mx-auto mb-6 bg-[#C1121F]/20">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white mb-2">Request Lodged</h2>
            <p className="text-zinc-400 mb-8 tracking-wider uppercase text-[10px] leading-relaxed font-mono font-bold">Our purchase team will contact you within 2 business hours.</p>
            <button onClick={resetForm} className="px-8 py-3.5 bg-[#C1121F] hover:bg-[#FF3B3B] text-white border border-[#E63946]/50 rounded-xl uppercase tracking-widest text-xs font-bold transition-all duration-300 font-mono shadow-md">
              Submit Another Asset
            </button>
          </div>
        ) : (
          <div className="bg-[#171717] border border-[#C1121F]/30 shadow-2xl rounded-2xl p-8 md:p-12 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#E63946] mb-6 border-b border-[#C1121F]/30 pb-3 font-mono">Section A: Vehicle Specs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="make" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Brand / Make</label>
                    <input id="make" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="e.g. BMW" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="model" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Model Name</label>
                    <input id="model" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="e.g. X5" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="year" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Registration Year</label>
                    <input id="year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="e.g. 2022" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="mileage" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Odometer Reading (KM)</label>
                    <input id="mileage" type="number" value={formData.mileage} onChange={e => setFormData({...formData, mileage: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="e.g. 18500" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Ownership History</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                      {['First', 'Second', 'Third', 'Fourth+'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormData({...formData, ownership: opt})}
                          className={`py-3 px-4 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all border ${
                            formData.ownership === opt 
                              ? 'bg-[#C1121F] border-[#E63946] text-white shadow-md scale-[1.02]'
                              : 'bg-[#050505] border-zinc-800 text-zinc-400 hover:border-[#E63946] hover:text-white'
                          }`}
                        >
                          {opt} Owner
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#E63946] mb-6 border-b border-[#C1121F]/30 pb-3 font-mono">Section B: Owner Contacts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Full Name</label>
                    <input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="Enter name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Active Contact Number</label>
                    <input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="+91" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="block text-[10px] tracking-wider uppercase text-zinc-400 font-mono font-bold">Additional Specifications (Optional)</label>
                <textarea id="notes" rows={4} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-[#050505] border border-[#C1121F]/40 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#E63946] transition-all font-mono" placeholder="e.g. Single owner, insurance active till Dec 2026, ceramic coating..." />
              </div>

              <div>
                <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#E63946] mb-6 border-b border-[#C1121F]/30 pb-3 font-mono">Section C: Media Attachments (Optional)</h3>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                    isDragActive 
                      ? 'border-[#E63946] bg-[#C1121F]/10' 
                      : 'border-zinc-800 bg-[#050505] hover:border-[#E63946]/60 hover:bg-[#121212]'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    id="lead-photos"
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                  <Upload className="w-8 h-8 text-[#E63946] mb-3" />
                  <p className="text-zinc-300 text-xs font-semibold uppercase tracking-wider font-mono">Drag and drop images here</p>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider mt-1.5">or click to browse from device</p>
                </div>

                {/* Previews Grid */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {previewUrls.map((url, index) => (
                      <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border border-[#C1121F]/30 bg-[#050505]">
                        <img 
                          src={url} 
                          alt={`Upload Preview ${index + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-[#C1121F] text-white rounded-lg transition-all border border-white/10"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-[#C1121F] disabled:bg-zinc-900 disabled:text-zinc-500 hover:bg-[#FF3B3B] text-white py-4.5 rounded-xl uppercase tracking-widest text-xs font-bold transition-all duration-300 border border-[#E63946]/50 font-mono shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Uploading asset data & compressing images...
                  </>
                ) : (
                  "Submit Asset details for Appraisal"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
