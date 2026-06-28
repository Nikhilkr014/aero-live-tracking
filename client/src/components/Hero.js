import React, { useState, useEffect } from 'react';
import { useFlights } from '../context/FlightContext';
import { cargoAPI } from '../services/api';

const Hero = ({ showToast }) => {
  const { flights, stats, loadFlight, loadFlightsByRoute, setSelectedFlight, routeFilter, setRouteFilter } = useFlights();
  const [mode, setMode] = useState(0); // 0=flight, 1=route, 2=cargo
  const [flightInput, setFlightInput] = useState('');
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('DEL');
  const [awb, setAwb] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} IST`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTrackFlight = async () => {
    if (!flightInput.trim()) return;
    showToast(`Searching for ${flightInput.trim().toUpperCase()}...`, 1500);
    const f = await loadFlight(flightInput.trim().toUpperCase());
    if (f) {
      setSelectedFlight(f);
      showToast(`Tracking ${flightInput.toUpperCase()} live ✈️`, 2500);
      setFlightInput('');
    } else {
      showToast(`Flight ${flightInput.toUpperCase()} not found. Try one of the recent flights below.`, 3500);
    }
  };

  const handleTrackRoute = async () => {
    if (!from.trim() && !to.trim()) return;
    showToast(`Searching flights: ${from.toUpperCase() || 'Any'} → ${to.toUpperCase() || 'Any'}...`, 2000);
    const results = await loadFlightsByRoute(from.trim(), to.trim());
    if (results.length > 0) {
      showToast(`Found ${results.length} live flights on this route! ✈️`, 2500);
      // Scroll to map
      document.getElementById('live-map')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      showToast(`No live flights found for ${from} → ${to} right now.`, 3000);
    }
  };

  const handleTrackCargo = async () => {
    const id = awb.trim().toUpperCase() || 'AWB998877665';
    try {
      await cargoAPI.getByAWB(id);
      showToast(`Live tracking started for ${id}`, 2500);
    } catch { showToast('AWB not found. Try AWB998877665', 2500); }
  };

  return (
    <div className="relative min-h-[88vh] flex items-center overflow-hidden">
      
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/HEADER-BG.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-zinc-950/70 z-0"></div>

      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at 30% 40%, rgba(56,189,248,0.1) 0%, transparent 60%)' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at 70% 60%, rgba(139,92,246,0.1) 0%, transparent 50%)' }}></div>


      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-20 lg:pt-28 pb-16 relative z-10 w-full parallax-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left */}
          <div className="lg:col-span-5 reveal active">
            <div className="inline-flex items-center gap-2.5 bg-white/5 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/10 mb-6 glass">
              <div className="radar-dot-wrapper">
                <div className="radar-pulse-ring"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              {flights.length > 0 ? `${flights.length} flights tracked live right now` : 'Connecting to live radar...'}
            </div>

            <h1 className="logo-font text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-4">
              TRACK ANY FLIGHT OR <br />
              <span className="text-transparent bg-clip-text animate-gradient" style={{ backgroundImage: 'linear-gradient(to right, #38bdf8, #818cf8, #38bdf8)' }}>CARGO</span> IN REAL TIME
            </h1>

            {/* Feature Capsule Tags */}
            <div className="flex flex-wrap gap-2 max-w-lg mt-4 reveal delay-200">
              {['Live GPS', 'Weather Radar', 'Delays & Gates', 'Baggage', 'AWB Cargo'].map(tag => (
                <span key={tag} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 backdrop-blur-md shadow-sm">
                  {tag}
                </span>
              ))}
            </div>

            {/* Frosted Glass Metrics Panel */}
            <div className="flex gap-4 mt-8 reveal delay-400 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md max-w-md divide-x divide-white/10 shadow-xl items-center">
              <div className="flex-1 text-center pr-2">
                <div className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                  {stats.airborne ?? flights.filter(f => !f.onGround).length}
                </div>
                <div className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase mt-1">Airborne</div>
              </div>
              <div className="flex-1 text-center px-4">
                <div className="text-3xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.15)]">
                  {stats.onGround ?? flights.filter(f => f.onGround).length}
                </div>
                <div className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase mt-1">On Ground</div>
              </div>
              <div className="flex-1 text-center pl-4">
                <div className="text-3xl font-black text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.15)]">
                  {stats.total ?? flights.length}
                </div>
                <div className="text-[10px] tracking-widest text-zinc-400 font-bold uppercase mt-1">Total Tracked</div>
              </div>
            </div>
          </div>

          {/* Right: Search Card */}
          <div className="lg:col-span-7 reveal active">
            <div className="glass rounded-[2rem] p-6 lg:p-8 shadow-2xl max-w-xl mx-auto lg:ml-auto lg:mr-0 lg:-translate-x-[4px] shine-effect">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1 text-xs bg-white/5 rounded-xl p-1">
                  {['Flight Number', 'Route', 'Cargo AWB'].map((label, i) => (
                    <button
                      key={i}
                      onClick={() => setMode(i)}
                      className={`px-4 py-1.5 rounded-lg font-bold transition-all ${mode === i ? 'bg-white/15 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">{time}</div>
              </div>
 
              {/* Flight search */}
              {mode === 0 && (
                <div className="space-y-4 animate-slide-up">
                  <div className="search-glow-container">
                    <input
                      value={flightInput}
                      onChange={e => setFlightInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTrackFlight()}
                      type="text"
                      placeholder="AI101 • 6E456 • SG234"
                      className="w-full bg-zinc-950/80 text-xl placeholder-zinc-600 rounded-2xl px-6 py-4.5 outline-none border-none transition-all font-bold"
                    />
                  </div>
                  <button
                    onClick={handleTrackFlight}
                    className="w-full py-4 rounded-2xl text-base font-bold tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-sky-500/20"
                    style={{ background: 'linear-gradient(to right, #0ea5e9, #7c3aed)' }}
                  >
                    <i className="fa-solid fa-paper-plane text-sm"></i> TRACK FLIGHT NOW
                  </button>
                </div>
              )}
 
              {/* Route search */}
              {mode === 1 && (
                <div className="space-y-4 animate-slide-up">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative search-glow-container">
                      <label className="text-[9px] font-bold text-zinc-500 tracking-widest absolute left-5 top-2.5 uppercase z-10">Origin</label>
                      <input value={from} onChange={e => setFrom(e.target.value)} type="text"
                        className="w-full bg-zinc-950/80 text-xl placeholder-zinc-500 rounded-2xl px-5 pt-6 pb-2.5 outline-none border-none transition-all font-bold" />
                    </div>
                    <div className="relative search-glow-container">
                      <label className="text-[9px] font-bold text-zinc-500 tracking-widest absolute left-5 top-2.5 uppercase z-10">Destination</label>
                      <input value={to} onChange={e => setTo(e.target.value)} type="text"
                        className="w-full bg-zinc-950/80 text-xl placeholder-zinc-500 rounded-2xl px-5 pt-6 pb-2.5 outline-none border-none transition-all font-bold" />
                    </div>
                  </div>
                  <button
                    onClick={handleTrackRoute}
                    className="w-full py-4 rounded-2xl text-base font-bold tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-indigo-500/20"
                    style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
                  >
                    SHOW LIVE FLIGHTS
                  </button>
                  {(routeFilter.from || routeFilter.to) && (
                    <button 
                      onClick={() => { setRouteFilter({ from: '', to: '' }); showToast('Route filter cleared', 1500); }}
                      className="w-full py-2 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      CLEAR ROUTE FILTER
                    </button>
                  )}
                </div>
              )}
 
              {/* Cargo search */}
              {mode === 2 && (
                <div className="space-y-4 animate-slide-up">
                  <div className="search-glow-container">
                    <input
                      value={awb}
                      onChange={e => setAwb(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTrackCargo()}
                      type="text"
                      placeholder="AWB998877665"
                      className="w-full bg-zinc-950/80 text-xl placeholder-zinc-600 rounded-2xl px-6 py-4.5 outline-none border-none transition-all font-bold"
                    />
                  </div>
                  <button
                    onClick={handleTrackCargo}
                    className="w-full py-4 rounded-2xl text-base font-bold tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emerald-500/20"
                    style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
                  >
                    <i className="fa-solid fa-box text-sm"></i> TRACK CARGO NOW
                  </button>
                </div>
              )}
 
              {/* Quick access */}
              <div className="mt-6 pt-5 border-t border-white/5">
                <p className="text-[9px] font-bold text-zinc-500 tracking-[0.2em] mb-3 flex items-center gap-2 uppercase">
                  <i className="fa-solid fa-history"></i> Recent Lookups
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI101', '6E456', 'SG234'].map(f => (
                    <button key={f} onClick={() => { setFlightInput(f); setMode(0); }}
                      className="glass text-[11px] font-bold px-4 py-1.5 rounded-full hover:bg-white/10 transition-all border border-white/5">{f}</button>
                  ))}
                  <button onClick={() => { setAwb('AWB998877665'); setMode(2); }}
                    className="glass text-[11px] font-bold px-4 py-1.5 rounded-full hover:bg-white/10 transition-all border border-emerald-500/20 text-emerald-400">
                    AWB998877665
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
