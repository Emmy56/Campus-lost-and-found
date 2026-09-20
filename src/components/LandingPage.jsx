import React from 'react';
import { Search, PlusCircle, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onStartReporting, onNavigateToFind, stats }) {
  return (
    <div className="space-y-20 font-sans pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>OAU Campus Lost & Found System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Lost Something on Campus? <br className="hidden sm:inline" />
              <span className="text-blue-600">Find It Fast with AI.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              No more searching endless WhatsApp group chats. Report lost or found items, get automated similarity matches, and connect securely with fellow students.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => onStartReporting('lost')}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Report Lost Item
              </button>

              <button
                onClick={() => onStartReporting('found')}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                Report Found Item
              </button>

              <button
                onClick={onNavigateToFind}
                className="px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Search className="w-4 h-4 text-gray-500" />
                Browse Items
              </button>
            </div>

            {/* Quick stats row */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{stats?.lost || 120}+</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Lost Reports</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{stats?.found || 85}+</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Found Items</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-blue-600">{stats?.matches || 280}+</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">AI Matches</p>
              </div>
            </div>
          </div>

          {/* Right Visual Graphic Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  AI Match Preview
                </span>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  88% Match
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                  <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Lost Item Report</p>
                  <h4 className="font-extrabold text-lg text-white">HP Laptop Power Charger 220W</h4>
                  <p className="text-xs text-blue-100 mt-1">Last seen at Hezekiah Oluwasanmi Library 2nd Floor.</p>
                </div>

                <div className="flex justify-center my-1">
                  <div className="p-2 bg-white text-blue-600 rounded-full shadow-lg">
                    <Sparkles className="w-5 h-5 animate-spin" />
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                  <p className="text-[10px] text-emerald-300 uppercase font-bold tracking-wider">Found Item Report</p>
                  <h4 className="font-extrabold text-lg text-white">Black HP Laptop Adapter 220W</h4>
                  <p className="text-xs text-blue-100 mt-1">Found on table, 2nd floor library reading area.</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-blue-100 font-medium">Automatic Notification dispatched to both students!</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
