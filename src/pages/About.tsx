import { Star, X, ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Award, Heart, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { MOCK_REVIEWS } from '../data/mockData';
import React, { useState } from 'react';

export default function About() {
  const { siteConfig } = useVehicles();
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  const deliveries = siteConfig.clientDeliveries || [];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveries.length === 0) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev + 1) % deliveries.length : 0));
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deliveries.length === 0) return;
    setActivePhotoIndex((prev) => (prev !== null ? (prev - 1 + deliveries.length) % deliveries.length : 0));
  };

  return (
    <div className="bg-transparent text-zinc-300 font-sans min-h-screen">
      {/* Client Deliveries Section */}
      <section className="pt-20 sm:pt-28 pb-12 sm:pb-20 bg-transparent relative z-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-8 sm:mb-16 animate-fade-in">
            <span className="text-white tracking-[0.2em] uppercase text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 block font-mono">
              MOMENTS OF JOY
            </span>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-orbitron font-extrabold text-white tracking-wider uppercase mb-3 sm:mb-4">
              MEMORIES <span className="text-zinc-400">ON</span> THE <span className="text-white">ROAD</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light px-2">
              Real, candid snapshots of happy keys and vehicle handovers outside our Boutique. Feel the legacy we've built, one smile at a time!
            </p>
          </div>

          {/* Modern Cinematic Photo Wall */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 pt-2 sm:pt-6">
            {deliveries.map((img, i) => {
              const captions = [
                "🔑 Milestone Handover",
                "✨ Premium Acquisition",
                "🚗 Driving Dream Home",
                "🌟 Exceptional Delivery",
                "🖤 Bespoke Client Celebration",
                "🔥 Pure Motoring Passion"
              ];

              const currentCaption = captions[i % captions.length];

              return (
                <div 
                  key={i} 
                  id={`patron-card-${i}`}
                  onClick={() => setActivePhotoIndex(i)}
                  className="group relative bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-200/80 hover:border-zinc-300 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Photo Canvas Frame with Zoom Effect */}
                  <div className="relative overflow-hidden rounded-lg sm:rounded-xl bg-zinc-100 aspect-[4/3] w-full">
                    <img 
                      src={img} 
                      alt={`Client Delivery ${i + 1}`} 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800" }}
                    />
                    
                    <div className="absolute inset-0 border border-black/5 group-hover:border-black/10 transition-colors duration-300 rounded-lg sm:rounded-xl pointer-events-none" />

                    {/* Minimal styled VERIFIED badge */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-zinc-900/90 text-white border border-zinc-800 font-mono text-[8px] sm:text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded backdrop-blur-md shadow-sm select-none">
                      ✓ DELIVERED
                    </div>
                  </div>

                  {/* Sleek Metadata & Caption */}
                  <div className="pt-3 sm:pt-4 px-0.5 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 font-semibold tracking-widest uppercase block mb-0.5 sm:mb-1">
                        PATRON ARCHIVE #{i + 1}
                      </span>
                      <p className="font-sans text-zinc-900 text-xs sm:text-base font-semibold tracking-wide select-none">
                        {currentCaption}
                      </p>
                    </div>

                    <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-zinc-100 flex justify-between items-center text-[9px] sm:text-[10px] font-mono text-zinc-400 select-none">
                      <span>ESTD. 2019</span>
                      <span className="text-zinc-500 font-medium">MUMBAI, INDIA</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern Cinematic Lightbox Modal */}
      {activePhotoIndex !== null && (
        <div 
          id="patron-lightbox-backdrop"
          onClick={() => setActivePhotoIndex(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4 md:p-8"
        >
          {/* Top Control Bar */}
          <div className="absolute top-4 sm:top-5 inset-x-0 px-4 sm:px-6 flex justify-between items-center text-zinc-400 font-mono text-[10px] sm:text-xs z-10 max-w-7xl mx-auto">
            <div>
              <span className="text-white font-bold">FAST WHEELS</span>
              <span className="mx-1.5 font-light">|</span>
              <span>ARCHIVE {activePhotoIndex + 1}/{deliveries.length}</span>
            </div>
            
            <button 
              onClick={() => setActivePhotoIndex(null)}
              className="p-2 sm:p-3 bg-zinc-900 border border-white/10 rounded-full text-zinc-400 hover:text-white hover:border-white transition-all flex items-center justify-center cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Main Visual Centerpiece */}
          <div className="relative w-full max-w-5xl aspect-[16/10] md:max-h-[70vh] flex items-center justify-center group/lightbox my-auto px-2">
            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white hover:bg-black/90 text-white transition-all z-20 cursor-pointer hidden md:flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img 
              src={deliveries[activePhotoIndex]} 
              alt="Immersive Celebration"
              onClick={(e) => e.stopPropagation()}
              className="w-full h-full max-h-[65vh] sm:max-h-[70vh] object-contain rounded-xl sm:rounded-2xl border border-white/5 shadow-2xl animate-scale-up"
              onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format=crop&q=80&w=800" }}
            />

            <button
              onClick={handleNextPhoto}
              className="absolute right-4 p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10 hover:border-white hover:bg-black/90 text-white transition-all z-20 cursor-pointer hidden md:flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Fast-Tapper Overlay controls */}
          <div className="flex md:hidden gap-4 mt-3 z-10">
            <button
               onClick={handlePrevPhoto}
               className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-wider"
            >
              PREV
            </button>
            <button
               onClick={handleNextPhoto}
               className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-wider"
            >
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* Revamped Minimal & Smooth Founding Story Section */}
      <section className="py-12 sm:py-20 bg-transparent border-t border-zinc-900 relative z-10">
        <div className="container mx-auto max-w-6xl px-4">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
            <span className="text-[#E63946] tracking-[0.25em] uppercase text-[10px] sm:text-xs font-bold mb-2 block font-mono">
              OUR FOUNDING STORY
            </span>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-orbitron text-white tracking-wider font-bold uppercase leading-tight">
              REDEFINING THE <span className="text-[#E63946]">AUTOMOBILE</span> JOURNEY
            </h2>
            <div className="w-20 h-[2px] bg-[#C1121F] mx-auto mt-4"></div>
          </div>

          {/* Hero Manifesto Box */}
          <div className="bg-[#171717] border border-[#C1121F]/30 p-6 sm:p-10 rounded-2xl sm:rounded-3xl relative overflow-hidden mb-8 sm:mb-12 shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-black/60 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
              <span className="font-mono text-[9px] sm:text-[10px] text-[#E63946] font-bold uppercase tracking-widest block">
                OUR PHILOSOPHY
              </span>
              <p className="text-white font-serif text-base sm:text-2xl font-bold leading-relaxed italic">
                "To us, a car is never just a transaction. It's someone's first milestone, a family upgrade, or a dream fulfilled."
              </p>
              <p className="text-zinc-400 text-xs sm:text-sm font-light leading-relaxed pt-1">
                FAST WHEELS was built to give car buyers honest guidance, transparent pricing, and a smooth experience from start to finish.
              </p>
            </div>
          </div>

          {/* Minimal 3-Pillar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-[#C1121F]/15 border border-[#C1121F]/30 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-[#E63946]" />
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base mb-1.5 uppercase tracking-wider font-orbitron">
                Thoroughly Vetted
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-light">
                Every vehicle undergoes multi-point technical inspection and history verification before joining our showroom.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-[#C1121F]/15 border border-[#C1121F]/30 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-[#E63946]" />
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base mb-1.5 uppercase tracking-wider font-orbitron">
                Uncompromising Quality
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-light">
                We select only top-tier pre-owned luxury cars that meet the exact standards we would expect for ourselves.
              </p>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-[#C1121F]/15 border border-[#C1121F]/30 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#E63946]" />
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base mb-1.5 uppercase tracking-wider font-orbitron">
                Seamless Handover
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-light">
                Rapid documentation, transparent pricing, and instant assistance to ensure your buying experience is effortless.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 sm:py-20 bg-transparent border-t border-zinc-900 font-sans relative z-10">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-zinc-400 tracking-[0.2em] uppercase text-xs font-semibold mb-2 block font-mono">Unbiased Endorsements</span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-orbitron font-bold text-white tracking-wider uppercase mb-3">Google Business Ratings</h2>
            <div className="w-20 h-[1px] bg-white/20 mx-auto mt-3 mb-3"></div>
            <p className="text-zinc-400 text-[10px] sm:text-xs max-w-xl mx-auto tracking-widest font-mono uppercase">
              Direct verification from our client community across Mumbai.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {MOCK_REVIEWS.map((review, i) => (
              <div key={i} className="bg-zinc-900/65 border border-zinc-800/80 p-5 sm:p-7 rounded-xl sm:rounded-2xl flex flex-col justify-between h-full transition-all duration-300 shadow-sm hover:border-zinc-700">
                <div>
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-current text-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-zinc-300 text-xs sm:text-sm md:text-base font-light italic leading-relaxed mb-4 sm:mb-6">"{review.text}"</p>
                </div>
                <div className="flex items-center pt-3 sm:pt-4 border-t border-zinc-800/80 gap-3 font-mono">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border border-zinc-700 bg-zinc-800 text-white">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-xs tracking-wide">{review.name}</h4>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{review.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-transparent text-center border-t border-[#C1121F]/30 relative z-10 animate-fade-in overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-black/60 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto max-w-3xl px-4 relative z-10">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-orbitron font-bold text-white mb-3 sm:mb-4 tracking-wider uppercase">Experience Ultimate Procurement</h2>
          <p className="text-zinc-400 mb-6 sm:mb-8 font-light tracking-wide text-xs sm:text-base max-w-xl mx-auto">
            We welcome you to our showroom to inspect our handpicked, certified luxury collection in person.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center text-xs tracking-widest uppercase font-mono font-bold max-w-sm sm:max-w-none mx-auto">
            <Link to="/inventory" className="bg-[#C1121F] hover:bg-[#FF3B3B] text-white px-8 py-3.5 transition-all duration-300 rounded-xl shadow-lg border border-[#E63946]/40 text-center">
              Browse Collection
            </Link>
            <a href="/#contact" className="bg-[#171717] text-zinc-200 hover:bg-[#222222] hover:text-white px-8 py-3.5 transition-all duration-300 rounded-xl border border-[#C1121F]/40 text-center">
              Contact Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
