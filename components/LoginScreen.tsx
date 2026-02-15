'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChefHat, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/types';
import { apiClient } from '@/lib/api-client';

interface LoginScreenProps {
  onLogin: (id: number, name: string, role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('invalidCredentials'));
        return;
      }

      // Store token in localStorage (optional)
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      // Start attendance tracking for captain
      if (data.user.role === 'CAPTAIN') {
        try {
          await apiClient.startShift(data.user.id);
        } catch (err) {
          console.error('Failed to start attendance:', err);
        }
      }

      // Call the onLogin callback with user data
      onLogin(data.user.id, data.user.name, data.user.role);
    } catch (err) {
      setError(t('invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* App Logo & Title */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-brown rounded-full flex items-center justify-center shadow-lg mb-4">
          <ChefHat size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold text-brown-dark tracking-tight text-center">{t('appTitle')}</h1>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-sm space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-brown-dark ml-1">{t('enterName')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-brown-light rounded-lg text-brown-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-peach focus:border-peach transition-all shadow-sm"
              placeholder={language === 'en' ? "e.g. Sarah or 'admin'" : "उदा. राहुल"}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-brown-dark ml-1">{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-brown-light rounded-lg text-brown-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-peach focus:border-peach transition-all shadow-sm"
              placeholder={t('enterPassword')}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100 animate-pulse">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-peach hover:bg-peach-dark text-white font-bold text-lg py-3 rounded-lg shadow-md active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : t('login')}
          </button>
        </form>

        {/* Note */}
        <div className="text-center">
            <div className="text-xs text-stone-500 mb-3">
                <p className="font-semibold mb-2">Login Credentials:</p>
                <p className="text-stone-400">Owner: <span className="font-mono">owner</span> / <span className="font-mono">owner123</span></p>
                <p className="text-stone-400">Captain: <span className="font-mono">captain</span> / <span className="font-mono">captain123</span></p>
                <p className="text-stone-400">Billing: <span className="font-mono">billing</span> / <span className="font-mono">billing123</span></p>
                <p className="text-stone-400">Hotel Manager: <span className="font-mono">manager</span> / <span className="font-mono">manager123</span></p>
            </div>
        </div>

        {/* Language Toggle */}
        <div className="flex justify-center pt-6">
          <div className="flex bg-white border border-brown-light/30 p-1 rounded-full shadow-sm">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                language === 'en' ? 'bg-brown text-white' : 'text-gray-400 hover:text-brown'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                language === 'hi' ? 'bg-brown text-white' : 'text-gray-400 hover:text-brown'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
