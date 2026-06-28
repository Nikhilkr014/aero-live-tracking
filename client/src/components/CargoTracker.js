import React, { useState } from 'react';
import { cargoAPI } from '../services/api';

const statusMap = {
  booked: { label: 'Booked', color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  accepted: { label: 'Accepted', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  loaded: { label: 'Loaded', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  in_transit: { label: 'In Transit', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  arrived: { label: 'Arrived', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  delivered: { label: 'Delivered', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  held: { label: 'On Hold', color: 'text-red-400', bg: 'bg-red-400/10' }
};

const CargoTracker = ({ showToast }) => {
  const [awb, setAwb] = useState('AWB998877665');
  const [cargo, setCargo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    const id = awb.trim().toUpperCase();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await cargoAPI.getByAWB(id);
      setCargo(res.data.data);
    } catch (err) {
      setError('AWB not found on Delhivery Network. Try AWB998877665');
      setCargo(null);
    } finally {
      setLoading(false);
    }
  };

  const st = cargo ? (statusMap[cargo.status] || statusMap.booked) : null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-red-600/20 rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-box-open text-red-500 text-2xl"></i></div>
          <div className="h-10 w-px bg-white/10"></div>
          <div className="text-left">
            <div className="text-[10px] font-bold tracking-[0.2em] text-red-500 uppercase">Official Partner</div>
            <div className="text-3xl font-black logo-font tracking-tighter">DELHIVERY <span className="text-zinc-500 font-light">X AEROLIVE</span></div>
          </div>
        </div>
        <h2 className="text-xl font-medium text-zinc-300">Global Cargo & Parcel Visibility</h2>
        <p className="text-sm text-zinc-500 mt-2 italic">Real-time tracking for items handled by Delhivery's global logistics network</p>
      </div>

      {/* Search */}
      <div className="glass rounded-3xl p-8 mb-8">
        <div className="flex gap-4">
          <input
            value={awb}
            onChange={e => setAwb(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            type="text"
            placeholder="Enter Delhivery Waybill / AWB..."
            className="flex-1 bg-white/5 text-2xl placeholder-zinc-600 rounded-2xl px-6 py-5 outline-none border border-white/5 focus:border-red-500/50 focus:bg-white/10 focus:shadow-[0_0_30px_-5px_rgba(239,68,68,0.35)] transition-all font-mono"
          />
          <button
            onClick={handleTrack}
            disabled={loading}
            className="px-10 py-5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-red-600/10"
          >
            {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fa-solid fa-truck-fast"></i>}
            TRACK
          </button>
        </div>

        <div className="flex gap-2 mt-4 items-center">
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Quick Demo:</span>
          {['AWB998877665', 'AWB123456789'].map(a => (
            <button key={a} onClick={() => setAwb(a)}
              className="text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors bg-sky-400/10 px-2 py-1 rounded-lg">{a}</button>
          ))}
        </div>

        {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <i className="fa-solid fa-circle-exclamation"></i> {error}
        </div>}
      </div>

      {/* Result */}
      {cargo && (
        <div className="glass rounded-[2.5rem] p-10 animate-fade-in border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <i className="fa-solid fa-truck-fast text-9xl -rotate-12"></i>
          </div>

          <div className="flex items-start justify-between mb-10 relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-red-500 tracking-[0.2em] uppercase">Delhivery Waybill</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Verified</span>
              </div>
              <div className="font-mono text-4xl font-black tracking-tighter text-white">{cargo.awb}</div>
            </div>
            <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg ${st.bg} ${st.color} border border-white/5`}>
              {st.label}
            </div>
          </div>

          {/* Route */}
          <div className="glass rounded-[2rem] p-8 mb-8 border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-zinc-500 font-bold tracking-widest mb-1 uppercase">Origin</div>
                <div className="text-3xl font-black tracking-tighter">{cargo.origin?.iata || cargo.origin?.city?.substring(0,3).toUpperCase()}</div>
                <div className="text-sm text-zinc-400 mt-1">{cargo.origin?.city}</div>
              </div>
              
              <div className="flex-[2] px-6 text-center">
                <div className="relative h-12 flex items-center justify-center">
                  <div className="absolute w-full h-px bg-dashed-gradient opacity-20"></div>
                  <div className="relative z-10 bg-zinc-950 px-4 py-2 border border-white/10 rounded-full flex items-center gap-3">
                    {cargo.status === 'in_transit' ? (
                      <i className="fa-solid fa-plane text-sky-400 animate-pulse"></i>
                    ) : (
                      <i className="fa-solid fa-truck text-red-500"></i>
                    )}
                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{cargo.progress || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 text-right">
                <div className="text-xs text-zinc-500 font-bold tracking-widest mb-1 uppercase">Destination</div>
                <div className="text-3xl font-black tracking-tighter">{cargo.destination?.iata || cargo.destination?.city?.substring(0,3).toUpperCase()}</div>
                <div className="text-sm text-zinc-400 mt-1">{cargo.destination?.city}</div>
              </div>
            </div>
            
            <div className="mt-8">
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-600 via-sky-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${cargo.progress || 0}%` }}></div>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Weight', value: `${cargo.weight} kg`, icon: 'fa-weight-hanging' },
              { label: 'Pieces', value: cargo.pieces || 1, icon: 'fa-cubes' },
              { label: 'Service', value: 'Delhivery Air', icon: 'fa-bolt', color: 'text-red-500' },
              { label: 'Commodity', value: cargo.commodity || 'General', icon: 'fa-box' }
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="glass rounded-2xl p-5 border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <i className={`fa-solid ${icon} text-[10px] text-zinc-500`}></i>
                  <div className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{label}</div>
                </div>
                <div className={`text-lg font-bold ${color || 'text-white'}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Events timeline */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <i className="fa-solid fa-list-ul text-red-500 text-xs"></i>
                <h3 className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">Shipment Activity</h3>
              </div>
              <div className="space-y-6 relative ml-2">
                <div className="absolute left-0 top-2 bottom-2 w-px bg-white/5"></div>
                {[...cargo.events].reverse().map((ev, i) => (
                  <div key={i} className="flex gap-6 relative">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 z-10 outline outline-4 outline-zinc-950 ${i === 0 ? 'bg-red-500 shadow-lg shadow-red-500/50 pulse-small' : 'bg-zinc-700'}`}></div>
                    <div>
                      <div className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-zinc-300'}`}>{ev.description}</div>
                      <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot"></i> {ev.location || 'Hub'}</span>
                        <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {new Date(ev.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Parties */}
            <div className="space-y-4">
              <div className="glass rounded-[2rem] p-6 border-white/5">
                <div className="text-[10px] font-bold text-zinc-500 tracking-widest mb-4 uppercase">Pickup From</div>
                <div className="font-bold text-sm mb-1">{cargo.shipper}</div>
                <div className="text-xs text-zinc-500 leading-relaxed">Verified Delhivery Business Partner</div>
              </div>
              <div className="glass rounded-[2rem] p-6 border-white/5">
                <div className="text-[10px] font-bold text-zinc-500 tracking-widest mb-4 uppercase">Delivering To</div>
                <div className="font-bold text-sm mb-1">{cargo.consignee}</div>
                <div className="text-xs text-zinc-500 leading-relaxed">Direct Doorstep Delivery Scheduled</div>
              </div>
              {cargo.eta && (
                <div className="bg-gradient-to-br from-red-600/20 to-red-900/20 rounded-[2rem] p-6 border border-red-500/20">
                  <div className="text-[10px] font-bold text-red-500 tracking-widest mb-2 uppercase">Expected Arrival</div>
                  <div className="text-lg font-black tracking-tighter text-white">
                    {new Date(cargo.eta).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CargoTracker;
