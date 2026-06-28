const AIRPORTS = [
  { iata: 'DEL', icao: 'VIDP', name: 'Indira Gandhi International', city: 'New Delhi', country: 'India', lat: 28.5665, lng: 77.1031, timezone: 'Asia/Kolkata', terminals: 3, runways: 3 },
  { iata: 'BOM', icao: 'VABB', name: 'Chhatrapati Shivaji Maharaj International', city: 'Mumbai', country: 'India', lat: 19.0896, lng: 72.8656, timezone: 'Asia/Kolkata', terminals: 2, runways: 2 },
  { iata: 'BLR', icao: 'VOBL', name: 'Kempegowda International', city: 'Bengaluru', country: 'India', lat: 13.1986, lng: 77.7066, timezone: 'Asia/Kolkata', terminals: 2, runways: 2 },
  { iata: 'MAA', icao: 'VOMM', name: 'Chennai International', city: 'Chennai', country: 'India', lat: 12.9941, lng: 80.1709, timezone: 'Asia/Kolkata', terminals: 4, runways: 3 },
  { iata: 'HYD', icao: 'VOHS', name: 'Rajiv Gandhi International', city: 'Hyderabad', country: 'India', lat: 17.2403, lng: 78.4294, timezone: 'Asia/Kolkata', terminals: 1, runways: 2 },
  { iata: 'CCU', icao: 'VECC', name: 'Netaji Subhash Chandra Bose International', city: 'Kolkata', country: 'India', lat: 22.6520, lng: 88.4463, timezone: 'Asia/Kolkata', terminals: 2, runways: 2 },
  { iata: 'AMD', icao: 'VAAH', name: 'Sardar Vallabhbhai Patel International', city: 'Ahmedabad', country: 'India', lat: 23.0772, lng: 72.6347, timezone: 'Asia/Kolkata', terminals: 2, runways: 2 },
  { iata: 'COK', icao: 'VOCI', name: 'Cochin International', city: 'Kochi', country: 'India', lat: 10.1520, lng: 76.3919, timezone: 'Asia/Kolkata', terminals: 4, runways: 1 },
  { iata: 'GOI', icao: 'VOGO', name: 'Goa International', city: 'Goa', country: 'India', lat: 15.3808, lng: 73.8314, timezone: 'Asia/Kolkata', terminals: 2, runways: 1 },
  { iata: 'PNQ', icao: 'VAPO', name: 'Pune Airport', city: 'Pune', country: 'India', lat: 18.5822, lng: 73.9197, timezone: 'Asia/Kolkata', terminals: 1, runways: 1 }
];

const getAirports = async (req, res) => {
  res.json({ success: true, count: AIRPORTS.length, data: AIRPORTS });
};

const getAirportByCode = async (req, res) => {
  const { code } = req.params;
  const airport = AIRPORTS.find(a =>
    a.iata.toLowerCase() === code.toLowerCase() ||
    a.icao.toLowerCase() === code.toLowerCase()
  );
  if (!airport) return res.status(404).json({ success: false, message: 'Airport not found' });

  // Add mock live status
  const liveStatus = {
    ...airport,
    weather: { temp: Math.floor(Math.random() * 15) + 20, condition: ['Clear', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)], wind: Math.floor(Math.random() * 20) + 5, humidity: Math.floor(Math.random() * 40) + 40 },
    delays: { average: Math.floor(Math.random() * 20), reason: Math.random() > 0.7 ? 'Weather' : 'Traffic' },
    arrivals: Math.floor(Math.random() * 8) + 2,
    departures: Math.floor(Math.random() * 8) + 2
  };

  res.json({ success: true, data: liveStatus });
};

module.exports = { getAirports, getAirportByCode };
