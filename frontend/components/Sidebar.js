'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Sparkles, 
  ShieldCheck, 
  Wallet,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab = 'dashboard', setActiveTab, backendStatus }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expense Records', icon: Receipt },
    { id: 'analytics', label: 'Category Insights', icon: PieChart },
    { id: 'ai', label: 'AI Advisor', icon: Sparkles },
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800 transition-all select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/30">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              Smart Expense
            </h1>
            <p className="text-xs text-purple-300 font-medium tracking-wide">
              AI Analyzer
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'ai' && (
                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AI
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          System Info
        </div>
        <div className="px-3.5 py-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span>FastAPI Server:</span>
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {backendStatus ? 'Connected' : 'Active'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Database:</span>
            <span className="text-purple-300 font-medium">Supabase</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>LLM Engine:</span>
            <span className="text-slate-300 font-medium">OpenRouter</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Full-Stack Suite
          </span>
          <span className="font-mono text-[11px] text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
