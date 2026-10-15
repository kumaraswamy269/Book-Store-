import React, { useState } from 'react';
import { User, UserRole } from '../types/bookstore';
import { X, ShieldCheck, UserCheck, KeyRound, Mail, User as UserIcon } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  customers: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  customers,
  onSelectUser,
  onRegisterUser,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('customer');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      joinedDate: new Date().toISOString().split('T')[0],
      avatarSeed: name.toLowerCase().replace(/\s+/g, ''),
      totalOrders: 0,
      totalSpent: 0,
    };

    onRegisterUser(newUser);
    onClose();
  };

  const adminUser = customers.find((c) => c.role === 'admin') || customers[0];
  const sampleCustomer = customers.find((c) => c.role === 'customer') || customers[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <h3 className="font-serif font-bold text-base text-neutral-900">
              User Authentication & Role
            </h3>
            <p className="text-xs text-neutral-500">
              Current account: <strong>{currentUser.name}</strong> ({currentUser.role})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Quick Demo Switcher */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs">
            <p className="font-semibold text-amber-950">Quick One-Click Role Switch:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (adminUser) onSelectUser(adminUser);
                  onClose();
                }}
                className={`p-2 rounded-lg border text-left transition-colors flex items-center gap-2 ${
                  currentUser.role === 'admin'
                    ? 'bg-amber-200/60 border-amber-400 text-amber-950 font-semibold'
                    : 'bg-white border-amber-200 text-neutral-800 hover:bg-amber-100/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="truncate">
                  <p className="font-medium truncate">Admin Console</p>
                  <p className="text-[10px] text-neutral-500">Full CRUD</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (sampleCustomer) onSelectUser(sampleCustomer);
                  onClose();
                }}
                className={`p-2 rounded-lg border text-left transition-colors flex items-center gap-2 ${
                  currentUser.role === 'customer'
                    ? 'bg-amber-200/60 border-amber-400 text-amber-950 font-semibold'
                    : 'bg-white border-amber-200 text-neutral-800 hover:bg-amber-100/50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <div className="truncate">
                  <p className="font-medium truncate">Customer View</p>
                  <p className="text-[10px] text-neutral-500">Store & Cart</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sign In / Sign Up toggle */}
          <div className="flex border-b border-neutral-200 text-xs font-semibold">
            <button
              onClick={() => setTab('signin')}
              className={`pb-2.5 flex-1 text-center border-b-2 transition-colors ${
                tab === 'signin'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`pb-2.5 flex-1 text-center border-b-2 transition-colors ${
                tab === 'signup'
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Register Account
            </button>
          </div>

          {tab === 'signin' ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Select Existing Registered Customer
                </label>
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const u = customers.find((c) => c.id === e.target.value);
                    if (u) onSelectUser(u);
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email}) — [{c.role.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Account Password
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors shadow-2xs"
              >
                Sign In as {currentUser.name.split(' ')[0]}
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rosalind Franklin"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rosalind@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-medium mb-1">
                  Role Assignment
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="customer">Customer (Storefront & Cart)</option>
                  <option value="admin">Administrator (Books, Orders & Payments Management)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold rounded-lg transition-colors shadow-2xs mt-2"
              >
                Create Account
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
