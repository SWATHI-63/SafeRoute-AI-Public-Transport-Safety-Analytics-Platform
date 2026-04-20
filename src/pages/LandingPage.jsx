import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, ShieldAlert, Map, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col bg-slate-50 overflow-y-auto">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-36 max-w-6xl mx-auto flex flex-col md:flex-row items-center text-center md:text-left gap-12">
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-600 font-bold text-xs uppercase tracking-wider mb-2">
            AI-Powered Urban safety
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            Navigate your city <br/>
            <span className="text-brand-500">safely & securely.</span>
          </h1>
          <p className="text-lg text-slate-600 md:pr-12">
            SafeRoute AI uses historical metrics, real-time tracking, and user reports to help you find the most secure public transport routes—day or night.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <Link to="/dashboard" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-slate-300 flex justify-center items-center gap-2">
              Launch Dashboard <Navigation className="w-5 h-5"/>
            </Link>
            <button className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-brand-300 text-slate-700 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500"/> View SOS Features
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute inset-0 bg-brand-200 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
          <img 
            src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?auto=format&fit=crop&q=80&w=800" 
            alt="City Map" 
            className="relative z-10 rounded-2xl shadow-2xl border-4 border-white object-cover h-[400px] w-full"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why use SafeRoute AI?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our platform combines data-driven insights with intuitive interfaces to guarantee the safety of every commuter.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Map className="w-8 h-8 text-brand-500" />}
              title="Intelligent Heatmaps"
              description="Visualize historical incident frequencies directly on the map. Know which zones to avoid before you even start moving."
            />
            <FeatureCard 
              icon={<AlertTriangle className="w-8 h-8 text-amber-500" />}
              title="Real-Time Alerts"
              description="Instantly receive notifications about sudden hazards or incidents in your surrounding area based on crowd-sourced data."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-blue-500" />}
              title="Crowdsourced Feedback"
              description="Contribute to a safer city. Users can anonymously report poor lighting, isolation, or suspicious activities instantly."
            />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:border-brand-200 transition-all">
      <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
