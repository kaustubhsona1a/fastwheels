import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Banknote, FileText, Star, MapPin, Phone, Car, Gauge, Fuel, Cog, Settings2, Compass, ExternalLink, Instagram, Video, ChevronDown } from 'lucide-react';
import { formatPrice, MOCK_REVIEWS } from '../data/mockData';
import { useVehicles } from '../context/VehicleContext';
import { Helmet } from 'react-helmet-async';

const CARD_THEMES = [
  {
    glow: "hover:border-white/50 hover:shadow-lg hover:shadow-white/5",
    textHover: "group-hover:text-white",
    price: "text-white",
    badge: "text-white border-white/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-white group-hover:text-zinc-950 group-hover:bg-white group-hover:shadow-sm",
    icon: "text-white",
    border: "border-white/10 hover:border-white/30"
  },
  {
    glow: "hover:border-zinc-300/50 hover:shadow-lg hover:shadow-zinc-300/5",
    textHover: "group-hover:text-zinc-200",
    price: "text-white",
    badge: "text-zinc-300 border-zinc-300/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-zinc-300 group-hover:text-zinc-950 group-hover:bg-zinc-200 group-hover:shadow-sm",
    icon: "text-zinc-300",
    border: "border-white/10 hover:border-zinc-300/30"
  },
  {
    glow: "hover:border-zinc-400/50 hover:shadow-lg hover:shadow-zinc-400/5",
    textHover: "group-hover:text-zinc-300",
    price: "text-white",
    badge: "text-zinc-400 border-zinc-400/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-zinc-400 group-hover:text-zinc-950 group-hover:bg-zinc-300 group-hover:shadow-sm",
    icon: "text-zinc-400",
    border: "border-white/10 hover:border-zinc-400/30"
  },
  {
    glow: "hover:border-zinc-500/50 hover:shadow-lg hover:shadow-zinc-500/5",
    textHover: "group-hover:text-zinc-400",
    price: "text-white",
    badge: "text-zinc-500 border-zinc-500/20 bg-white/10 shadow-sm backdrop-blur-md",
    btn: "group-hover:border-zinc-500 group-hover:text-zinc-950 group-hover:bg-zinc-400 group-hover:shadow-sm",
    icon: "text-zinc-500",
    border: "border-white/10 hover:border-zinc-500/30"
  }
];

