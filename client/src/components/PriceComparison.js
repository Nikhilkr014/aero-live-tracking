import React, { useState, useEffect } from 'react';

const platforms = [
  { name: 'MakeMyTrip', color: 'text-red-500', logo: 'https://imgak.mmtcdn.com/pwa_v3/pwa_hotel_assets/header/mmtLogoWhite.png' },
  { name: 'Air India', color: 'text-red-600', logo: 'https://www.airindia.com/content/dam/air-india/logos/logo.png' },
  { name: 'Goibibo', color: 'text-blue-500', logo: 'https://jsak.goibibo.com/pwa_v3/pwa_hotel_assets/header/giLogoWhite.png' },
  { name: 'Ixigo', color: 'text-orange-500', logo: 'https://images.ixigo.com/image/upload/f_auto,t_compress/7fb0d69f0640d64ea49842f1b0728c5a-ywyhy.png' },
  { name: 'Skyscanner', color: 'text-sky-400', logo: 'https://logos-world.net/wp-content/uploads/2023/01/Skyscanner-Logo.png' }
];

const PriceComparison = () => {
  const [from, setFrom] = useState('BLR');
  const [to, setTo] = useState('DEL');
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleSearch = () => {
    if (!from || !to) return;
    setLoading(true);
    
    // Simulate API fetch with randomization
    setTimeout(() => {
      const base = Math.floor(Math.random() * 2000) + 4000;
      const newPrices = platforms.map(p => ({
        ...p,
        price: base + Math.floor(Math.random() * 800) - 400,
        deal: Math.random() > 0.7 ? 'Cheapest' : Math.random() > 0.8 ? 'Fastest' : null
      })).sort((a, b) => a.price - b.price);
      
      setPrices(newPrices);
      setLoading(false);
    }, 1500);
  };

  return (
    <section className="reveal mt-20 pt-20 border-t border-white/5 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="logo-font text-5xl font-black mb-4 animate-gradient bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-500 text-transparent bg-clip-text">
            Smart Fare Comparison
          </h2>
          <p className="text-zinc-500 text-lg">Compare real-time flight rates across major travel aggregators instantly.</p>
        </div>

        {/* Search Bar */}
        <div className="glass rounded-[3rem] p-4 flex flex-col md:flex-row items-center gap-4 mb-12 shine-effect">
          <div className="flex-1 w-full relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">From</span>
            <input 
              value={from}
              onChange={e => setFrom(e.target.value.toUpperCase())}
              className="w-full bg-white/5 h-16 rounded-full pl-20 pr-6 outline-none border border-white/5 focus:border-sky-500/50 focus:shadow-[0_0_30px_-5px_rgba(56,189,248,0.35)] transition-all font-bold text-xl"
              placeholder="Origin Airport..."
            />
          </div>
          
          <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center text-zinc-500 rotate-90 md:rotate-0">
            <i className="fa-solid fa-right-left"></i>
          </div>

          <div className="flex-1 w-full relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 tracking-widest uppercase">To</span>
            <input 
              value={to}
              onChange={e => setTo(e.target.value.toUpperCase())}
              className="w-full bg-white/5 h-16 rounded-full pl-16 pr-6 outline-none border border-white/5 focus:border-sky-500/50 focus:shadow-[0_0_30px_-5px_rgba(56,189,248,0.35)] transition-all font-bold text-xl"
              placeholder="Destination..."
            />
          </div>

          <button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto px-12 h-16 bg-sky-500 hover:bg-sky-600 rounded-full font-black tracking-widest text-sm transition-all active:scale-95 shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3"
          >
            {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : <i className="fa-solid fa-paper-plane"></i>}
            GET FARES
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {prices.length > 0 ? prices.map((p, i) => (
            <div key={p.name} 
                 className={`glass p-6 rounded-[2.5rem] relative group animate-float`}
                 style={{ animationDelay: `${i * 0.2}s` }}>
              {p.deal && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${p.deal === 'Cheapest' ? 'bg-emerald-500' : 'bg-sky-500'}`}>
                  {p.deal}
                </div>
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="h-10 flex items-center justify-center mb-6">
                  {/* Since we can't load real external images easily, using styled text logo */}
                  <span className={`text-lg font-black italic tracking-tighter ${p.color}`}>{p.name}</span>
                </div>
                
                <div className="text-[10px] text-zinc-500 font-bold tracking-widest mb-1 uppercase">Starting From</div>
                <div className="text-3xl font-black mb-6">₹{p.price.toLocaleString()}</div>
                
                <button 
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 active:scale-95 transition-all text-sm font-bold shadow-lg shadow-sky-500/30 border border-white/10 flex items-center justify-center gap-2"
                >
                  Book on {p.name.split(' ')[0]}
                </button>
              </div>
            </div>
          )) : !loading && (
            <div className="col-span-full py-20 text-center opacity-30">
              <i className="fa-solid fa-magnifying-glass-chart text-6xl mb-4"></i>
              <p className="text-xl font-medium tracking-widest uppercase">Enter route to compare live prices</p>
            </div>
          )}
        </div>
        
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse-delayed"></div>
      </div>
    </section>
  );
};

export default PriceComparison;
