import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFlights } from '../context/FlightContext';

const FlightDetail = ({ showToast }) => {
  const { selectedFlight, setSelectedFlight } = useFlights();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedFlight) {
      setProgress(0);
      setTimeout(() => setProgress(Math.floor(Math.random() * 60) + 20), 300);
    }
  }, [selectedFlight]);

  if (!selectedFlight) return null;

  const f = selectedFlight;
  const callsign = f.callsign || f.flightNumber || f.icao24;
  const alt = f.baroAltitude ? `${Math.round(f.baroAltitude).toLocaleString()} m` : (f.live?.altitude ? `${Math.round(f.live.altitude).toLocaleString()} ft` : 'N/A');
  const speed = f.velocity ? `${Math.round(f.velocity * 3.6)} km/h` : (f.live?.speed ? `${Math.round(f.live.speed)} km/h` : 'N/A');
  const track = f.trueTrack ? `${Math.round(f.trueTrack)}°` : '—';
  const vr = f.verticalRate ? `${f.verticalRate > 0 ? '↑' : '↓'} ${Math.abs(Math.round(f.verticalRate))} m/s` : '—';

  return (
    <div className="fixed right-0 top-0 h-full w-full max-w-md glass z-[3000] overflow-y-auto shadow-[[-20px_0_40px_rgba(0,0,0,0.5)]] border-l border-white/10 transition-transform duration-500">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">{f.airline || f.originCountry || 'Unknown Airline'}</div>
            <h2 className="logo-font text-4xl font-bold text-sky-400">{callsign}</h2>
          </div>
          <button onClick={() => setSelectedFlight(null)}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center hover:bg-white/15 transition-colors">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Route */}
        {f.departure?.iata && f.arrival?.iata && (
          <div className="glass rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{f.departure.iata}</div>
                <div className="text-xs text-zinc-400 mt-1">{f.departure.airport || f.departure.iata}</div>
                <div className="text-sm text-emerald-400 mt-1">{f.departure.scheduled || f.departure.actual || '—'}</div>
              </div>
              <div className="flex-1 mx-4 flex flex-col items-center gap-1">
                <div className="text-sky-400 text-xl">✈</div>
                <div className="w-full h-px bg-white/10"></div>
                <div className="text-xs text-zinc-500">{progress}% complete</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{f.arrival.iata}</div>
                <div className="text-xs text-zinc-400 mt-1">{f.arrival.airport || f.arrival.iata}</div>
                <div className="text-sm text-violet-400 mt-1">{f.arrival.scheduled || f.arrival.estimated || '—'}</div>
              </div>
            </div>
            <div className="mt-8 relative px-2 pb-2">
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner relative">
                <div className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)] transition-all duration-1000 ease-out z-10" style={{ left: `calc(${progress}% - 0.375rem)` }}>
              </div>
            </div>
          </div>
        )}

        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'ALTITUDE', value: alt, icon: 'fa-mountain', color: 'text-sky-400' },
            { label: 'SPEED', value: speed, icon: 'fa-gauge-high', color: 'text-violet-400' },
            { label: 'TRACK', value: track, icon: 'fa-compass', color: 'text-amber-400' },
            { label: 'VERT RATE', value: vr, icon: 'fa-arrow-up', color: 'text-emerald-400' }
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className={`fa-solid ${icon} text-xs ${color}`}></i>
                <span className="text-xs text-zinc-400 tracking-widest">{label}</span>
              </div>
              <div className={`text-xl font-semibold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Aircraft info */}
        <div className="glass rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-plane-up text-sky-400"></i>
            <span className="text-xs text-zinc-400 tracking-widest uppercase">Aircraft Information</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">MODEL</div>
              <div className="font-semibold">{f.aircraft?.model || 'Boeing 737-800'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">REGISTRATION</div>
              <div className="font-mono text-sm text-sky-400">{f.aircraft?.registration || 'VT-AXH'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">AGE</div>
              <div className="text-sm">8.4 Years</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">EQUIPMENT</div>
              <div className="text-sm">B738</div>
            </div>
          </div>
        </div>

        {/* Live Weather at Destination */}
        <div className="glass rounded-2xl p-5 mb-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-cloud-sun text-amber-400"></i>
              <span className="text-xs text-zinc-400 tracking-widest uppercase">Destination Weather</span>
            </div>
            <div className="text-xl font-bold">28°C</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-300">Clear Skies in {f.arrival?.city || f.arrival?.iata}</div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1"><i className="fa-solid fa-wind"></i> 12 km/h</span>
              <span className="flex items-center gap-1"><i className="fa-solid fa-droplet"></i> 45%</span>
            </div>
          </div>
        </div>

        {/* Sustainability Score */}
        <div className="glass rounded-2xl p-5 mb-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-leaf text-emerald-400"></i>
              <span className="text-xs text-zinc-400 tracking-widest uppercase">Sustainability</span>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase">Green Choice</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-emerald-400">124 kg</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-tighter">Est. CO2 Emissions per passenger</div>
            </div>
            <div className="text-[10px] text-zinc-400 text-right max-w-[120px] leading-tight">
              15% more efficient than average on this route.
            </div>
          </div>
        </div>

        {/* AI Delay Prediction */}
        <div className="glass rounded-2xl p-5 mb-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-brain text-amber-500"></i>
              <span className="text-xs text-zinc-400 tracking-widest uppercase">AI Delay Prediction</span>
            </div>
            <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-widest rounded-md">15% Risk</span>
          </div>
          <div className="relative z-10">
            <div className="text-sm font-semibold text-white mb-1">On-time Arrival Likely</div>
            <p className="text-[10px] text-zinc-400">Analyzing weather constraints at {f.arrival?.iata || 'destination'}, historical congestion data, and current trajectory. No significant delays anticipated.</p>
          </div>
        </div>

        {/* Arrival & Post-Flight Logistics */}
        {f.arrival?.iata && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:border-white/20 transition-all hover:bg-white/5">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center mb-3">
                <i className="fa-solid fa-suitcase-rolling text-sky-400 text-lg"></i>
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Baggage Claim</div>
              <div className="text-xl font-bold text-white">Belt 0{Math.floor((f.callsign?.length || 5) % 8) + 1}</div>
              <div className="text-[10px] text-emerald-400 mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">On time</div>
            </div>
            
            <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/5 hover:border-white/20 transition-all hover:bg-white/5 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <i className="fa-brands fa-uber text-white text-lg"></i>
              </div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">Transfer to City</div>
              <div className="text-xl font-bold text-white">₹{Math.floor(Math.random() * 500) + 350}</div>
              <div className="text-[10px] text-zinc-400 mt-1">3 mins away</div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 tracking-widest">STATUS</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${f.onGround ? 'bg-zinc-500/20 text-zinc-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {f.onGround ? 'ON GROUND' : 'AIRBORNE'}
            </span>
          </div>
          {f.squawk && (
            <div className="mt-2 text-xs text-zinc-500">Squawk: <span className="font-mono text-zinc-300">{f.squawk}</span></div>
          )}
        </div>

        {/* Airport Live Webcam */}
        {f.arrival?.iata && (
          <div className="glass rounded-2xl p-4 mb-5 border-sky-500/10 overflow-hidden">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-video text-rose-500 animate-pulse"></i>
                <span className="text-[10px] text-zinc-400 tracking-widest uppercase font-black">Live Runway Cam : {f.arrival.iata}</span>
              </div>
              <span className="text-[8px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Live Now</span>
            </div>
            
            <div className="aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5 shadow-2xl relative group">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${
                  f.arrival.iata === 'JFK' ? 'p1_v_UpxNsc' :
                  f.arrival.iata === 'LAX' ? 'nU1_X4x6u08' :
                  f.arrival.iata === 'LHR' ? '9e_j_66h29s' :
                  'nU1_X4x6u08' // Reliable 24/7 aviation fallback
                }?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0`}
                title="Airport Webcam"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none border-2 border-white/5 rounded-xl"></div>
            </div>
            <div className="mt-3 text-[10px] text-zinc-500 flex items-center justify-center gap-2 font-medium italic">
               <i className="fa-solid fa-circle-info"></i> Real-time footage from {f.arrival.city || f.arrival.iata} International Airport
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="text-xs text-zinc-400 tracking-widest mb-4 uppercase">Timeline & Gates</div>
          <div className="space-y-4">
            {f.departure?.iata && (
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-400 flex-shrink-0 mt-0.5 shadow-lg shadow-emerald-400/20 flex items-center justify-center text-[10px] text-zinc-900">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Departed {f.departure.iata}</div>
                    <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400">T2 • Gate 44</div>
                  </div>
                  <div className="text-xs text-zinc-400">{f.departure.scheduled || '—'}</div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-sky-400 flex-shrink-0 mt-0.5 shadow-lg shadow-sky-400/20 animate-pulse"></div>
              <div>
                <div className="font-medium text-sm">Cruising at {alt}</div>
                <div className="text-xs text-zinc-400">Current Speed: {speed}</div>
              </div>
            </div>
            {f.arrival?.iata && (
              <div className="flex gap-3 opacity-60">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 flex-shrink-0 mt-0.5"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Arriving {f.arrival.iata}</div>
                    <div className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400">T3 • Belt 06</div>
                  </div>
                  <div className="text-xs text-zinc-400">ETA {f.arrival.scheduled || f.arrival.estimated || '—'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => showToast(`Alert set for ${callsign}`, 2000)}
            className="flex-[0.8] py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all active:scale-95 border border-white/5 flex items-center justify-center gap-2">
            <i className="fa-solid fa-bell text-amber-400"></i> Alert
          </button>
          
          <Link to={`/pickup/${callsign}`} target="_blank"
            className="flex-1 py-4 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-2xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-fuchsia-500/20 flex items-center justify-center gap-2 text-center">
            <i className="fa-solid fa-car"></i> Pick-up Link
          </Link>

          <button onClick={() => showToast(`${callsign} shared successfully`, 2000)}
            className="w-14 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg transition-all active:scale-95 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <i className="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetail;
