'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, Dumbbell, BarChart3, Target, Moon, Sun, Menu, X, LogOut, User, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export const Navigation: React.FC = () => {
    const pathname = usePathname();
    const { darkMode, toggleDarkMode, userProfile, setUserProfile } = useApp();
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
                setEditingName(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveName = () => {
        if (!userProfile || !nameInput.trim()) return;
        setUserProfile({ ...userProfile, name: nameInput.trim() });
        setEditingName(false);
    };

    const handleSignOut = async () => {
        setProfileOpen(false);
        await signOut();
    };

    // Get initials for avatar
    const initials = userProfile?.name
        ? userProfile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.[0]?.toUpperCase() ?? '?';

    const navItems = [
        { href: '/', label: 'Dashboard', icon: Home },
        { href: '/nutrition', label: 'Nutrition', icon: Utensils },
        { href: '/exercise', label: 'Exercise', icon: Dumbbell },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/goals', label: 'Goals', icon: Target },
    ];

    return (
        <nav className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200/60 dark:border-surface-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-extrabold text-sm tracking-tight">FT</span>
                        </div>
                        <span className="text-lg font-extrabold text-surface-900 dark:text-surface-50 tracking-tight">
                            FitTrack <span className="text-primary-600 dark:text-primary-400">Pro</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                                        flex items-center space-x-2 px-3.5 py-2 rounded-xl transition-all duration-200 text-sm font-medium
                                        ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                                            : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <Sun className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Moon className="w-4 h-4 text-surface-500" />
                            )}
                        </button>

                        {/* Profile Avatar + Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => { setProfileOpen(!profileOpen); setEditingName(false); }}
                                className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-sm"
                                aria-label="Profile menu"
                            >
                                {initials}
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-800 rounded-2xl shadow-lifted border border-surface-200/60 dark:border-surface-700/50 overflow-hidden z-50 animate-scale-in">
                                    {/* User info header */}
                                    <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50 bg-surface-50 dark:bg-surface-900/50">
                                        <p className="text-[10px] text-surface-400 uppercase tracking-wider font-semibold">Signed in as</p>
                                        <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate mt-0.5">{user?.email}</p>
                                    </div>

                                    {/* Username editor */}
                                    <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
                                        <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider mb-2">Display Name</p>
                                        {editingName ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={nameInput}
                                                    onChange={e => setNameInput(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                                                    placeholder="Your name"
                                                    className="flex-1 text-sm px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-200 outline-none focus:border-primary-400 transition-colors"
                                                />
                                                <button onClick={handleSaveName} className="p-1 text-emerald-500 hover:text-emerald-600">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setNameInput(userProfile?.name ?? ''); setEditingName(true); }}
                                                className="flex items-center gap-2 w-full text-left text-sm text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                            >
                                                <User className="w-3.5 h-3.5" />
                                                <span>{userProfile?.name || 'Set your name'}</span>
                                                <span className="ml-auto text-[10px] text-surface-400 uppercase tracking-wider">Edit</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Sign out */}
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                            ) : (
                                <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-surface-200/60 dark:border-surface-800/60 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl animate-slide-down">
                    <div className="px-4 py-2 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
                                        ${isActive
                                            ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                                            : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                        {/* Sign out in mobile menu too */}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};
