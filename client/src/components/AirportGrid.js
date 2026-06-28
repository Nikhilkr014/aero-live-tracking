import React, { useEffect, useState } from 'react';
import { airportAPI } from '../services/api';

const AirportGrid = ({ showToast }) => {
  const [airports, setAirports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    airportAPI.getAll().then(res => setAirports(res.data.data));
  }, []);

  const handleSelect = async (airport) => {
    setSelected(airport.iata);
    const res = await airportAPI.getByCode(airport.iata);
    setDetail(res.data.data);
    showToast(`Loading live status for ${airport.iata}...`, 1500);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="logo-font text-4xl font-bold">Indian Airports</h2>
          <p className="text-zinc-400 mt-1">Live status, weather & delays</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {airports.map(airport => (
          <div
            key={airport.iata}
            onClick={() => handleSelect(airport)}
            className={`glass rounded-3xl p-6 cursor-pointer card-hover transition-all ${selected === airport.iata ? 'border-sky-500/50 ring-1 ring-sky-500/30' : ''}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-sky-400">{airport.iata}</div>
                <div className="text-xs font-mono text-zinc-500">{airport.icao}</div>
              </div>
              <div className="w-10 h-10 bg-sky-500/15 rounded-2xl flex items-center justify-center text-xl">✈️</div>
            </div>

            <h3 className="font-semibold mb-1 text-sm leading-tight">{airport.name}</h3>
            <p className="text-xs text-zinc-400 mb-4">{airport.city}, {airport.country}</p>

            <div className="flex gap-4 text-xs text-zinc-400">
              <div><span className="text-white font-medium">{airport.terminals}</span> Terminals</div>
              <div><span className="text-white font-medium">{airport.runways}</span> Runways</div>
            </div>

            {selected === airport.iata && detail && (
              <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Weather</span>
                  <span>{detail.weather?.temp}°C • {detail.weather?.condition}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Avg Delay</span>
                  <span className={detail.delays?.average > 15 ? 'text-amber-400' : 'text-emerald-400'}>
                    {detail.delays?.average} min
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Arrivals Now</span>
                  <span className="text-sky-400">{detail.arrivals}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Departures Now</span>
                  <span className="text-violet-400">{detail.departures}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Wind</span>
                  <span>{detail.weather?.wind} km/h</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AirportGrid;
