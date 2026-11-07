import React, { FormEvent, useState } from 'react';
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, ShieldAlert, UserRound, Sparkles } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: 'citizen' | 'admin';
}

interface Props {
  onAuthenticated: (user: AuthUser) => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể xác thực tài khoản');
      onAuthenticated(data.user);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Không thể kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  const isRegister = mode === 'register';

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Radiant Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30 blur-[100px] bg-blue-300" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-25 blur-[90px] bg-indigo-300" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Glass Card */}
        <div className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">

          {/* Header Section */}
          <header className="pt-10 pb-6 text-center px-8">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5 glow-blue animate-float shadow-lg" style={{ background: 'var(--gradient-primary)' }}>
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              VietTraffic <span className="text-gradient">AI</span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xs mx-auto leading-relaxed">
              {isRegister
                ? 'Đăng ký tài khoản để bắt đầu giám sát giao thông thông minh.'
                : 'Chào mừng trở lại! Đăng nhập để sử dụng hệ thống.'}
            </p>
          </header>

          {/* Mode Switcher */}
          <div className="px-8 mb-6">
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {(['login', 'register'] as AuthMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setMode(item); setError(null); }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                    mode === item
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {item === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                </button>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <section className="px-8 pb-10">
            <form onSubmit={submit} className="space-y-4">
              {isRegister && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5 ml-1">
                    Họ và tên
                  </label>
                  <div className="relative group">
                    <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      required
                      minLength={2}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="input-field pl-11 border-2 border-slate-300 font-medium text-slate-950 focus:border-blue-600"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    required
                    type={isRegister ? 'email' : 'text'}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input-field pl-11 border-2 border-slate-300 font-medium text-slate-950 focus:border-blue-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5 ml-1">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="input-field pl-11 pr-11 border-2 border-slate-300 font-medium text-slate-950 focus:border-blue-600"
                    placeholder="Ít nhất 8 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex gap-2.5 rounded-xl p-3 text-xs bg-rose-50 border-2 border-rose-300 text-rose-900 font-bold animate-fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <button
                disabled={isLoading}
                className="btn btn-primary w-full py-3.5 text-sm font-bold text-white shadow-md disabled:opacity-50 disabled:pointer-events-none mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.918l3-2.628z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
                  </span>
                )}
              </button>
            </form>
          </section>
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mt-6">
          Hệ thống AI Tracking &amp; Tư Vấn Pháp Luật Giao Thông Việt Nam
        </p>
      </div>
    </main>
  );
};
