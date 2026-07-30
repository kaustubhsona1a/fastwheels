import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, Vehicle } from '../../data/mockData';
import { Search, Plus, Edit, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';

export default function AdminInventory() {
  const { vehicles, updateVehicle, removeVehicle, lastSupabaseError } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = (v.make + ' ' + v.model + ' ' + (v.registration || '')).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {lastSupabaseError && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-amber-400 font-bold text-sm">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              Supabase Postgres Database Notice
            </span>
            <Link to="/dealer-management/settings" className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all">
              Go To Settings & Copy SQL
            </Link>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            Your images are uploading to Supabase Storage, but Supabase rejected saving vehicle information to the Postgres database table.
          </p>
          <p className="text-amber-300 font-bold text-[11px] bg-black/40 p-2.5 rounded-lg border border-amber-500/10">
            Error details: {lastSupabaseError}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase">Inventory Management</h1>
          <p className="text-zinc-400 text-xs mt-2 font-mono uppercase tracking-wider">Manage all vehicles in your premium dealership.</p>
        </div>
        <Link to="/dealer-management/inventory/add" className="inline-flex items-center px-6 py-3.5 bg-white hover:bg-zinc-900 text-zinc-950 hover:text-white border border-transparent hover:border-white/20 rounded-xl text-xs font-bold tracking-widest font-mono uppercase transition-all shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Add Vehicle
        </Link>
      </div>

      <div className="bg-zinc-950/65 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-white/5 flex flex-col md:flex-row gap-4 bg-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search vehicles by make, model, or registry code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/30 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-white transition-all font-mono"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="bg-zinc-900/30 border border-white/5 text-zinc-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-white transition-all font-mono uppercase tracking-wider"
          >
            <option className="bg-zinc-950 text-white">All Statuses</option>
            <option className="bg-zinc-950 text-white">Available</option>
            <option className="bg-zinc-950 text-white">Sold</option>
            <option className="bg-zinc-950 text-white">Booked</option>
          </select>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest font-mono border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Reg. No</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-250 font-mono">
              {filteredVehicles.map(car => (
                <tr key={car.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <img src={car.images?.[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"} alt="" className="w-16 h-12 object-cover rounded-lg border border-white/5" />
                      <div>
                        <p className="font-sans font-bold text-white text-sm">{car.make} {car.model}</p>
                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">{car.year} • {car.fuelType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-300 font-bold">{car.registration}</td>
                  <td className="px-6 py-4 font-sans font-bold text-white text-sm">{formatPrice(car.price)}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={car.status}
                      onChange={(e) => updateVehicle(car.id, { status: e.target.value as any })}
                      className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider border outline-none cursor-pointer bg-zinc-950 focus:border-white transition-all ${
                        car.status === 'Available' ? 'border-white/20 text-white bg-white/10' :
                        car.status === 'Sold' ? 'border-zinc-700 text-zinc-400' :
                        'border-zinc-700 text-zinc-300'
                      }`}
                    >
                      <option value="Available" className="bg-zinc-950 text-white">Available</option>
                      <option value="Booked" className="bg-zinc-950 text-zinc-300">Booked</option>
                      <option value="Sold" className="bg-zinc-950 text-zinc-400">Sold</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/dealer-management/inventory/edit/${car.id}`} className="p-2 text-zinc-400 hover:text-white bg-zinc-900/30 hover:bg-white/5 border border-white/5 hover:border-white/30 rounded-xl transition-all">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => setDeletingVehicle(car)} className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900/30 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 rounded-xl transition-all" title="Delete Listing">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid Layout - optimized for portrait & small devices */}
        <div className="block md:hidden divide-y divide-white/5">
          {filteredVehicles.map(car => (
            <div key={car.id} className="p-4 flex flex-col space-y-4">
              <div className="flex space-x-4 items-start">
                <img 
                  src={car.images?.[0] || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"} 
                  alt="" 
                  className="w-20 h-16 object-cover rounded-lg border border-white/5 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-extrabold text-white text-sm truncate">{car.make} {car.model}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-mono uppercase tracking-wider">{car.year} • {car.fuelType}</p>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">{car.registration || "N/A"}</span>
                    <span className="text-xs font-sans font-bold text-white">{formatPrice(car.price)}</span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons row */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.03]">
                <div className="flex-1">
                  <select 
                    value={car.status}
                    onChange={(e) => updateVehicle(car.id, { status: e.target.value as any })}
                    className={`w-full py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest border outline-none cursor-pointer bg-zinc-950 focus:border-white transition-all font-mono ${
                      car.status === 'Available' ? 'border-white/20 text-white bg-white/10' :
                      car.status === 'Sold' ? 'border-zinc-700 text-zinc-400' :
                      'border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <option value="Available" className="bg-zinc-950 text-white">Available</option>
                    <option value="Booked" className="bg-zinc-950 text-zinc-300">Booked</option>
                    <option value="Sold" className="bg-zinc-950 text-zinc-400">Sold</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Link to={`/dealer-management/inventory/edit/${car.id}`} className="p-2 text-zinc-300 hover:text-white bg-zinc-900/40 hover:bg-white/5 border border-white/5 hover:border-white/25 rounded-xl transition-all" title="Edit Car">
                    <Edit className="w-4.5 h-4.5" />
                  </Link>
                  <button onClick={() => setDeletingVehicle(car)} className="p-2 text-zinc-300 hover:text-red-400 bg-zinc-900/40 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 rounded-xl transition-all" title="Delete Listing">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">No luxury vehicles found matching criteria.</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-serif font-bold text-white tracking-wide uppercase">
                  Delete Vehicle Listing?
                </h3>
                <p className="text-zinc-300 text-xs leading-relaxed font-sans">
                  Do you want to surely delete the listing for{' '}
                  <span className="font-bold text-white">
                    {deletingVehicle.make} {deletingVehicle.model}
                  </span>
                  {deletingVehicle.registration && ` (${deletingVehicle.registration})`}?
                </p>
                <p className="text-zinc-500 text-[11px] font-mono">
                  This action will permanently remove this car from your showroom inventory.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeletingVehicle(null)}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-bold uppercase tracking-wider transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = deletingVehicle.id;
                  setDeletingVehicle(null);
                  await removeVehicle(targetId);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
