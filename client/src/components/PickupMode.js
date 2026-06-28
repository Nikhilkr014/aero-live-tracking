import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFlights } from '../context/FlightContext';

const PickupMode = () => {
  const { flightId } = useParams();
  const { loadFlight } = useFlights();
  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlight = async () => {
      const data = await loadFlight(flightId);
      setF(data);
      setLoading(false);
    };
    fetchFlight();
  }, [flightId, loadFlight]);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex items-center justify-center">
        <div className="animate-spin text-sky-400 text-4xl"><i className="fa-solid fa-spinner"></i></div>
      </div>
    );
  }

  if (!f) {
    return (
      <div className="bg-zinc-950 min-h-screen text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="text-zinc-500 text-6xl mb-4"><i className="fa-solid fa-plane-slash"></i></div>
        <h2 className="text-2xl font-bold mb-2">Flight Not Found</h2>
        <p className="text-zinc-400 mb-8">The flight {flightId} is either completed, invalid, or out of range.</p>
        <Link to="/" className="bg-sky-500 px-6 py-3 rounded-2xl font-bold">Return Home</Link>
      </div>
    );
  }

  const dest = f.arrival?.iata || 'Airport';
  const eta = f.arrival?.estimated || f.arrival?.scheduled || 'Unknown time';

  return (
    <div className="bg-zinc-950 min-h-screen text-white flex flex-col items-center p-6 sm:p-12 relative overflow-hidden font-sans">
      {/* Cool animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/30 to-zinc-950 z-0"></div>
      
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        <Link to="/" className="text-sky-400 flex items-center gap-2 self-start mb-8 opacity-70 hover:opacity-100">
          <i className="fa-solid fa-arrow-left"></i> Full Tracker
        </Link>

        {/* Massive ETA Screen */}
        <div className="text-center mb-12 animate-fade-in w-full">
          <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Estimated Arrival</div>
          <div className="text-6xl sm:text-8xl font-black text-white logo-font tracking-tighter" style={{ textShadow: '0 0 40px rgba(56,189,248,0.3)' }}>
            {eta}
          </div>
          <div className="mt-4 text-xl text-sky-400 font-medium">in {dest}</div>
        </div>

        {/* Simple Status Cards */}
        <div className="w-full grid grid-cols-2 gap-4 mb-8">
          <div className="glass rounded-3xl p-6 text-center border-emerald-500/20 bg-emerald-500/5">
            <div className="text-emerald-400 mb-2 text-2xl"><i className="fa-solid fa-plane-circle-check"></i></div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Status</div>
            <div className="font-bold text-emerald-400">{f.onGround ? 'Arrived' : 'Airborne'}</div>
          </div>
          
          <div className="glass rounded-3xl p-6 text-center">
            <div className="text-sky-400 mb-2 text-2xl"><i className="fa-solid fa-door-open"></i></div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Arrival Gate</div>
            <div className="font-bold text-white text-xl">4B</div>
          </div>
        </div>

        {/* Baggage & Uber */}
        <div className="w-full glass rounded-3xl p-6 flex flex-col gap-4 mb-12 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl text-zinc-400"><i className="fa-solid fa-suitcase-rolling"></i></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-0.5">Baggage Claim</div>
              <div className="font-bold text-white text-lg">Belt 0{Math.floor((f.callsign?.length || 5) % 8) + 1}</div>
            </div>
          </div>
          <div className="h-px w-full bg-zinc-800"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-xl text-white"><i className="fa-brands fa-uber"></i></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-zinc-500 mb-0.5">Ride to city</div>
              <div className="font-bold text-white text-lg">~ ₹{Math.floor(Math.random() * 500) + 400}</div>
            </div>
            <button className="ml-auto bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all">Book</button>
          </div>
        </div>
        
        <div className="text-center text-zinc-600 text-[10px] tracking-widest uppercase">
          Tracking Flight <span className="text-zinc-500">{flightId}</span>
        </div>
      </div>
    </div>
  );
};

export default PickupMode;
