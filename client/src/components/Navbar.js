import React, { useState, useEffect } from 'react';
import { useFlights } from '../context/FlightContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ activeTab, setActiveTab, showToast, setShowAuth }) => {
  const { connected, setSearchQuery, loadFlight, setSelectedFlight } = useFlights();
  const { user, logout } = useAuth();
  const [localQ, setLocalQ] = useState('');
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || localQ.trim().length > 0;

  const handleSearch = () => {
    const q = localQ.trim().toUpperCase();
    if (!q) return;
    if (q.startsWith('AWB') || /^\d{11}$/.test(q)) {
      setActiveTab(3);
      showToast(`Searching cargo: ${q}`, 2000);
    } else {
      setSearchQuery(q);
      setActiveTab(0);
      loadFlight(q).then(f => {
        if (f) setSelectedFlight(f);
        else showToast('Flight not found. Try AI101 or 6E456', 2500);
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down & past threshold
        setShowNavbar(false);
      } else {
        // Scrolling up
        setShowNavbar(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const tabs = [
    { label: 'Live Map', icon: 'fa-map' },
    { label: 'Flights', icon: 'fa-list' },
    { label: 'Airports', icon: 'fa-plane-departure' },
    { label: 'Cargo', icon: 'fa-box' }
  ];

  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-2xl z-[2000] glass rounded-3xl lg:rounded-full transition-all duration-500 ${showNavbar ? 'translate-y-0 opacity-100 shadow-2xl' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center p-1.5 backdrop-blur-md shadow-lg shadow-sky-500/10 border border-white/10 transition-transform animate-glow">
            <img src="/logo.png" alt="AeroLive Logo" className="w-full h-full object-contain" />
          </div>
          <span className="logo-font text-xl font-black tracking-tighter hidden sm:block animate-gradient bg-gradient-to-r from-sky-400 to-white text-transparent bg-clip-text">AeroLive</span>
        </div>

        {/* Central Capsule Tabs (Reference Design) */}
        <div className="hidden lg:flex items-center bg-zinc-950/80 border border-white/10 rounded-full p-1 shadow-inner backdrop-blur-md gap-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                activeTab === i
                  ? 'bg-white text-zinc-950 shadow-md font-extrabold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[10px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Controls Container */}
        <div className="flex items-center gap-3">
          {/* Expandable Search */}
          <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false);
              // Auto-blur input to remove focus cursor when mouse leaves and it's empty
              if (document.activeElement?.tagName === 'INPUT' && !localQ.trim()) {
                document.activeElement.blur();
              }
            }}
            className={`hidden md:flex items-center bg-white/5 rounded-full border border-white/10 px-3 py-1.5 transition-all duration-300 ease-in-out ${
              isExpanded ? 'w-64 border-sky-400/35 bg-white/10' : 'w-24 cursor-pointer justify-center'
            }`}
          >
            <i className={`fa-solid fa-magnifying-glass text-zinc-400 text-xs transition-transform ${isExpanded ? 'mr-2' : ''}`}></i>
            
            {isExpanded ? (
              <div className="flex items-center w-full animate-fade-in">
                <input
                  value={localQ}
                  onChange={e => setLocalQ(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none flex-1 text-xs placeholder-zinc-400 text-white w-full"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  className="ml-2 px-3 py-1 bg-white text-zinc-900 rounded-full font-bold text-[10px] hover:bg-sky-400 hover:text-white transition-all flex items-center gap-1 active:scale-95 flex-shrink-0"
                >
                  TRACK
                </button>
              </div>
            ) : (
              <span className="text-xs text-zinc-400 font-medium select-none pointer-events-none">Search</span>
            )}
          </div>

          {/* Live Indicator (Styled to match the rightmost indicator capsule in reference design) */}
          <div className="flex items-center bg-zinc-900/80 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold shadow-inner">
            <div className={`w-2 h-2 rounded-full status-dot ${connected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-400 shadow-[0_0_8px_#f87171]'}`}></div>
            <span className="text-[10px] text-zinc-300 ml-1.5 hidden sm:block">{connected ? 'LIVE' : 'OFFLINE'}</span>
          </div>

          {/* User Profile */}
          {user ? (
            <div className="relative group">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer hover:scale-105 transition-transform active:scale-95 shadow-md">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                    {user.name?.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute right-0 top-11 glass rounded-2xl p-3 w-52 hidden group-hover:block z-[3000] border border-white/10 shadow-2xl animate-fade-in">
                <div className="px-3 py-1.5 border-b border-white/5 mb-2">
                   <p className="text-xs font-bold truncate text-white">{user.name}</p>
                   <p className="text-[9px] font-medium text-zinc-500 truncate">{user.email}</p>
                </div>

                <button 
                  onClick={logout} 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-[10px] font-semibold text-red-400 transition-all"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-1.5 bg-sky-500 hover:bg-sky-600 rounded-full text-xs font-semibold transition-all active:scale-95 text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden flex border-t border-white/10 pb-1">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 text-xs flex flex-col items-center gap-1 transition-colors ${activeTab === i ? 'text-sky-400' : 'text-zinc-500'}`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
