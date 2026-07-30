import { Car, Users, Plus, Settings, ChevronRight, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { vehicles, leads } = useVehicles();

  const activeCars = vehicles.filter(v => v.status === 'Available').length;
  const soldCars = vehicles.filter(v => v.status === 'Sold').length;
  const newLeadsCount = leads.filter(l => l.status === 'New Lead').length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-widest uppercase">
            Dealer Dashboard
          </h1>
          <p className="text-zinc-400 text-xs mt-1 font-mono uppercase tracking-wider">
            Showroom overview & quick management controls.
          </p>
        </div>
        <Link
          to="/dealer-management/inventory/add"
          className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 text-xs uppercase font-mono tracking-widest transition-all shadow-md shadow-white/5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </Link>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/dealer-management/inventory"
          className="bg-zinc-950/70 hover:bg-zinc-900/80 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all group flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">Manage Inventory</p>
              <p className="text-zinc-500 text-[11px] font-mono mt-0.5">{vehicles.length} Total Vehicles</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          to="/dealer-management/leads"
          className="bg-zinc-950/70 hover:bg-zinc-900/80 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all group flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">Customer Leads</p>
              <p className="text-zinc-500 text-[11px] font-mono mt-0.5">{newLeadsCount} Pending Inquiries</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>

        <Link
          to="/dealer-management/settings"
          className="bg-zinc-950/70 hover:bg-zinc-900/80 border border-white/10 hover:border-white/20 p-5 rounded-2xl transition-all group flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">Site Settings</p>
              <p className="text-zinc-500 text-[11px] font-mono mt-0.5">Showroom & Hero Config</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-950/60 p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Active Inventory</p>
            <p className="text-3xl font-bold text-white mt-1 font-mono">{activeCars}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-950/60 p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Total Inquiries</p>
            <p className="text-3xl font-bold text-white mt-1 font-mono">{leads.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-950/60 p-6 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Vehicles Sold</p>
            <p className="text-3xl font-bold text-white mt-1 font-mono">{soldCars}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-zinc-950/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="font-serif font-bold text-white text-base tracking-widest uppercase">Recent Inquiries</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Latest buyer inquiries and lead activity</p>
          </div>
          <Link to="/dealer-management/leads" className="text-xs text-white hover:text-zinc-300 font-semibold font-mono uppercase tracking-wider transition-colors flex items-center gap-1">
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-mono text-xs uppercase tracking-wider">
            No customer inquiries received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-white/5 text-zinc-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Vehicle Interest</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {leads.slice(0, 5).map(lead => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-sans font-bold text-white">{lead.name}</td>
                    <td className="px-6 py-4 text-zinc-300">{lead.car}</td>
                    <td className="px-6 py-4 text-zinc-400 text-[11px]">{lead.phone || lead.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        lead.status === 'New Lead' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        lead.status === 'Contacted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-[11px]">{lead.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


