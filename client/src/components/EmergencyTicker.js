import React from 'react';
import { useFlights } from '../context/FlightContext';

const EmergencyTicker = () => {
  const { emergencyFlights, setFlyToFlight, setSelectedFlight } = useFlights();

  if (!emergencyFlights || emergencyFlights.length === 0) return null;

  return (
    <div className="bg-red-600 text-white py-2 px-4 flex items-center justify-between z-[4000] relative overflow-hidden">
      <div className="flex items-center gap-4 w-full">
        <span className="flex items-center gap-2 font-black uppercase text-[10px] sm:text-xs tracking-widest whitespace-nowrap bg-red-800 px-3 py-1 rounded-full shadow-lg">
          <i className="fa-solid fa-triangle-exclamation animate-pulse"></i> Global Emergency Alert
        </span>
        <div className="flex gap-8 overflow-x-auto no-scrollbar py-1">
          {emergencyFlights.map(f => (
            <button 
              key={f.icao24}
              onClick={() => {
                setFlyToFlight(f);
                setSelectedFlight(f);
              }}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-1 rounded-lg transition-all border border-white/10 whitespace-nowrap"
            >
               <span className="font-black text-xs">SQ{f.squawk}</span>
               <span className="font-bold text-sm tracking-tight">{f.callsign || f.icao24}</span>
               <span className="text-[10px] opacity-70">({f.originCountry})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="text-[10px] font-black opacity-80 whitespace-nowrap tracking-widest uppercase ml-4 hidden lg:block">
        Click to Intercept trajectory
      </div>
    </div>
  );
};

export default EmergencyTicker;
