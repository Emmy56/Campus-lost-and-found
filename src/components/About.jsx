import React from 'react';
import { Shield, Sparkles, MessageSquare, Heart, Lock, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-12 font-sans">
      {/* Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="px-3.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
          Campus Lost & Found Platform
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Reuniting OAU Students with Lost Belongings
        </h1>
        <p className="text-base text-gray-500 font-medium leading-relaxed">
          CLF is an automated campus lost-and-found web system designed to eliminate unorganized WhatsApp group messages by introducing intelligent AI matching and secure campus communication.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">AI Similarity Engine</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Uses Jaro-Winkler string distance scoring and category filtering to compare newly submitted reports against existing listings, alerting both parties automatically.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">Safe In-App Messaging</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Communicate securely within the platform without revealing personal phone numbers or exposing yourself to external scam attempts.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-blue-400 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-lg">Admin Moderation</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Campus administrators actively monitor flagged listings, ban fraudulent accounts, and maintain system integrity across Obafemi Awolowo University.
          </p>
        </div>
      </div>

      {/* Safety & Guidelines Section */}
      <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <Lock className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-extrabold">Safe Exchange Recommendations</h2>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          When meeting another student to return or recover a lost item, always follow these campus safety guidelines:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200">Meet in well-lit, public campus locations (e.g., Hezekiah Oluwasanmi Library Foyer or Senate Building).</span>
          </div>

          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200">Verify unique item details (serial numbers, stickers, specific markings) before handing over items.</span>
          </div>

          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200">Never send money or airtime upfront before physically inspecting the returned item.</span>
          </div>

          <div className="flex items-start gap-3 bg-white/10 p-4 rounded-xl backdrop-blur-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-200">Use the in-app "Flag Listing" button if you notice any suspicious activity.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
