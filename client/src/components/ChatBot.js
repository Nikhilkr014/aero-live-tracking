import React, { useState, useRef, useEffect } from 'react';
import { useFlights } from '../context/FlightContext';

const ChatBot = ({ showToast }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const { flights, stats } = useFlights();

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'bot',
        text: "Hello! I'm AeroAI ✈️\nAsk me anything about live flights, delays, cargo status, weather at airports, or airline info!"
      }]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || typing) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);

    // Build context from live data
    const flightContext = flights.slice(0, 5).map(f =>
      `${f.callsign || f.icao24}: ${f.originCountry}, Alt: ${f.baroAltitude ? Math.round(f.baroAltitude) + 'm' : 'N/A'}, Speed: ${f.velocity ? Math.round(f.velocity * 3.6) + 'km/h' : 'N/A'}`
    ).join('\n');

    const systemPrompt = `You are AeroAI, the AI assistant for AeroLive – a live flight and cargo tracking platform.
Current stats: ${stats.total || flights.length} flights tracked, ${stats.airborne || 0} airborne.
Sample live flights:\n${flightContext}
Answer questions about flights, airlines, airports (especially Indian), cargo tracking, aviation facts, delays, weather. Be concise and helpful. Use ✈️ and 📦 emojis where appropriate.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            ...messages.filter(m => m.role !== 'bot' || messages.indexOf(m) > 0).map(m => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: msg }
          ]
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I could not process that. Please try again.';
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {      // Fallback smart responses
      let reply = 'I can help with flights, airports, cargo, and aviation info! ✈️';
      const q = msg.toLowerCase();
      if (q.includes('ai101') || q.includes('air india')) reply = '✈️ Air India AI101 is currently at approximately 35,800 ft cruising at 842 km/h towards BOM. On time!';
      else if (q.includes('delay')) reply = `📊 Currently ${stats.delayed || 47} flights are showing delays. Average delay is around 14 minutes across major Indian airports.`;
      else if (q.includes('cargo') || q.includes('awb')) reply = '📦 Go to the Cargo tab to track any AWB number in real time. Try AWB998877665 for a demo!';
      else if (q.includes('blr') || q.includes('bangalore')) reply = '🛫 Bengaluru (BLR) is operating normally. Current weather: 27°C, clear skies. 8 arrivals and 6 departures in the next hour.';
      else if (q.includes('weather')) reply = '🌤 Most Indian airports are reporting clear conditions. Delhi has slight haze, Mumbai is partly cloudy.';
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[600] w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)' }}
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[600] w-80 sm:w-96 glass-dark rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          style={{ height: 480 }}>
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3"
            style={{ background: 'linear-gradient(90deg, rgba(14,165,233,0.2), rgba(124,58,237,0.2))' }}>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/30 flex items-center justify-center text-xl shadow-lg">
               🤖
            </div>
            <div>
              <div className="font-semibold text-sm">AeroAI</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full status-dot"></div>
                Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-4 space-y-3" style={{ height: 344 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${m.role === 'user'
                      ? 'chat-bubble-user text-white rounded-tr-sm'
                      : 'chat-bubble-bot rounded-tl-sm'
                    }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex">
                <div className="chat-bubble-bot px-4 py-3 rounded-2xl rounded-tl-sm text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              type="text"
              placeholder="Ask about flights, delays..."
              className="flex-1 bg-white/10 rounded-2xl px-4 py-2.5 text-sm outline-none placeholder-zinc-500 border border-transparent focus:border-sky-500/50 focus:shadow-[0_0_15px_rgba(14,165,233,0.15)] transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={typing}
              className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)' }}
            >
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
