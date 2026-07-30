import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/mockData';
import { Search, Filter, Car, Gauge, Fuel, Cog, Instagram } from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';

export default function Inventory() {
  const { vehicles, loading } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const BUDGET_OPTIONS = [
    1000000,  // Below 10L
    1500000,  // Under 15L
    2000000,  // Under 20L
    2500000,  // Under 25L
    3000000,  // Under 30L
    3500000,  // Under 35L
    4000500,  // Under 40L
    4500000,  // Under 45L
    5000000,  // Under 50L
    100000000 // 50 Lakh+ / Any
  ];
  const [budgetIndex, setBudgetIndex] = useState(BUDGET_OPTIONS.length - 1);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [maxMileage, setMaxMileage] = useState<number | null>(null);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredCars = useMemo(() => {
    let result = vehicles.filter(car => !car.status || car.status.toLowerCase() === 'available');
    
    // Search filter
    if (searchTerm) {
      result = result.filter(car => 
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Budget filter
    if (budgetIndex < BUDGET_OPTIONS.length - 1) {
      const currentMaxBudget = BUDGET_OPTIONS[budgetIndex];
      result = result.filter(car => car.price <= currentMaxBudget);
    }

    // Owners filter
    if (selectedOwners.length > 0) {
      result = result.filter(car => {
        if (!car.ownership) return false;
        const carStr = car.ownership.toLowerCase().trim();
        return selectedOwners.some(sel => {
          const selStr = sel.toLowerCase().trim();
          const selShort = selStr.replace(' owner', '').trim();
          const carShort = carStr.replace(' owner', '').trim();
          return carStr === selStr || carShort === selShort || carStr.includes(selShort) || selStr.includes(carShort);
        });
      });
    }

    // Transmission filter
    if (selectedTransmissions.length > 0) {
      result = result.filter(car => selectedTransmissions.includes(car.transmission));
    }

    // Mileage filter
    if (maxMileage !== null) {
      result = result.filter(car => car.mileage <= maxMileage);
    }
    
    // Fuel type filter
    if (selectedFuelTypes.length > 0) {
      result = result.filter(car => selectedFuelTypes.includes(car.fuelType));
    }
    
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'mileage') {
      result.sort((a, b) => a.mileage - b.mileage);
    }
    
    return result;
  }, [vehicles, searchTerm, sortBy, budgetIndex, selectedOwners, selectedTransmissions, maxMileage, selectedFuelTypes]);

  const toggleOwner = (owner: string) => {
    setSelectedOwners(prev => prev.includes(owner) ? prev.filter(o => o !== owner) : [...prev, owner]);
  };

  const toggleTransmission = (transmission: string) => {
    setSelectedTransmissions(prev => prev.includes(transmission) ? prev.filter(t => t !== transmission) : [...prev, transmission]);
  };

  const toggleFuel = (fuel: string) => {
    setSelectedFuelTypes(prev => prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]);
  };

  const resetFilters = () => {
    setBudgetIndex(BUDGET_OPTIONS.length - 1);
    setSelectedOwners([]);
    setSelectedTransmissions([]);
    setMaxMileage(null);
    setSelectedFuelTypes([]);
    setSearchTerm('');
    setSortBy('newest');
  };

  const ALL_OWNERS = ['1st Owner', '2nd Owner', '3rd Owner', '4th+ Owner', '1st', '2nd', '3rd', '4th+']; // Match formats
  const ALL_TRANSMISSIONS = ['Automatic', 'Manual'];
  const ALL_FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'];

  return (
    <div className="min-h-screen bg-transparent text-zinc-300 py-12 font-sans z-10 relative">
      <div className="container mx-auto max-w-7xl px-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-[#C1121F]/30 pb-8">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-white tracking-wider sm:tracking-widest uppercase whitespace-nowrap">Curated Collection</h1>
            <p className="text-zinc-400 mt-2 tracking-widest uppercase text-[10px] font-mono font-bold">Explore <span className="text-[#E63946]">{filteredCars.length}</span> Verified Motorcars in <span className="text-white">Mumbai</span></p>
          </div>
          
          <div className="w-full md:w-auto font-mono text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E63946]" />
              <input 
                type="text" 
                placeholder="SEARCH BRAND OR MODEL..." 
                className="w-full pl-11 pr-4 py-3 md:py-4 bg-[#171717] border border-[#C1121F]/40 backdrop-blur-md rounded-xl text-xs tracking-wider uppercase text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#E63946] focus:bg-[#1a1a1a] transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 font-mono">
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center justify-between w-full p-4 bg-[#171717] border border-[#C1121F]/40 rounded-xl text-zinc-200 font-bold tracking-wider text-xs uppercase hover:border-[#E63946] transition-colors shadow-sm"
          >
            <div className="flex items-center"><Filter className="w-4 h-4 mr-3 text-[#E63946]" /> Filters and Sort</div>
            <span className="text-[10px] text-[#E63946] lowercase">{isMobileFiltersOpen ? 'collapse' : 'expand'}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <div className={`w-full lg:w-72 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="p-8 border border-[#C1121F]/30 bg-[#171717] backdrop-blur-xl rounded-2xl shadow-lg shadow-black/20 sticky top-28">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#C1121F]/30">
                <h3 className="font-serif tracking-widest text-white flex items-center uppercase text-xs font-bold font-mono"><Filter className="w-4 h-4 mr-3 text-[#E63946]" /> Filters & Sort</h3>
                <button onClick={resetFilters} className="text-[9px] tracking-widest uppercase text-[#E63946] hover:text-[#FF3B3B] transition-colors font-bold font-mono">Reset</button>
              </div>
              
              <div className="space-y-8 text-zinc-300">
                {/* Sort By */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 mb-3 font-bold font-mono border-b border-[#C1121F]/20 pb-1.5 flex items-center justify-between">
                    <span>Sort By</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse"></span>
                  </h4>
                  <div className="relative">
                    <select 
                      className="w-full bg-[#050505] border border-[#C1121F]/40 text-xs tracking-wider text-zinc-200 uppercase rounded-xl px-4 py-3.5 outline-none focus:border-[#E63946] transition-colors block shadow-sm font-mono cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest" className="bg-[#050505]">Newest Inventory</option>
                      <option value="price-low" className="bg-[#050505]">Price: Low to High</option>
                      <option value="price-high" className="bg-[#050505]">Price: High to Low</option>
                      <option value="mileage" className="bg-[#050505]">Mileage: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Max Budget</h4>
                    <span className="text-[11px] text-[#E63946] tracking-wider font-bold font-mono">
                      {budgetIndex === 0
                        ? 'Below ₹ 10 Lakh'
                        : budgetIndex === BUDGET_OPTIONS.length - 1
                          ? '50 Lakh+'
                          : `Under ₹ ${(BUDGET_OPTIONS[budgetIndex] / 100000).toFixed(0)} Lakh`}
                    </span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max={BUDGET_OPTIONS.length - 1} 
                      step="1"
                      value={budgetIndex} 
                      onChange={(e) => setBudgetIndex(parseInt(e.target.value))}
                      className="w-full accent-[#C1121F] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Owners */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 mb-4 font-bold font-mono border-b border-[#C1121F]/20 pb-1.5 flex items-center justify-between">
                    <span>Ownership</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse"></span>
                  </h4>
                  <div className="space-y-3">
                    {['1st Owner', '2nd Owner', '3rd Owner'].map(owner => {
                      const isSelected = selectedOwners.includes(owner);
                      return (
                        <label key={owner} className="flex items-center space-x-3 cursor-pointer group">
                          <div className={`relative flex items-center justify-center w-4 h-4 rounded border transition-colors ${isSelected ? 'border-[#E63946] bg-[#C1121F]' : 'border-zinc-700 group-hover:border-[#E63946]'}`}>
                              <input 
                                type="checkbox" 
                                className="opacity-0 absolute inset-0 cursor-pointer" 
                                checked={isSelected}
                                onChange={() => {
                                  if (isSelected) {
                                    setSelectedOwners(prev => prev.filter(o => o !== owner));
                                  } else {
                                    setSelectedOwners(prev => [...prev, owner]);
                                  }
                                }}
                              />
                              {isSelected ? <div className="w-1.5 h-1.5 bg-white rounded-full"></div> : null}
                          </div>
                          <span className={`text-xs tracking-wide transition-colors ${isSelected ? 'text-[#E63946] font-semibold' : 'text-zinc-400 group-hover:text-white'}`}>{owner}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 mb-4 font-bold font-mono border-b border-[#C1121F]/20 pb-1.5 flex items-center justify-between">
                    <span>Transmission</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse"></span>
                  </h4>
                  <div className="space-y-3">
                    {ALL_TRANSMISSIONS.map(trans => {
                      const isSelected = selectedTransmissions.includes(trans);
                      return (
                        <label key={trans} className="flex items-center space-x-3 cursor-pointer group">
                          <div className={`relative flex items-center justify-center w-4 h-4 rounded border transition-colors ${isSelected ? 'border-[#E63946] bg-[#C1121F]' : 'border-zinc-700 group-hover:border-[#E63946]'}`}>
                              <input 
                                type="checkbox" 
                                className="opacity-0 absolute inset-0 cursor-pointer" 
                                checked={isSelected}
                                onChange={() => toggleTransmission(trans)}
                              />
                              {isSelected ? <div className="w-1.5 h-1.5 bg-white rounded-full"></div> : null}
                          </div>
                          <span className={`text-xs tracking-wide transition-colors ${isSelected ? 'text-[#E63946] font-semibold' : 'text-zinc-400 group-hover:text-white'}`}>{trans}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Mileage slider */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold font-mono">Max Mileage</h4>
                    <span className="text-[11px] text-[#E63946] tracking-wider font-semibold font-mono">
                      {maxMileage === null ? 'Any' : `${maxMileage.toLocaleString()} KM`}
                    </span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="300000" 
                      step="5000"
                      value={maxMileage === null ? 300000 : maxMileage} 
                      onChange={(e) => setMaxMileage(parseInt(e.target.value))}
                      className="w-full accent-[#C1121F] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fuel Types */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 mb-4 font-bold font-mono border-b border-[#C1121F]/20 pb-1.5 flex items-center justify-between">
                    <span>Fuel Type</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63946] animate-pulse"></span>
                  </h4>
                  <div className="space-y-3">
                    {ALL_FUELS.map(fuel => {
                      const isSelected = selectedFuelTypes.includes(fuel);
                      return (
                        <label key={fuel} className="flex items-center space-x-3 cursor-pointer group">
                          <div className={`relative flex items-center justify-center w-4 h-4 rounded border transition-colors ${isSelected ? 'border-[#E63946] bg-[#C1121F]' : 'border-zinc-700 group-hover:border-[#E63946]'}`}>
                              <input 
                                type="checkbox" 
                                className="opacity-0 absolute inset-0 cursor-pointer" 
                                checked={isSelected}
                                onChange={() => toggleFuel(fuel)}
                              />
                              {isSelected ? <div className="w-1.5 h-1.5 bg-white rounded-full"></div> : null}
                          </div>
                          <span className={`text-xs tracking-wide transition-colors ${isSelected ? 'text-[#E63946] font-semibold' : 'text-zinc-400 group-hover:text-white'}`}>{fuel}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Listing Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {loading ? (
                [1, 2, 3, 4].map((num) => (
                  <div key={num} className="bg-zinc-900/35 border border-zinc-900/50 rounded-2xl p-6 h-[460px] animate-pulse flex flex-col justify-between">
                    <div className="w-full h-56 bg-zinc-950/40 rounded-xl mb-6"></div>
                    <div className="space-y-4 flex-grow">
                      <div className="h-6 w-2/3 bg-zinc-950/40 rounded-md"></div>
                      <div className="h-4 w-1/3 bg-zinc-950/40 rounded-md"></div>
                      <div className="h-5 w-1/2 bg-zinc-950/40 rounded-md mt-4"></div>
                    </div>
                    <div className="h-10 w-full bg-zinc-950/40 rounded-xl mt-6"></div>
                  </div>
                ))
              ) : filteredCars.length > 0 ? (
                filteredCars.map((car) => {
                  return (
                    <Link key={car.id} to={`/inventory/${car.id}`} className="group block h-full">
                      <div className="bg-[#171717] border border-[#C1121F]/30 hover:border-[#E63946] hover:shadow-xl hover:shadow-[#C1121F]/20 hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col h-full overflow-hidden rounded-2xl">
                        <div className="relative aspect-[4/3] sm:aspect-video md:aspect-auto md:h-64 overflow-hidden bg-zinc-950 animate-fade-in">
                          <img src={car.images?.[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"} alt={`${car.make} ${car.model}`} loading="lazy" className="w-full h-full object-contain bg-zinc-950/80 transition-transform duration-500 ease-out group-hover:scale-[1.06]" />
                          <div className="absolute top-4 left-4 bg-[#C1121F] text-white border border-[#E63946] px-3 py-1 rounded-lg text-xs font-bold tracking-widest font-mono shadow-md">
                            {car.year}
                          </div>
                          {car.instagramReel && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(car.instagramReel, '_blank', 'noopener,noreferrer');
                              }}
                              className="absolute top-4 right-4 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white border border-white/20 px-3.5 py-1.5 rounded-lg text-[9px] font-bold tracking-widest font-mono shadow-lg shadow-pink-500/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 z-10"
                            >
                              <Instagram className="w-3.5 h-3.5" /> WATCH REEL
                            </button>
                          )}
                        </div>
                        <div className="p-7 flex-grow flex flex-col justify-between text-zinc-300">
                          <div>
                            <div className="mb-4 text-center">
                              <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#E63946] transition-colors mb-1.5">{car.make} <span className="font-light text-zinc-400">{car.model}</span></h3>
                              <p className="text-[10px] tracking-[0.2em] uppercase text-[#E63946] font-mono font-semibold">{car.variant}</p>
                            </div>
                            <div className="text-2xl font-bold text-center text-[#E63946] mb-6 pb-6 border-b border-[#C1121F]/20 font-serif">{formatPrice(car.price)}</div>
                          </div>
                          
                          <div>
                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs md:text-sm font-semibold text-zinc-300 mb-6 font-sans">
                              <div className="flex items-center"><Gauge className="w-4 h-4 mr-1.5 text-[#E63946]" /> {car.mileage.toLocaleString()} KM</div>
                              <div className="flex items-center"><Fuel className="w-4 h-4 mr-1.5 text-[#E63946]" /> {car.fuelType}</div>
                              <div className="flex items-center"><Cog className="w-4 h-4 mr-1.5 text-[#E63946]" /> {car.transmission}</div>
                            </div>
                            
                            <div className="w-full uppercase tracking-widest text-white text-[10px] font-bold text-center py-3 bg-[#C1121F] group-hover:bg-[#FF3B3B] transition-all duration-300 rounded-xl font-mono shadow-md border border-[#E63946]/40">
                              Explore Specs & Registry ↗
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full border border-white/5 bg-zinc-900/10 rounded-2xl py-16 px-6 text-center font-mono uppercase text-xs tracking-widest text-zinc-500">
                  No matching luxury vehicles found in the active showroom inventory.
                </div>
              )}
            </div>
            
            {filteredCars.length > 0 && (
              <div className="mt-16 flex justify-center border-t border-zinc-900 pt-12">
                 <div className="flex items-center space-x-4">
                     <button className="px-5 py-2.5 border border-zinc-800 rounded-xl text-zinc-400 text-xs tracking-wider uppercase hover:border-white hover:text-white disabled:opacity-35 transition-colors font-bold font-mono" disabled>Previous</button>
                     <span className="text-zinc-500 text-xs tracking-widest font-mono">1 / 1</span>
                     <button className="px-5 py-2.5 border border-zinc-800 rounded-xl text-zinc-400 text-xs tracking-wider uppercase hover:border-white hover:text-white disabled:opacity-35 transition-colors font-bold font-mono" disabled>Next</button>
                 </div>
              </div>
            )}
            
            {filteredCars.length === 0 && (
              <div className="text-center py-24 border border-zinc-800 bg-zinc-900/55 rounded-2xl flex flex-col items-center shadow-sm">
                <div className="w-16 h-16 border border-zinc-800 bg-zinc-950/30 rounded-2xl flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-zinc-450" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">No Motorcars Found</h3>
                <p className="text-zinc-500 uppercase tracking-widest text-[9px] font-mono font-bold">Please refine your filter limits</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
