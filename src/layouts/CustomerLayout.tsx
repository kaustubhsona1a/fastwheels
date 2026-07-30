import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Instagram, Twitter, Menu, X, Star, Upload, Image, Check, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useVehicles, sanitizeHeroImage } from '../context/VehicleContext';
import { useAuth } from '../context/AuthContext';

let globalVideoFinished = false;

export default function CustomerLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const { siteConfig } = useVehicles();
  const { loginAsDealer } = useAuth();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const desktopVideoRef = React.useRef<HTMLVideoElement>(null);
  const mobileVideoRef = React.useRef<HTMLVideoElement>(null);
  const hasPlayedRef = React.useRef(false);
  const [isFading, setIsFading] = React.useState(false);

  const handleVideoEnded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    globalVideoFinished = true;
    setIsFading(false);
    video.pause();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (globalVideoFinished && video.duration && !isNaN(video.duration)) {
      video.currentTime = video.duration;
    }
  };

  React.useEffect(() => {
    if (isHomePage) {
      if (globalVideoFinished) {
        if (desktopVideoRef.current && !isNaN(desktopVideoRef.current.duration)) {
          desktopVideoRef.current.pause();
          desktopVideoRef.current.currentTime = desktopVideoRef.current.duration;
        }
        if (mobileVideoRef.current && !isNaN(mobileVideoRef.current.duration)) {
          mobileVideoRef.current.pause();
          mobileVideoRef.current.currentTime = mobileVideoRef.current.duration;
        }
        return;
      }

      if (scrollY > 5) {
        if (!hasPlayedRef.current) {
          hasPlayedRef.current = true;
          desktopVideoRef.current?.play().catch(() => {});
          mobileVideoRef.current?.play().catch(() => {});
        }
      }
    }
  }, [scrollY, isHomePage]);

  // Custom multi-tap tracker for dealer console access on mobile (esp. iPhone Safari)
  const tapCountRef = React.useRef(0);
  const lastTapTimeRef = React.useRef(0);
  const isTouchRef = React.useRef(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const handleSecretLogin = () => {
    loginAsDealer();
    setNotification('Dealer session unlocked. Redirecting to showroom console...');
    setTimeout(() => {
      navigate('/dealer-management');
      setNotification('');
    }, 1500);
  };

  const registerTap = () => {
    const now = Date.now();
    const lastTapTime = lastTapTimeRef.current;
    const currentTapCount = tapCountRef.current;

    if (now - lastTapTime < 800) {
      const nextCount = currentTapCount + 1;
      if (nextCount >= 3) {
        handleSecretLogin();
        tapCountRef.current = 0;
      } else {
        tapCountRef.current = nextCount;
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;
  };

  const handleCopyrightClick = (e: React.MouseEvent) => {
    if (isTouchRef.current) {
      // Handled by touch event, reset flag and skip click to avoid double registering
      isTouchRef.current = false;
      return;
    }
    registerTap();
  };

  const handleCopyrightTouch = (e: React.TouchEvent) => {
    isTouchRef.current = true;
    registerTap();
  };

  const showVideo = false;
  const showMobileVideo = false;

  return (
    <div className="min-h-screen flex flex-col font-sans text-zinc-300 relative bg-transparent">
      {/* Dynamic secret greeting/bypass notification */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000] bg-zinc-900 text-white font-semibold text-xs tracking-widest uppercase font-mono px-8 py-5 rounded-full shadow-2xl border border-zinc-800 flex items-center space-x-3 transition-all animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>{notification}</span>
        </div>
      )}

          {/* Global Background - Tailored showcase representation in premium dark theme */}
      <div className="fixed top-0 bottom-0 left-0 right-0 z-0 bg-[#02020a] overflow-hidden pointer-events-none">
        {/* Desktop Showcase Backdrop */}
        {showVideo ? (
          <video 
            ref={desktopVideoRef}
            src={siteConfig.homeHeroVideo}
            className={`hidden md:block absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ease-in-out ${
              isHomePage 
                ? (isFading ? 'opacity-0' : 'opacity-100') 
                : 'opacity-40'
            }`}
            muted
            playsInline
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          siteConfig.homeHeroImage && (
            <img 
              src={siteConfig.homeHeroImage}
              alt="Showroom Desktop Backdrop"
              className={`hidden md:block absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ease-in-out ${
                isHomePage 
                  ? (isFading ? 'opacity-0' : 'opacity-100') 
                  : 'opacity-40'
              }`}
            />
          )
        )}
        
        {/* Mobile-specific Showcase Backdrop */}
        {showMobileVideo ? (
          <video 
            ref={mobileVideoRef}
            src={siteConfig.homeHeroMobileVideo || siteConfig.homeHeroVideo}
            className={`block md:hidden absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ease-in-out ${
              isHomePage 
                ? (isFading ? 'opacity-0' : 'opacity-100') 
                : 'opacity-40'
            }`}
            muted
            playsInline
            onEnded={handleVideoEnded}
            onLoadedMetadata={handleLoadedMetadata}
          />
        ) : (
          (siteConfig.homeHeroMobileImage || siteConfig.homeHeroImage) && (
            <img 
              src={siteConfig.homeHeroMobileImage || siteConfig.homeHeroImage}
              alt="Showroom Mobile Backdrop"
              className={`block md:hidden absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ease-in-out ${
                isHomePage 
                  ? (isFading ? 'opacity-0' : 'opacity-100') 
                  : 'opacity-40'
              }`}
            />
          )
        )}
        {/* Dynamic black glass overlay to dissolve screen smoothly on scroll */}
        <div className={`absolute inset-0 transition-all duration-700 ${
          isHomePage 
            ? (isScrolled ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/20') 
            : 'bg-black/60 backdrop-blur-sm'
        }`} />

         {/* Subtle dark ambient pools - red tint disabled on scroll for pure black backdrop */}
        <div className={`absolute top-[-15%] left-[-10%] w-[65vw] h-[65vw] bg-black/50 rounded-full blur-[140px] transition-opacity duration-700 z-2 ${
          isScrolled ? 'opacity-0' : 'opacity-20'
        }`}></div>
        <div className={`absolute bottom-[-15%] right-[-10%] w-[65vw] h-[65vw] bg-black/50 rounded-full blur-[140px] transition-opacity duration-700 z-2 ${
          isScrolled ? 'opacity-0' : 'opacity-15'
        }`}></div>
        <div className={`absolute top-[35%] right-[10%] w-[45vw] h-[45vw] bg-black/30 rounded-full blur-[120px] transition-opacity duration-700 z-2 ${
          isScrolled ? 'opacity-0' : 'opacity-10'
        }`}></div>
      </div>

      <div className="relative z-10 flex flex-col flex-grow min-h-screen">
        {/* Main Navbar */}
        <nav className="sticky top-0 z-50 border-b bg-[#050505]/90 backdrop-blur-md border-zinc-900 shadow-lg text-zinc-100">
          {/* SVG Gradients for Social & Location Icons */}
          <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true" width="0" height="0">
            <defs>
              <linearGradient id="instagram-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                <stop stopColor="#FCAF45" offset="0%" />
                <stop stopColor="#E1306C" offset="40%" />
                <stop stopColor="#C13584" offset="70%" />
                <stop stopColor="#833AB4" offset="100%" />
              </linearGradient>
              <linearGradient id="location-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop stopColor="#4285F4" offset="0%" />   {/* Blue */}
                <stop stopColor="#EA4335" offset="33%" />  {/* Red */}
                <stop stopColor="#FBBC05" offset="66%" />  {/* Yellow */}
                <stop stopColor="#34A853" offset="100%" /> {/* Green */}
              </linearGradient>
            </defs>
          </svg>

          <div className="container mx-auto max-w-7xl px-4 py-4 flex justify-between items-center">
            
            {/* Left Side: Branding Text & Logo Only */}
            <Link to="/" className="flex items-center shrink-0 select-none group py-1">
              <span className="text-xs sm:text-sm md:text-base font-orbitron font-black text-white tracking-wider uppercase whitespace-nowrap italic">
                FAST <span className="text-[#E63946] inline-block -skew-x-6">WHEELS</span>
              </span>
            </Link>

            {/* Right/Middle Side: Desktop Navigation & Social Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
              
              {/* Desktop Contact & Socials */}
              <div className="hidden md:flex items-center space-x-4">
                <a href="tel:+918169423018" className="flex items-center text-xs font-semibold tracking-wider transition-colors duration-300 font-mono text-zinc-300 hover:text-emerald-500">
                  <Phone className="w-4 h-4 text-emerald-600 mr-2" style={{ stroke: '#059669' }} />
                  <span>+91 81694 23018</span>
                </a>
              <div className="flex items-center space-x-4 border-l pl-4 border-zinc-800">
                <a href="https://www.instagram.com/fast_wheels_5/" target="_blank" rel="noreferrer" className="hover:scale-110 active:scale-95 transition-all duration-300" title="Instagram">
                   <Instagram className="w-4 h-4 transition-transform duration-300" style={{ stroke: 'url(#instagram-gradient)' }} />
                </a>
                <a href="https://wa.me/918169423018" target="_blank" rel="noreferrer" className="hover:scale-110 active:scale-95 transition-all duration-300" title="WhatsApp Assistant">
                   <MessageCircle className="w-4 h-4 transition-transform duration-300" style={{ stroke: '#25D366', fill: 'rgba(37, 211, 102, 0.15)' }} />
                </a>
                <a href="https://maps.app.goo.gl/4VsYDmnUw519xPWz6?g_st=ac" target="_blank" rel="noreferrer" className="flex items-center hover:scale-105 active:scale-95 transition-all duration-300 text-zinc-400 hover:text-white" title="Byculla Showroom">
                  <MapPin className="w-4 h-4 text-white transition-transform duration-300" />
                  <span className="hidden lg:inline text-[9px] tracking-wider uppercase font-mono pl-1.5 font-bold text-zinc-300 hover:text-white">Byculla, Mumbai</span>
                </a>
              </div>
            </div>

            {/* Mobile Contact & Socials (Icon Only, No Full Number shown) */}
            <div className="flex md:hidden items-center space-x-3.5 pr-2 border-r border-zinc-800">
              <a href="tel:+918169423018" className="text-zinc-300 hover:text-emerald-500 transition-all duration-300" title="Call Us">
                <Phone className="w-5 h-5 text-emerald-600" style={{ stroke: '#059669' }} />
              </a>
              <a href="https://www.instagram.com/fast_wheels_5/" target="_blank" rel="noreferrer" className="hover:scale-110 transition-all duration-300" title="Instagram">
                <Instagram className="w-5 h-5" style={{ stroke: 'url(#instagram-gradient)' }} />
              </a>
              <a href="https://wa.me/918169423018" target="_blank" rel="noreferrer" className="hover:scale-110 transition-all duration-300" title="WhatsApp Chat">
                <MessageCircle className="w-5 h-5" style={{ stroke: '#25D366', fill: 'rgba(37, 211, 102, 0.15)' }} />
              </a>
              <a href="https://maps.app.goo.gl/4VsYDmnUw519xPWz6?g_st=ac" target="_blank" rel="noreferrer" className="hover:scale-110 transition-all duration-300" title="Google Maps Showroom Location">
                <MapPin className="w-5 h-5 text-white" />
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 text-[12px] font-bold tracking-widest uppercase font-orbitron">
              <Link to="/" className={`transition-all duration-300 pb-1 ${
                location.pathname === '/' 
                  ? 'text-[#E63946] border-b-2 border-[#C1121F]' 
                  : 'text-zinc-300 hover:text-[#E63946]'
              }`}>Home</Link>
              <Link to="/inventory" className={`transition-all duration-300 pb-1 ${
                location.pathname.startsWith('/inventory') 
                  ? 'text-[#E63946] border-b-2 border-[#C1121F]' 
                  : 'text-zinc-300 hover:text-[#E63946]'
              }`}>Showroom</Link>
              <Link to="/sell" className={`transition-all duration-300 pb-1 ${
                location.pathname === '/sell' 
                  ? 'text-[#E63946] border-b-2 border-[#C1121F]' 
                  : 'text-zinc-300 hover:text-[#E63946]'
              }`}>Sell Your Car</Link>
              <Link to="/about" className={`transition-all duration-300 pb-1 ${
                location.pathname === '/about' 
                  ? 'text-[#E63946] border-b-2 border-[#C1121F]' 
                  : 'text-zinc-300 hover:text-[#E63946]'
              }`}>About</Link>
              <a href="#contact" className="text-zinc-300 hover:text-[#E63946] transition-all duration-300">Contact</a>
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-1.5 transition-colors duration-300 focus:outline-none text-zinc-400 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900 px-4 py-8 flex flex-col space-y-6 font-bold tracking-widest uppercase font-orbitron shadow-2xl">
            <Link to="/" onClick={closeMenu} className="text-zinc-300 hover:text-white">Home</Link>
            <Link to="/inventory" onClick={closeMenu} className="text-zinc-300 hover:text-white">Showroom</Link>
            <Link to="/sell" onClick={closeMenu} className="text-zinc-300 hover:text-white">Sell Your Car</Link>
            <Link to="/about" onClick={closeMenu} className="text-zinc-300 hover:text-white">About</Link>
            <a href="#contact" onClick={closeMenu} className="text-zinc-300 hover:text-white">Contact Us</a>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-transparent border-t border-zinc-900/40 text-zinc-400 pt-12 sm:pt-24 pb-10 sm:pb-12 px-4 mt-12 sm:mt-20 relative overflow-hidden">
        {/* Ambient Subtle background monochrome pulse */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-white/1 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-16 relative z-10 text-zinc-300">
          <div className="space-y-6 md:col-span-1">
            <Link to="/" className="inline-flex items-center mb-4 select-none">
              <span className="text-xl md:text-2xl font-orbitron font-black text-white tracking-wider uppercase drop-shadow-md whitespace-nowrap speed-title-effect italic">
                FAST <span className="text-[#E63946] inline-block -skew-x-6">WHEELS</span>
              </span>
            </Link>
            <p className="text-sm tracking-wide leading-relaxed text-zinc-400 font-light">
              Quality Vehicles. Honest Deals. Complete Peace Of Mind.<br/>
              FAST WHEELS is a premium pre-owned car dealership dedicated to providing quality inspected vehicles, transparent transactions and a hassle-free buying experience.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-white font-serif tracking-wider text-xs font-semibold uppercase border-b border-zinc-900 pb-2">Quick Links</h3>
            <ul className="space-y-3.5 text-xs tracking-widest uppercase font-semibold font-mono text-zinc-400">
              <li><Link to="/inventory" className="hover:text-white transition-colors duration-300">Browse Collection</Link></li>
              <li><Link to="/sell" className="hover:text-white transition-colors duration-300">Sell Your Car</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors duration-300">About Us</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-white font-serif tracking-wider text-xs font-semibold uppercase border-b border-zinc-900 pb-2">Support Info</h3>
            <ul className="space-y-4 text-sm tracking-wide text-zinc-400 font-light">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-white mr-3 shrink-0 mt-1" />
                <a href="https://maps.app.goo.gl/4VsYDmnUw519xPWz6?g_st=ac" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-300 leading-relaxed font-light text-zinc-400">
                  Floor 4, BMC Parking, Byculla, Near Kalapani Compound, Mumbai
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-white mr-3 shrink-0" />
                <a href="tel:+918169423018" className="hover:text-white transition-colors duration-300 font-mono">+91 81694 23018</a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-[#E63946] mr-3 shrink-0" />
                <a href="mailto:fastwheels5@gmail.com" className="hover:text-white transition-colors duration-300 font-mono font-bold text-zinc-300">fastwheels5@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl mt-10 sm:mt-20 pt-6 sm:pt-8 border-t border-zinc-900 text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 flex flex-col md:flex-row justify-between items-center font-mono font-semibold">
          <p 
            onClick={handleCopyrightClick}
            onTouchStart={handleCopyrightTouch}
            role="button"
            tabIndex={0}
            className="select-none text-zinc-500 cursor-pointer touch-manipulation hover:text-white outline-none active:text-white transition-colors"
          >
            &copy; {new Date().getFullYear()} FAST WHEELS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-zinc-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white flex items-center">Terms</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
