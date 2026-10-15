import React, { useState } from 'react';
import { User, UserRole } from '../types/bookstore';
import { 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Mail, 
  User as UserIcon, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Lock, 
  MapPin, 
  Phone,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface LoginPageProps {
  currentUser: User;
  customers: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  customers,
  onSelectUser,
  onRegisterUser,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState(currentUser.email || 'eleanor.vance@bookheavean.io');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [signInError, setSignInError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('customer');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [regError, setRegError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-neutral-200' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 10) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };
  const strength = getPasswordStrength(regPassword);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = customers.find(
        (c) => c.email.toLowerCase() === signInEmail.trim().toLowerCase()
      );

      if (!user) {
        setSignInError('No account found with this email. Please check your credentials or register below.');
        return;
      }

      onSelectUser(user);
      onNavigateHome();
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Please provide both your full name and valid email.');
      return;
    }

    if (customers.some((c) => c.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setRegError('An account with this email address already exists. Please sign in instead.');
      return;
    }

    if (!agreedTerms) {
      setRegError('Please accept the Terms of Service to create an account.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        phone: regPhone.trim() || '+1 (555) 019-4821',
        address: regAddress.trim() || '104 University Way',
        city: regCity.trim() || 'Oxford',
        postalCode: 'OX1 2JD',
        joinedDate: new Date().toISOString().split('T')[0],
        avatarSeed: regName.toLowerCase().replace(/\s+/g, ''),
        totalOrders: 0,
        totalSpent: 0,
      };

      onRegisterUser(newUser);
      onNavigateHome();
    }, 450);
  };

  const handleQuickLogin = (email: string) => {
    const user = customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setSignInEmail(user.email);
      setSignInPassword('password123');
      onSelectUser(user);
      onNavigateHome();
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setIsForgotModalOpen(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 2000);
  };

  const adminCustomer = customers.find((c) => c.role === 'admin') || customers[0];
  const regularCustomer = customers.find((c) => c.role === 'customer') || customers[1];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-900 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Return back to catalog button */}
      <div className="max-w-5xl mx-auto w-full mb-6 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-300 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Bookstore Storefront</span>
        </button>

        <div className="text-stone-400 text-xs flex items-center gap-2">
          <span>Active Session:</span>
          <span className="font-semibold text-amber-300 font-mono">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
        
        {/* Left Side: Brand & Visual Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-neutral-950 via-stone-900 to-amber-950/80 p-8 sm:p-10 text-stone-100 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-800 relative overflow-hidden">
          
          {/* Subtle decorative background rings */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/10 border border-amber-400/20 text-amber-300 rounded-full text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Book Heavean Member Portal</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                Welcome to Book Heavean.
              </h2>
              <p className="mt-3 text-sm text-stone-300 leading-relaxed">
                Log in to track orders, manage your reading wishlist, write verified reviews, or access the enterprise administration center.
              </p>
            </div>

            {/* Literary quote card */}
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 backdrop-blur-xs space-y-2">
              <p className="font-serif italic text-stone-200 text-xs leading-relaxed">
                &ldquo;A reader lives a thousand lives before he dies. The man who never reads lives only one.&rdquo;
              </p>
              <p className="text-[11px] text-amber-400/80 font-mono font-medium">
                — George R.R. Martin
              </p>
            </div>
          </div>

          {/* Quick Demo Credential One-Clicks */}
          <div className="relative z-10 mt-8 pt-6 border-t border-neutral-800/80 space-y-3">
            <p className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold font-mono flex items-center justify-between">
              <span>Fast One-Click Demo Sign In</span>
              <span className="text-amber-400 text-[10px]">Instant Access</span>
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin(adminCustomer.email)}
                className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-400/50 rounded-xl text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-white text-xs">Admin Console</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1 truncate">
                  Full CRUD & Live Queue
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(regularCustomer.email)}
                className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-emerald-400/50 rounded-xl text-left transition-all group cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-white text-xs">Customer View</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1 truncate">
                  Cart, Checkout & Tracking
                </p>
              </button>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-stone-400 pt-2 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero telemetry</span>
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Local encrypted store</span>
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Form Tabs */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white text-neutral-900">
          
          {/* Tabs navigation */}
          <div className="flex border-b border-neutral-200 mb-8">
            <button
              onClick={() => {
                setActiveTab('signin');
                setSignInError('');
              }}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'signin'
                  ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegError('');
              }}
              className={`pb-3 px-4 text-sm font-semibold transition-all relative cursor-pointer ${
                activeTab === 'register'
                  ? 'text-neutral-900 border-b-2 border-neutral-900 font-bold'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              
              {signInError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <p>{signInError}</p>
                </div>
              )}

              {/* Email selector / input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-800">
                    Email Address
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    e.g. {adminCustomer.email}
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="Enter your registered email..."
                    className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[11px] font-medium text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>


              {/* Remember me & Security badge */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  AES-256 session token
                </span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sign In to Book Heavean</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-neutral-500 pt-2">
                Don&apos;t have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-amber-700 font-semibold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </p>

            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                  {regError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ada Lovelace"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="ada@oxford.edu"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    City / Region
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="e.g. San Francisco"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Shipping Street Address
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Street address, building, suite..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                  {regPassword && (
                    <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                      <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium text-neutral-600">{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Account Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:bg-white focus:ring-1 focus:ring-amber-500 font-medium"
                  >
                    <option value="customer">Customer (Storefront & Orders)</option>
                    <option value="admin">Store Administrator (Full Console)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 text-[11px] text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                />
                <span>
                  I agree to Book Heavean&apos;s Terms of Service and Privacy Policy for encrypted customer data storage.
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-neutral-900/30 border-t-neutral-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-neutral-950" />
                    <span>Complete Registration & Enter Bookstore</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-neutral-900 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <HelpCircle className="w-5 h-5" />
              <h4 className="font-serif font-bold text-base">Reset Account Password</h4>
            </div>

            <p className="text-xs text-neutral-600">
              Enter your email address below. A simulated temporary password link will be created for this demo.
            </p>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset token generated! You can now log in with password123.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
