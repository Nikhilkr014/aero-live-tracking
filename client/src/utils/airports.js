export const AIRPORTS = {
  // Major Indian Airports
  'DEL': { name: 'Indira Gandhi Intl', lat: 28.5562, lon: 77.1000 },
  'BOM': { name: 'Chhatrapati Shivaji Intl', lat: 19.0886, lon: 72.8679 },
  'BLR': { name: 'Kempegowda Intl', lat: 13.1986, lon: 77.7066 },
  'HYD': { name: 'Rajiv Gandhi Intl', lat: 17.2403, lon: 78.4294 },
  'MAA': { name: 'Chennai Intl', lat: 12.9900, lon: 80.1693 },
  'CCU': { name: 'Netaji Subhash Intl', lat: 22.6547, lon: 88.4467 },
  'AMD': { name: 'Sardar Vallabhbhai Intl', lat: 23.0768, lon: 72.6346 },
  'COK': { name: 'Cochin Intl', lat: 10.1556, lon: 76.3980 },
  'GOI': { name: 'Dabolim', lat: 15.3808, lon: 73.8314 },
  'BBI': { name: 'Biju Patnaik Intl', lat: 20.2444, lon: 85.8178 },
  'IXC': { name: 'Chandigarh Intl', lat: 30.6733, lon: 76.7877 },
  'PNQ': { name: 'Pune Airport', lat: 18.5822, lon: 73.9197 },
  'LKO': { name: 'Lucknow Airport', lat: 26.7588, lon: 80.8913 },
  'JAI': { name: 'Jaipur Intl', lat: 26.8242, lon: 75.8122 },
  'NAG': { name: 'Nagpur Airport', lat: 21.0921, lon: 79.0515 },
  'PAT': { name: 'Patna Airport', lat: 25.5908, lon: 85.0876 },
  'GAU': { name: 'Guwahati Intl', lat: 26.1061, lon: 91.5859 },
  'IXB': { name: 'Bagdogra Intl', lat: 26.6812, lon: 88.3286 },
  'IDR': { name: 'Indore Airport', lat: 22.7217, lon: 75.8011 },
  'BHO': { name: 'Bhopal Airport', lat: 23.2875, lon: 77.3375 },
  'SXR': { name: 'Srinagar Airport', lat: 33.9872, lon: 74.7739 },
  'IXJ': { name: 'Jammu Airport', lat: 32.6892, lon: 74.8375 },
  'TRV': { name: 'Trivandrum Intl', lat: 8.4821, lon: 76.9200 },
  'VTZ': { name: 'Visakhapatnam Intl', lat: 17.7211, lon: 83.2244 },
  
  // International Airports
  'DXB': { name: 'Dubai Intl', lat: 25.2532, lon: 55.3657 },
  'LHR': { name: 'Heathrow', lat: 51.4700, lon: -0.4543 },
  'JFK': { name: 'John F Kennedy Intl', lat: 40.6413, lon: -73.7781 },
  'SIN': { name: 'Changi', lat: 1.3644, lon: 103.9915 },
  'BKK': { name: 'Suvarnabhumi', lat: 13.6900, lon: 100.7501 },
  'KUL': { name: 'Kuala Lumpur Intl', lat: 2.7456, lon: 101.7099 },
  'HND': { name: 'Haneda Intl', lat: 35.5494, lon: 139.7798 },
  'SYD': { name: 'Sydney Airport', lat: -33.9399, lon: 151.1753 }
};

export const getAirportCoordinates = (iata) => {
  if (!iata) return null;
  const lookup = iata.toUpperCase().trim();
  return AIRPORTS[lookup] ? [AIRPORTS[lookup].lat, AIRPORTS[lookup].lon] : null;
};
