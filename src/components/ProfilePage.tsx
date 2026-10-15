import React, { useState } from 'react';
import { User } from '../types/bookstore';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Check, 
  ShoppingBag, 
  Calendar, 
  DollarSign, 
  ArrowLeft,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onNavigate: (view: 'catalog' | 'wishlist' | 'orders' | 'admin') => void;
  onSignOut: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  onNavigate,
  onSignOut,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 749-2104');
  const [address, setAddress] = useState(currentUser.address || '742 Evergreen Terrace');
  const [city, setCity] = useState(currentUser.city || 'Boston');
  const [postalCode, setPostalCode] = useState(currentUser.postalCode || '02138');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>

        <button
          onClick={onSignOut}
          className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg font-medium transition-colors cursor-pointer"
        >
          Sign Out of Account
        </button>
      </div>

      {/* Account Overview Header */}
      <div className="bg-gradient-to-r from-neutral-900 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-neutral-950 font-bold text-2xl flex items-center justify-center font-serif shadow-md border-2 border-amber-300">
            {currentUser.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-mono uppercase font-bold">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-stone-300 flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-4 bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-4 text-xs">
          <div className="text-center px-3 border-r border-neutral-700">
            <p className="text-stone-400 text-[10px] uppercase font-mono">Total Orders</p>
            <p className="text-lg font-bold font-mono text-amber-300 mt-0.5">
              {currentUser.totalOrders}
            </p>
          </div>
          <div className="text-center px-3 border-r border-neutral-700">
            <p className="text-stone-400 text-[10px] uppercase font-mono">Total Spent</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              ${currentUser.totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="text-center px-3">
            <p className="text-stone-400 text-[10px] uppercase font-mono">Member Since</p>
            <p className="text-xs font-mono text-stone-300 mt-1">
              {currentUser.joinedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form & Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-serif font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-2">
              Account Navigation
            </h3>
            <button
              onClick={() => onNavigate('orders')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-neutral-700 font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>My Order History</span>
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {currentUser.totalOrders}
              </span>
            </button>

            <button
              onClick={() => onNavigate('wishlist')}
              className="w-full text-left p-2.5 rounded-xl hover:bg-neutral-50 flex items-center justify-between text-neutral-700 font-medium transition-colors"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span>Reading Wishlist</span>
              </span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => onNavigate('admin')}
                className="w-full text-left p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 font-semibold flex items-center justify-between transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Admin Console</span>
                </span>
                <span className="text-[10px] font-mono">LIVE</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 text-xs text-neutral-900"
          >
            <div>
              <h3 className="font-serif font-bold text-base text-neutral-900">
                Personal Information & Delivery Address
              </h3>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                These default credentials will automatically pre-fill your checkout forms.
              </p>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customer profile details saved successfully to database!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-amber-500 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-xl bg-neutral-100 text-neutral-500 text-xs cursor-not-allowed font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Primary Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  City / Region
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-amber-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-neutral-800 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-amber-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-amber-500 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save Profile Changes</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
};
