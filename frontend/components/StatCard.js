'use client';

import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'purple', loading = false }) {
  const colorMap = {
    purple: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      badge: 'bg-purple-100 text-purple-700',
      ring: 'group-hover:border-purple-300',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      badge: 'bg-emerald-100 text-emerald-700',
      ring: 'group-hover:border-emerald-300',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      badge: 'bg-indigo-100 text-indigo-700',
      ring: 'group-hover:border-indigo-300',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      badge: 'bg-amber-100 text-amber-700',
      ring: 'group-hover:border-amber-300',
    },
  };

  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div className={`group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${scheme.ring}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-28 bg-slate-100 animate-pulse rounded-lg my-1" />
          ) : (
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${scheme.bg} transition-transform group-hover:scale-105 duration-200`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Subtle bottom decorative accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
