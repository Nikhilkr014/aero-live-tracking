import React, { useState } from 'react';
import { useFlights } from '../context/FlightContext';

const statusColor = {
  active: 'text-emerald-400 bg-emerald-400/10',
  scheduled: 'text-sky-400 bg-sky-400/10',
  landed: 'text-zinc-400 bg-zinc-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
  diverted: 'text-amber-400 bg-amber-400/10'
};

const FlightList = ({ showToast, fullPage }) => {
  const { filteredFlights, loading, setSelectedFlight, loadFlight, setSearchQuery, searchQuery } = useFlights();
  const [filter, setFilter] = useState('all');

  const displayed = filteredFlights.filter(f => {
    if (filter === 'airborne') return !f.onGround;
    if (filter === 'ground') return f.onGround;
    if (filter === 'intl') return f.originCountry !== 'India';
    return true;
  }).slice(0, fullPage ? 200 : 25);

  const handleClick = async (flight) => {
    const detail = await loadFlight(flight.callsign || flight.icao24);
    setSelectedFlight(detail || flight);
    showToast(`Tracking ${flight.callsign || flight.icao24}`, 1800);
  };

  return (
    <div className={`glass rounded-3xl overflow-hidden ${fullPage ? 'p-0' : ''}`}>
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <i className="fa-solid fa-list text-sky-400"></i>
            Live Flights
            <span className="text-xs text-zinc-500 font-normal">({filteredFlights.length})</span>
          </h2>
          {loading && <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>}
        </div>

        {/* Search */}
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          type="text"
          placeholder="Filter flights..."
          className="w-full bg-white/5 rounded-2xl px-4 py-2.5 text-sm outline-none border border-white/10 focus:border-sky-400 transition-all placeholder-zinc-500 mb-3"
        />

        {/* Filters */}
        <div className="flex gap-2 text-xs">
          {[['all','All'],['airborne','Airborne'],['ground','Ground'],['intl','International']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-xl transition-all ${filter === val ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-zinc-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Flight rows */}
      <div className={`overflow-y-auto ${fullPage ? 'max-h-[calc(100vh-220px)]' : 'max-h-[520px]'}`}>
        {displayed.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <i className="fa-solid fa-plane text-4xl mb-3 block opacity-30"></i>
            {loading ? 'Loading flights...' : 'No flights found'}
          </div>
        ) : (
          displayed.map((flight, i) => {
            const callsign = flight.callsign || flight.flightNumber || flight.icao24;
            const status = flight.status || (flight.onGround ? 'ground' : 'active');
            const alt = flight.baroAltitude ? `${(flight.baroAltitude / 1000).toFixed(1)}km` : '—';
            const spd = flight.velocity ? `${Math.round(flight.velocity * 3.6)} km/h` : '—';

            return (
              <div
                key={flight.icao24 + i}
                onClick={() => handleClick(flight)}
                className="px-5 py-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`text-xl ${flight.onGround ? 'opacity-40' : ''}`}
                       style={{ transform: `rotate(${flight.trueTrack || 0}deg)`, display: 'inline-block', color: '#38bdf8' }}>✈</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{callsign}</span>
                      {flight.airline && <span className="text-xs text-zinc-500 truncate">{flight.airline}</span>}
                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColor[status] || statusColor.active}`}>
                        {flight.onGround ? 'GROUND' : 'AIRBORNE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      {flight.departure?.iata && <span>{flight.departure.iata}</span>}
                      {flight.departure?.iata && flight.arrival?.iata && <span>→</span>}
                      {flight.arrival?.iata && <span>{flight.arrival.iata}</span>}
                      {!flight.departure?.iata && <span>{flight.originCountry}</span>}
                    </div>
                  </div>

                  <div className="text-right text-xs text-zinc-500 flex-shrink-0 flex flex-col items-end justify-center">
                    <div>{alt}</div>
                    <div>{spd}</div>

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FlightList;
