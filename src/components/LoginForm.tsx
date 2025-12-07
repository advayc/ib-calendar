"use client";
import React, { useState } from 'react';

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void;
  error: string | null;
  loading?: boolean;
  theme: 'light' | 'dark';
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error, loading = false, theme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const disable = loading || !username || !password;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (disable) return;
        onSubmit(username.trim(), password);
      }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <label className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>Username</label>
        <input
          type="text"
          className={`w-full px-3 py-2 rounded-md outline-none border text-sm placeholder-gray-400 focus:ring-0 ${theme==='light' ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-[#191919] border-[#2A2A2A] text-gray-100 focus:border-blue-400'}`}
          value={username}
          autoComplete="username"
          onChange={(e)=>setUsername(e.target.value)}
          placeholder="admin"
        />
      </div>
      <div className="space-y-1">
        <label className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`w-full px-3 py-2 rounded-md outline-none border text-sm pr-10 placeholder-gray-400 focus:ring-0 ${theme==='light' ? 'bg-white border-gray-300 text-gray-900 focus:border-blue-500' : 'bg-[#191919] border-[#2A2A2A] text-gray-100 focus:border-blue-400'}`}
            value={password}
            autoComplete="current-password"
            onChange={(e)=>setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={()=>setShowPassword(p=>!p)}
            className={`absolute inset-y-0 right-0 px-2 text-xs ${theme==='light' ? 'text-blue-600 hover:text-blue-700' : 'text-blue-300 hover:text-blue-200'}`}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={disable}
        className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${disable ? 'opacity-60 cursor-not-allowed' : ''} ${theme==='light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default LoginForm;
