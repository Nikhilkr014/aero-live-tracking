import React from 'react';

const Toast = ({ message }) => (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[700] glass px-6 py-3.5 rounded-2xl text-sm font-medium shadow-2xl border border-white/10 animate-fade-in max-w-sm text-center">
    {message}
  </div>
);

export default Toast;
