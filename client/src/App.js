import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FlightProvider } from './context/FlightContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LiveMap from './components/LiveMap';
import FlightList from './components/FlightList';
import FlightDetail from './components/FlightDetail';
import AirportGrid from './components/AirportGrid';
import CargoTracker from './components/CargoTracker';
import ChatBot from './components/ChatBot';
import Toast from './components/Toast';
import AuthModal from './components/AuthModal';
import PriceComparison from './components/PriceComparison';
import PickupMode from './components/PickupMode';
import EmergencyTicker from './components/EmergencyTicker';

import Footer from './components/Footer';
import './index.css';

function MainPage() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [showAuth, setShowAuth] = React.useState(false);


  const showToast = (msg, duration = 2500) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const handleScroll = () => {
      const scrolled = window.scrollY;
      document.querySelectorAll('.parallax-layer').forEach(layer => {
        const speed = layer.dataset.speed || 0.5;
        layer.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  return (
    <div className="bg-zinc-950 min-h-screen text-white overflow-x-hidden flex flex-col">
      <EmergencyTicker />
      <div className="parallax-container flex-1">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} showToast={showToast} setShowAuth={setShowAuth} />
        
        <div className="flex-1">
          {activeTab === 0 && (
            <>
              <Hero showToast={showToast} />
              <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8">
                <div className="reveal flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 min-w-0" id="live-map-section">
                    <LiveMap showToast={showToast} />
                  </div>
                  <div className="xl:w-96">
                    <FlightList showToast={showToast} />
                  </div>
                </div>

                {/* New Feature: Price Comparison */}
                <div className="reveal">
                  <PriceComparison />
                </div>
              </div>
            </>
          )}

          {activeTab === 1 && (
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-8">
              <FlightList showToast={showToast} fullPage />
            </div>
          )}

          {activeTab === 2 && (
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-8">
              <AirportGrid showToast={showToast} />
            </div>
          )}

          {activeTab === 3 && (
            <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-28 pb-8">
              <CargoTracker showToast={showToast} />
            </div>
          )}

        </div>

        <Footer setActiveTab={setActiveTab} />
      </div>

      <FlightDetail showToast={showToast} />
      <ChatBot showToast={showToast} />
      {toast && <Toast message={toast} />}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} showToast={showToast} />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FlightProvider>
          <Routes>
            <Route path="/pickup/:flightId" element={<PickupMode />} />
            <Route path="/*" element={<MainPage />} />
          </Routes>
        </FlightProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
