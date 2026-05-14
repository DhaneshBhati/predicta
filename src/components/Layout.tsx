import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Matches', path: '/matches', icon: Activity },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/80 shadow-lg">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
            PREDICTA
          </Link>
          <nav className="flex gap-2 md:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-base sm:text-lg font-bold transition-all duration-200 transform hover:scale-105",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  )}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
