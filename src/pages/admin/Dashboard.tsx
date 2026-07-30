import { Car, Users, TrendingUp, IndianRupee } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import { useVehicles } from '../../context/VehicleContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { vehicles, leads, migrateLocalStorage, metrics, refreshInventory, seedSampleData } = useVehicles();
  const activeCars = vehicles.filter(v => v.status === 'Available').length;
  
  const totalCacheLookups = metrics.cacheHits + metrics.cacheMisses;
  const cacheHitRate = totalCacheLookups > 0 ? ((metrics.cacheHits / totalCacheLookups) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase">DEALER</h1>
          <p className="text-zinc-400 text-xs mt-2 font-mono uppercase tracking-wider">Showroom overview & active customer leads.</p>
        </div>
      </div>

      {/* Empty Database Welcoming Seed Banner */}
      {vehicles.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-1.5 relative z-10">
            <h3 className="font-serif font-bold text-white text-md uppercase tracking-widest flex items-center gap-2">
              <Car className="w-4 h-4 text-white" />
              Showroom Inventory Empty
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl font-sans">
              Currently, there are <strong>0 luxury vehicle listings</strong> in your custom showroom. Head over to the inventory section or use the quick actions to add your first premium vehicle listing!
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-zinc-950/65 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center shadow-lg">
          <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mr-4 border border-white/10">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Active Inventory</p>
            <p className="text-2xl font-bold text-white mt-1">{activeCars}</p>
          </div>
        </div>

        <div className="bg-zinc-950/65 backdrop-blur-md p-6 rounded-2xl border border-white/5 flex items-center shadow-lg">
          <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mr-4 border border-white/10">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Cars Sold (Total)</p>
            <p className="text-2xl font-bold text-white mt-1">{vehicles.filter(v => v.status === 'Sold').length}</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-zinc-950/65 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-serif font-bold text-white text-lg tracking-widest uppercase">Recent Leads</h2>
            <Link to="/dealer-management/leads" className="text-xs text-white hover:text-zinc-400 font-semibold font-mono uppercase tracking-wider transition-colors">View All &rarr;</Link>
          </div>
          <div className="p-0">
            {leads.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">No recent leads found.</div>
            ) : (
            <><div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
              <thead className="bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest font-mono border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Interest</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-250">
                {leads.slice(0, 4).map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors font-mono">
                    <td className="px-6 py-4 font-sans font-bold text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-zinc-300">{lead.car}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        lead.status === 'New Lead' ? 'bg-white/10 text-white border-white/20' :
                        lead.status === 'Contacted' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' :
                        'bg-zinc-950 text-zinc-500 border-zinc-900'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden divide-y divide-white/5 font-mono text-xs">
              {leads.slice(0, 4).map(lead => (
                <div key={lead.id} className="p-4 flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-extrabold text-white text-sm">{lead.name}</span>
                    <span className="text-[9px] text-zinc-500">{lead.date}</span>
                  </div>
                  <div className="text-zinc-300 text-[10px] uppercase tracking-wide truncate">
                    🚘 {lead.car}
                  </div>
                  <div className="pt-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${
                      lead.status === 'New Lead' ? 'bg-white/10 text-white border-white/20' :
                      lead.status === 'Contacted' ? 'bg-zinc-800 text-zinc-300 border-zinc-700' :
                      'bg-zinc-900 text-zinc-500 border-zinc-900'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-950/65 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg p-6 h-fit">
          <h2 className="font-serif font-bold text-white text-lg mb-4 tracking-widest uppercase">Quick Actions</h2>
          <div className="space-y-4 font-mono text-xs tracking-widest uppercase font-bold">
            <Link to="/dealer-management/inventory/add" className="w-full bg-white hover:bg-zinc-900 text-zinc-950 hover:text-white border border-transparent hover:border-white/20 py-4 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm">
              <Car className="w-4 h-4 mr-2" /> Add New Vehicle
            </Link>
            
            <button 
              onClick={async () => {
                const updated = await migrateLocalStorage();
                if (updated) {
                  alert('Successfully recovered your previously uploaded applet vehicles!');
                } else {
                  alert('No locally stored data found or it is already migrated.');
                }
              }}
              className="w-full bg-zinc-900/40 text-zinc-300 border border-zinc-800 hover:border-zinc-700 hover:text-white py-4 px-4 rounded-xl flex items-center justify-center transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" /> Recover Old Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

