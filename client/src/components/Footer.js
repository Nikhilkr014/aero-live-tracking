import React, { useState } from 'react';

// ─── Modal Overlay ──────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[700] flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    onClick={onClose}>
    <div
      className="glass-dark rounded-3xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10"
        style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(124,58,237,0.15))' }}>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-400 hover:text-white transition-all">
          ✕
        </button>
      </div>
      {/* Body */}
      <div className="p-6 text-zinc-300 leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  </div>
);

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = ({ setActiveTab }) => {
  const [modal, setModal] = useState(null); // 'about' | 'help' | 'contact' | 'privacy'

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const goTab = (tab, sectionId) => {
    if (setActiveTab) setActiveTab(tab);
    if (sectionId) setTimeout(() => scrollTo(sectionId), 350);
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="relative mt-8 mb-8 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <div className="glass-dark sm:glass rounded-[2rem] p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Glow */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">

              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center p-2 backdrop-blur-md shadow-lg border border-white/10">
                    <img src="/logo.png" alt="AeroLive Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="logo-font text-4xl font-bold tracking-tighter bg-gradient-to-r from-sky-400 to-violet-500 bg-clip-text text-transparent">
                    AeroLive
                  </span>
                </div>
                <p className="text-zinc-400 mb-6 max-w-md text-lg leading-relaxed">
                  Real-time flight tracking • Live cargo visibility • Powered by passion for aviation
                </p>
                <p className="text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500">
                  Wherever you're headed — we help you to see the journey.
                </p>
                {/* Social / contact pills */}
                <div className="flex flex-wrap gap-3 mt-6">
                  <a href="mailto:kashyapnikhil585@gmail.com"
                    className="flex items-center gap-2 bg-white/5 hover:bg-sky-500/20 border border-white/10 hover:border-sky-400/40 rounded-full px-4 py-2 text-sm text-zinc-300 hover:text-sky-300 transition-all">
                    <i className="fa-solid fa-envelope text-sky-400" />
                    kashyapnikhil585@gmail.com
                  </a>
                  <a href="tel:+919530850436"
                    className="flex items-center gap-2 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-400/40 rounded-full px-4 py-2 text-sm text-zinc-300 hover:text-violet-300 transition-all">
                    <i className="fa-solid fa-phone text-violet-400" />
                    +91 95308 50436
                  </a>
                </div>
              </div>

              {/* Explore */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">Explore</h3>
                <ul className="space-y-4 text-zinc-400">
                  <li>
                    <button onClick={() => goTab(0, 'live-map-section')}
                      className="hover:text-sky-400 transition-colors flex items-center gap-2 text-left">
                      <i className="fa-solid fa-map text-sm text-sky-500" /> Live Map
                    </button>
                  </li>
                  <li>
                    <button onClick={() => goTab(1)}
                      className="hover:text-sky-400 transition-colors flex items-center gap-2 text-left">
                      <i className="fa-solid fa-plane-departure text-sm text-violet-500" /> Find Flights
                    </button>
                  </li>
                  <li>
                    <button onClick={() => goTab(3)}
                      className="hover:text-sky-400 transition-colors flex items-center gap-2 text-left">
                      <i className="fa-solid fa-box text-sm text-emerald-500" /> Cargo Tracking
                    </button>
                  </li>
                  <li>
                    <button onClick={() => goTab(2)}
                      className="hover:text-sky-400 transition-colors flex items-center gap-2 text-left">
                      <i className="fa-solid fa-cloud-sun text-sm text-amber-400" /> Airport Weather
                    </button>
                  </li>
                </ul>
              </div>

              {/* About */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-white">About</h3>
                <ul className="space-y-4 text-zinc-400">
                  <li>
                    <button onClick={() => setModal('about')}
                      className="hover:text-sky-400 transition-colors text-left">
                      About AeroLive
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setModal('help')}
                      className="hover:text-sky-400 transition-colors text-left">
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setModal('contact')}
                      className="hover:text-sky-400 transition-colors text-left">
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setModal('privacy')}
                      className="hover:text-sky-400 transition-colors text-left">
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-zinc-500 text-sm">
                © {new Date().getFullYear()} AeroLive. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live tracking powered by OpenSky Network & AviationStack
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Modals ─────────────────────────────────────────── */}

      {/* About */}
      {modal === 'about' && (
        <Modal title="About AeroLive" onClose={() => setModal(null)}>
          <p>
            <span className="text-sky-400 font-semibold">AeroLive</span> is a real-time aviation tracking platform built for both aviation enthusiasts and everyday travellers. Whether you want to track a live flight over the Indian subcontinent, monitor cargo shipments, or explore airport data — AeroLive puts everything in one place.
          </p>
          <p>
            We pull live ADS-B data from <span className="text-white font-medium">OpenSky Network</span> and enrich it with schedule information from <span className="text-white font-medium">AviationStack</span> to give you the most accurate picture possible.
          </p>
          <p>Built with ❤️ by aviation enthusiasts, for everyone.</p>
          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 mt-2">
            <span className="text-3xl">🛩️</span>
            <div>
              <div className="text-white font-semibold">AeroLive v1.0</div>
              <div className="text-zinc-400 text-sm">Full-stack MERN • Real-time tracking • India-first</div>
            </div>
          </div>
        </Modal>
      )}

      {/* Help Center */}
      {modal === 'help' && (
        <Modal title="Help Center" onClose={() => setModal(null)}>
          <div className="space-y-5">
            {[
              { q: 'How do I track a flight?', a: 'Use the "Find Flights" tab or search for a callsign (e.g., AI101) in the search bar on the Live Map.' },
              { q: 'Why is the map empty?', a: 'The map uses the free OpenSky Network. If their servers are rate-limiting anonymous requests, the map may temporarily show no aircraft. Try again in a few minutes.' },
              { q: 'How do I track cargo?', a: 'Go to the "Cargo Tracking" tab and enter a valid AWB (Air Waybill) number to get status updates.' },
              { q: 'Is my data secure?', a: 'Yes. AeroLive does not store personal flight searches. Authentication uses JWT and Google OAuth, both industry-standard protocols.' },
              { q: 'How do I report a bug?', a: 'Email us at kashyapnikhil585@gmail.com or call +91 95308 50436 with the details of the issue.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white/5 rounded-2xl p-4">
                <div className="text-white font-semibold mb-1 flex items-center gap-2">
                  <i className="fa-solid fa-circle-question text-sky-400 text-sm" /> {q}
                </div>
                <div className="text-zinc-400 text-sm">{a}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Contact */}
      {modal === 'contact' && (
        <Modal title="Contact Us" onClose={() => setModal(null)}>
          <p className="text-zinc-400">Have a question, feedback, or found a bug? We'd love to hear from you!</p>
          <div className="space-y-4 mt-2">
            <a href="mailto:kashyapnikhil585@gmail.com"
              className="flex items-center gap-4 bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-400/30 rounded-2xl p-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 text-xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-envelope" />
              </div>
              <div>
                <div className="text-white font-semibold">Email Us</div>
                <div className="text-sky-400 text-sm">kashyapnikhil585@gmail.com</div>
              </div>
            </a>
            <a href="tel:+919530850436"
              className="flex items-center gap-4 bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-400/30 rounded-2xl p-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 text-xl group-hover:scale-110 transition-transform">
                <i className="fa-solid fa-phone" />
              </div>
              <div>
                <div className="text-white font-semibold">Call Us</div>
                <div className="text-violet-400 text-sm">+91 95308 50436</div>
              </div>
            </a>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                <i className="fa-solid fa-clock" />
              </div>
              <div>
                <div className="text-white font-semibold">Response Time</div>
                <div className="text-zinc-400 text-sm">We typically respond within 24 hours on business days.</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Privacy Policy */}
      {modal === 'privacy' && (
        <Modal title="Privacy Policy" onClose={() => setModal(null)}>
          <p className="text-zinc-500 text-xs">Last updated: April 2025</p>
          <p>
            At <span className="text-sky-400 font-semibold">AeroLive</span>, your privacy matters. This policy explains what data we collect, why we collect it, and how we protect it.
          </p>
          {[
            {
              title: '1. Data We Collect',
              body: 'When you sign in via Google OAuth, we receive your name, email address, and profile picture solely to create and manage your account. We do not collect payment or financial information.'
            },
            {
              title: '2. Flight Search & Tracking',
              body: 'Flight search queries are not linked to your account or stored persistently. All flight data is fetched in real-time from OpenSky Network and AviationStack and is not retained on our servers beyond a short cache window (10 minutes).'
            },
            {
              title: '3. Cookies & Sessions',
              body: 'We use JWT (JSON Web Tokens) stored in memory to maintain your session. No third-party advertising cookies are used.'
            },
            {
              title: '4. Data Sharing',
              body: 'We do not sell or share your personal data with any third parties. Flight data displayed on AeroLive originates from publicly available aviation databases.'
            },
            {
              title: '5. Security',
              body: 'All API communications are protected by HTTPS. Passwords are hashed using bcrypt and never stored in plain text.'
            },
            {
              title: '6. Contact',
              body: 'For privacy-related concerns, contact us at kashyapnikhil585@gmail.com or call +91 95308 50436.'
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <div className="text-white font-semibold mb-1">{title}</div>
              <div className="text-zinc-400 text-sm">{body}</div>
            </div>
          ))}
        </Modal>
      )}
    </>
  );
};

export default Footer;