export default function Home() {
  const { vehicles, siteConfig, loading } = useVehicles();
  const featuredCars = vehicles.filter(v => v.status === 'Available').slice(0, 3);
  
  const siteUrl = "https://instagram.com/fast_wheels_5";
  const defaultDesc = "FAST WHEELS | Explore premium pre-owned luxury vehicles at Mumbai's premier dealership. Quality inventory, transparent pricing and an enthusiast-focused buying experience.";

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-zinc-300 font-sans">
      <Helmet>
        <title>FAST WHEELS | Premium Pre-Owned Cars Mumbai</title>
        <meta name="description" content={defaultDesc} />
        <meta property="og:title" content="FAST WHEELS | Premium Pre-Owned Cars Mumbai" />
        <meta property="og:description" content={defaultDesc} />
        <meta property="og:image" content={siteConfig.homeHeroImage} />
        <meta property="og:url" content={siteUrl} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Space - Styled with quick action buttons using red and black performance style */}
      <section className="relative min-h-[calc(100vh-72px)] flex flex-col items-center justify-center py-4 sm:py-0 overflow-hidden px-4 text-center z-20">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center w-full -mt-20 sm:mt-0">
          
          <div className="mb-8 sm:mb-12 relative group">
            <div className="relative inline-block py-2 px-3 mb-4 sm:mb-6">
              {/* Dynamic Speed Streaks behind text */}
              <div className="speed-line-streak-1"></div>
              <div className="speed-line-streak-2"></div>
              <div className="speed-line-streak-3"></div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-orbitron font-black text-white tracking-wider sm:tracking-widest uppercase drop-shadow-2xl whitespace-nowrap speed-title-effect italic">
                FAST <span className="text-[#E63946] inline-block -skew-x-6">WHEELS</span>
              </h1>
            </div>

            <p className="text-xs sm:text-xl font-bold tracking-[0.25em] sm:tracking-[0.3em] text-zinc-300 uppercase font-orbitron mb-3 sm:mb-4">
              Premium Pre-Owned Cars
            </p>
            <p className="text-zinc-400 text-xs sm:text-sm font-light tracking-widest max-w-xl mx-auto font-sans">
              Performance. Passion. Premium Quality.
            </p>
          </div>
          
          <div className="relative z-30 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-[280px] sm:max-w-xl mx-auto">
            {/* Primary CTA */}
            <Link 
              to="/inventory" 
              className="flex items-center justify-center w-full sm:w-[200px] h-12 bg-[#C1121F] hover:bg-[#FF3B3B] text-white font-bold tracking-wider uppercase text-xs sm:text-sm font-mono rounded-xl transition-all duration-300 text-center shadow-lg shadow-[#C1121F]/40 hover:scale-[1.03] active:scale-95 border border-[#E63946]/50"
            >
              Browse Inventory
            </Link>

            {/* Secondary CTA */}
            <a 
              href="tel:+918169423018" 
              className="flex items-center justify-center w-full sm:w-[200px] h-12 bg-transparent border-2 border-[#E63946] hover:bg-[#C1121F]/20 text-[#E63946] hover:text-white font-bold tracking-wider uppercase text-xs sm:text-sm font-mono rounded-xl transition-all duration-300 text-center shadow-md hover:scale-[1.03] active:scale-95"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-transparent relative z-10">
         <div className="container mx-auto max-w-7xl px-4">
           <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-white tracking-wider uppercase">Certified Quality Standards</h2>
             <div className="w-24 h-[2px] bg-[#C1121F] mx-auto mt-4"></div>
           </div>
 
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { icon: ShieldCheck, title: "Rigorous Checks", desc: "Every car in our catalog undergoes rigorous multi-point mechanical, structural, and aesthetic certification." },
               { icon: Banknote, title: "Transparent Pricing", desc: "Accurate, upfront, and completely transparent market pricing ensures fair, clean, and pressure-free value." },
               { icon: Car, title: "Custom Financing", desc: "Custom auto loan structures via leading banking and finance partners." },
               { icon: FileText, title: "Pristine Transfer", desc: "Complete oversight and physical management of all ownership paperwork, RTO clearances, and transfers." }
             ].map((feature, i) => (
               <div key={i} className="group relative bg-[#171717] border border-[#C1121F]/20 hover:border-[#E63946] hover:bg-[#1f1f1f] hover:shadow-lg hover:shadow-[#C1121F]/20 transition-all duration-300 p-8 rounded-2xl flex flex-col items-center text-center backdrop-blur-md">
                 <div className="w-16 h-16 bg-[#050505] border border-[#C1121F]/40 group-hover:border-[#FF3B3B] group-hover:bg-[#C1121F]/20 transition-all duration-300 flex items-center justify-center mb-6 rounded-2xl shadow-sm">
                   <feature.icon className="w-6 h-6 text-[#E63946] group-hover:text-white transition-colors" />
                 </div>
                 <h3 className="text-xs font-bold tracking-widest text-white mb-3 uppercase font-mono">{feature.title}</h3>
                 <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-light">{feature.desc}</p>
               </div>
             ))}
           </div>
         </div>
       </section>

       {/* Testimonials */}
       <section className="py-12 sm:py-16 bg-transparent animate-fade-in relative z-10">
         <div className="container mx-auto max-w-7xl px-4">
           <div className="text-center mb-8 sm:mb-10">
             <span className="text-[#E63946] tracking-[0.2em] uppercase text-xs font-bold mb-3 block font-mono">Client Stories</span>
             <h2 className="text-xl sm:text-3xl md:text-4xl font-orbitron font-bold text-white tracking-wider uppercase">Client Testimonials</h2>
             <div className="w-24 h-[2px] bg-[#C1121F] mx-auto mt-4"></div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
             {MOCK_REVIEWS.map((review) => (
               <div key={review.id} className="bg-[#171717] border border-[#C1121F]/25 hover:border-[#E63946] p-5 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col justify-between h-full transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#C1121F]/15 backdrop-blur-md">
                 <div>
                   <div className="flex mb-3 sm:mb-6 space-x-1">
                     {[...Array(review.rating)].map((_, idx) => (
                       <Star key={idx} className="w-3.5 h-3.5 fill-current text-[#E63946]" />
                     ))}
                   </div>
                   <p className="text-zinc-300 italic text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-6 flex-grow">"{review.text}"</p>
                 </div>
                 <div className="border-t border-zinc-800/80 pt-3 sm:pt-5 flex justify-between items-center font-mono">
                   <div>
                     <p className="font-sans font-bold text-white uppercase tracking-wider text-[11px] sm:text-xs mb-0.5 sm:mb-1">{review.name}</p>
                     <p className="text-[9px] sm:text-[10px] text-zinc-500 tracking-wider">{review.date}</p>
                   </div>
                   <span className="text-[9px] sm:text-[10px] bg-[#C1121F]/20 text-[#E63946] font-bold px-2 sm:px-2.5 py-0.5 rounded border border-[#C1121F]/40">Verified</span>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </section>

      {/* Instagram Reels Showcase Section */}
      {siteConfig.instagramReels && siteConfig.instagramReels.length > 0 && (
        <section className="py-12 sm:py-16 bg-transparent relative z-10 border-t border-zinc-900/80">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center mb-8 sm:mb-10">
              <span className="text-[#E63946] tracking-[0.2em] uppercase text-xs font-bold mb-3 block font-mono">Social Showcase</span>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-orbitron text-white tracking-wider font-bold uppercase">Featured Instagram Highlights</h2>
              <div className="w-24 h-[2px] bg-[#C1121F] mx-auto mt-4"></div>
              <p className="text-zinc-400 text-xs mt-3 uppercase tracking-wider font-mono">
                Interactive video reels direct from our linked{" "}
                <a 
                  href="https://www.instagram.com/fast_wheels_5/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#E63946] underline hover:text-[#FF3B3B] transition-all font-bold"
                >
                  @fast_wheels_5
                </a>{" "}
                channel
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center items-stretch">
              {siteConfig.instagramReels.map((url, idx) => {
                const match = url.match(/(?:\/p\/|\/reel\/|\/tv\/)([A-Za-z0-9_-]+)/);
                const reelId = match ? match[1] : null;
                
                if (!reelId) return null;

                return (
                  <div key={idx} className="border border-[#C1121F]/25 bg-[#171717] hover:border-[#E63946] backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:shadow-[#C1121F]/15 transition-all duration-300">
                    <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-zinc-950 shadow-inner">
                      <iframe 
                        src={`https://www.instagram.com/reel/${reelId}/embed`}
                        className="absolute inset-0 w-full h-full border-0 rounded-xl"
                        allowtransparency="true"
                        allow="encrypted-media"
                        scrolling="no"
                      />
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between font-mono text-[9px] text-zinc-400 uppercase tracking-widest px-1">
                      <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-[#E63946]" /> Reel #{idx + 1}</span>
                      <a href={url} target="_blank" rel="noreferrer" className="text-[#E63946] hover:text-[#FF3B3B] flex items-center gap-1 font-bold">
                        PLAY ON APP <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-12 sm:py-20 flex flex-col justify-center items-center bg-transparent border-t border-zinc-900 relative overflow-hidden z-10">
        {/* Background dark glows */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-black/60 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-black/60 blur-[120px] rounded-full pointer-events-none -translate-y-1/2"></div>
 
        <div className="w-full max-w-4xl flex flex-col justify-center px-4 sm:px-8 text-center relative z-10">
          <span className="text-[#E63946] tracking-[0.2em] uppercase text-xs font-bold mb-4 block font-mono">Our Showroom</span>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-orbitron text-white font-bold mb-6 sm:mb-16 tracking-wider uppercase">Visit Us In-Person</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-16">
            <div className="flex flex-col items-center bg-[#171717] p-6 sm:p-10 rounded-2xl border border-[#C1121F]/25 hover:border-[#E63946] transition-all duration-500 shadow-sm hover:shadow-lg hover:shadow-[#C1121F]/20 backdrop-blur-md text-zinc-300">
              <div className="bg-[#C1121F]/15 p-4 rounded-full mb-6 border border-[#C1121F]/30">
                <MapPin className="w-8 h-8 text-[#E63946]" />
              </div>
              <h3 className="font-sans tracking-widest text-[11px] uppercase text-[#E63946] mb-4 font-mono font-bold">Showroom Address</h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed tracking-wide font-light">
                Floor 4, BMC Parking,<br/>
                Byculla, Near Kalapani Compound,<br/>
                Mumbai, Maharashtra
              </p>
              <a 
                href="https://maps.app.goo.gl/4VsYDmnUw519xPWz6?g_st=ac" 
                target="_blank" 
                rel="noreferrer" 
                className="mt-6 sm:mt-8 text-[#E63946] hover:text-[#FF3B3B] text-xs tracking-widest uppercase font-mono border-b border-[#C1121F]/40 hover:border-[#FF3B3B] pb-1 transition-all inline-flex items-center gap-2 font-bold"
              >
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            
            <div className="flex flex-col items-center bg-[#171717] p-6 sm:p-10 rounded-2xl border border-[#C1121F]/25 hover:border-[#E63946] transition-all duration-500 shadow-sm hover:shadow-lg hover:shadow-[#C1121F]/20 backdrop-blur-md text-zinc-300">
              <div className="bg-[#C1121F]/15 p-4 rounded-full mb-6 border border-[#C1121F]/30">
                <Phone className="w-8 h-8 text-[#E63946]" />
              </div>
              <h3 className="font-sans tracking-widest text-[11px] uppercase text-[#E63946] mb-4 font-mono font-bold">Contact Us</h3>
              <a href="tel:+918169423018" className="text-white text-base sm:text-2xl tracking-wide hover:text-[#E63946] transition-all font-mono font-bold my-auto whitespace-nowrap">+91 81694 23018</a>
              <a 
                href="tel:+918169423018" 
                className="mt-6 sm:mt-8 text-[#E63946] hover:text-[#FF3B3B] text-xs tracking-widest uppercase font-mono border-b border-[#C1121F]/40 hover:border-[#FF3B3B] pb-1 transition-all font-bold"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
