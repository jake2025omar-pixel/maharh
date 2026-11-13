import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  CheckCircle2,
  AlertCircle,
  Database,
  LogOut,
  Loader2
} from 'lucide-react';
import { useSession } from '../../context/SessionContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, progress } = useSession();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('المكلا');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ isConfigured: boolean; provider: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/database/status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload =
      tab === 'login'
        ? { email, password }
        : {
            email,
            password,
            fullName,
            city,
            level,
            onboardingCompleted: progress.onboardingCompleted
          };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'حدث خطأ أثناء معالجة الطلب');
      } else {
        setSuccessMsg(tab === 'login' ? 'تم تسجيل الدخول بنجاح' : 'تم إنشاء الحساب بنجاح');
        setCurrentUser(data.profile);
        setTimeout(() => {
          onClose();
        }, 900);
      }
    } catch (err: any) {
      setErrorMsg(`تعذر الاتصال بالخادم: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-200/80 text-right relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl surface-icy text-sky-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {currentUser ? 'ملف الطالب الشخصي' : 'حساب الطالب — مهارة'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser ? 'بياناتك وتقدمك المحفوظ' : 'سجّل لحفظ جلساتك وتقدمك الدراسي'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Honest Database Connection Status */}
        <div className="mb-5 p-3.5 rounded-2xl surface-icy text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-700">
            <Database className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{dbStatus?.provider || 'مخزن البيانات الخلفي'}</span>
          </div>
          <span
            className={`text-xs font-semibold ${
              dbStatus?.isConfigured ? 'text-emerald-700' : 'text-sky-800'
            }`}
          >
            {dbStatus?.isConfigured ? 'سحابية متصلة' : 'تخزين خادم محلي'}
          </span>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 surface-icy rounded-2xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">اسم الطالب:</span>
                <strong className="text-slate-900">{currentUser.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">البريد الإلكتروني:</span>
                <span className="font-latin font-medium text-slate-800">{currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المدينة:</span>
                <span className="text-slate-800">{currentUser.city || 'حضرموت'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المستوى:</span>
                <span className="font-semibold text-sky-900">
                  {currentUser.level === 'beginner'
                    ? 'مبتدئ'
                    : currentUser.level === 'intermediate'
                    ? 'متوسط'
                    : 'متقدم'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${
                  tab === 'login'
                    ? 'border-sky-600 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 pb-3 text-xs font-bold transition-colors border-b-2 ${
                  tab === 'register'
                    ? 'border-sky-600 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                حساب طالب جديد
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      الاسم الكامل للطالب
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="مثال: سالم عمر باوزير"
                      className="w-full bg-[#F0F7FA]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">المدينة</label>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full bg-[#F0F7FA]/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-sky-400"
                      >
                        <option value="المكلا">المكلا</option>
                        <option value="سيئون">سيئون</option>
                        <option value="الشحر">الشحر</option>
                        <option value="تريم">تريم</option>
                        <option value="شبام">شبام</option>
                        <option value="القطن">القطن</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">المستوى</label>
                      <select
                        value={level}
                        onChange={e => setLevel(e.target.value as any)}
                        className="w-full bg-[#F0F7FA]/50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-sky-400"
                      >
                        <option value="beginner">مبتدئ</option>
                        <option value="intermediate">متوسط (صف 11)</option>
                        <option value="advanced">متقدم</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  dir="ltr"
                  className="w-full bg-[#F0F7FA]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-latin focus:bg-white focus:outline-none focus:border-sky-400 text-left"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F0F7FA]/50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-sky-400 text-left"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{tab === 'login' ? 'دخول إلى حسابي' : 'إنشاء حساب جديد'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
