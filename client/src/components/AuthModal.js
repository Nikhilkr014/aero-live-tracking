import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ onClose, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      showToast('Welcome to AeroLive! ✈️', 2500);
      onClose();
    } catch (err) {
      setError('Google Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
        showToast('Welcome back to AeroLive! ✈️', 2500);
      } else {
        await register(form.name, form.email, form.password);
        showToast('Account created! Welcome to AeroLive 🎉', 2500);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity">
      <div className="glass rounded-[2.5rem] p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 animate-float">
        <div className="flex items-center justify-between mb-8">
          <h2 className="logo-font text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Join AeroLive'}</h2>
          <button onClick={onClose} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/15">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              type="text"
              placeholder="Your name"
              className="w-full bg-white/10 rounded-2xl px-5 py-4 outline-none border border-white/10 focus:border-sky-400 focus:shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)] transition-all"
            />
          )}
          <input
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            type="email"
            placeholder="Email address"
            className="w-full bg-white/10 rounded-2xl px-5 py-4 outline-none border border-white/10 focus:border-sky-400 focus:shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)] transition-all"
          />
          <input
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            type="password"
            placeholder="Password"
            className="w-full bg-white/10 rounded-2xl px-5 py-4 outline-none border border-white/10 focus:border-sky-400 focus:shadow-[0_0_25px_-5px_rgba(56,189,248,0.25)] transition-all"
          />

          {error && <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-xl border border-red-400/20">{error}</div>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            style={{ background: 'linear-gradient(to right, #0ea5e9, #7c3aed)' }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : null}
            {isLogin ? 'Login' : 'Create Account'}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px] bg-white/10"></div>
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login failed')}
              theme="filled_black"
              shape="pill"
              size="large"
              text={isLogin ? 'signin_with' : 'signup_with'}
              width="100%"
            />
          </div>
        </div>

        <p className="text-center text-zinc-400 text-sm mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-sky-400 hover:text-sky-300">
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
