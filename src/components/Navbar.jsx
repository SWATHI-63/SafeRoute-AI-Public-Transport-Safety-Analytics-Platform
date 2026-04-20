import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Navigation Map', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-100 z-50 relative h-20 flex justify-between items-center px-8 md:px-12">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-3">
        <ShieldCheck className="h-10 w-10 text-brand-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">SafeRoute AI</h1>
        </div>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`text-lg font-semibold transition-colors ${
              location.pathname === link.path 
                ? 'text-brand-500' 
                : 'text-slate-600 hover:text-brand-500'
            }`}
          >
            {link.name}
          </Link>
        ))}
        
        {location.pathname !== '/dashboard' && (
          <Link 
            to="/dashboard" 
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 text-lg rounded-full font-bold transition-all shadow-lg shadow-brand-200"
          >
            Try Platform <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>

      {/* Mobile Toggle */}
      <button 
        className="md:hidden text-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-8 w-8"/> : <Menu className="h-8 w-8"/>}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-lg border-b border-slate-100 flex flex-col p-4 gap-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`font-medium p-2 rounded-lg ${
                location.pathname === link.path 
                  ? 'bg-brand-50 text-brand-600' 
                  : 'text-slate-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
