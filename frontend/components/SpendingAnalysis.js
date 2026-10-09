'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { analyzeSpending } from '../services/api';

export default function SpendingAnalysis({ initialAnalysis = null, onAnalysisComplete }) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyzeSpending();
      setAnalysis(data);
      if (onAnalysisComplete) {
        onAnalysisComplete(data);
      }
    } catch (err) {
      setError(err.message || 'Unable to complete AI spending analysis. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
      {/* Background glowing ambient effects */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner & Action */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/40">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/30 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              AI Spending Analysis & Recommendations
            </h2>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Powered by OpenRouter intelligent reasoning on actual Supabase transaction records
            </p>
          </div>
        </div>

        {/* Prominent Action Button */}
        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-600 hover:via-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Expenses...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze My Spending</span>
            </>
          )}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-rose-300">Analysis Request Failed</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
          <button
            onClick={handleRunAnalysis}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !analysis && (
        <div className="mt-6 space-y-4 animate-pulse">
          <div className="h-4 bg-indigo-900/40 rounded-lg w-3/4" />
          <div className="h-4 bg-indigo-900/30 rounded-lg w-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="h-28 bg-indigo-950/60 rounded-xl border border-indigo-900/40" />
            <div className="h-28 bg-indigo-950/60 rounded-xl border border-indigo-900/40" />
            <div className="h-28 bg-indigo-950/60 rounded-xl border border-indigo-900/40" />
          </div>
        </div>
      )}

      {/* Analysis Content */}
      {analysis && !loading && (
        <div className="mt-6 space-y-6 relative z-10 animate-fadeIn">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingDown className="w-4 h-4" />
              <span>Spending Overview</span>
            </div>
            <p className="text-sm leading-relaxed text-indigo-100/90 font-normal">
              {analysis.summary}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-indigo-300/70">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                {analysis.expense_count} Transactions Evaluated
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Generated: {analysis.analyzed_at}
              </span>
            </div>
          </div>

          {/* Three Saving Suggestions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Targeted Saving Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {analysis.suggestions && analysis.suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-800/60 border border-indigo-800/30 hover:border-purple-500/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {suggestion}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Actionable step</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty State before user has clicked */}
      {!analysis && !loading && !error && (
        <div className="mt-6 p-6 rounded-xl bg-white/5 border border-white/10 text-center max-w-lg mx-auto">
          <p className="text-sm text-indigo-200 font-medium">
            Ready to discover personalized financial opportunities?
          </p>
          <p className="text-xs text-indigo-300/70 mt-1">
            Click <strong className="text-white">&quot;Analyze My Spending&quot;</strong> to let the AI process your category distributions and suggest 3 high-impact habits to save money.
          </p>
        </div>
      )}
    </div>
  );
}
