'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  Receipt, 
  Award, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import CategoryChart from '../components/CategoryChart';
import SpendingAnalysis from '../components/SpendingAnalysis';

import { 
  fetchSummary, 
  fetchCategoryBreakdown, 
  fetchExpenses 
} from '../services/api';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core Data States
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [summaryRes, breakdownRes, expensesRes] = await Promise.all([
        fetchSummary(),
        fetchCategoryBreakdown(),
        fetchExpenses(),
      ]);

      setSummary(summaryRes);
      setBreakdown(breakdownRes);
      setExpenses(expensesRes);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(
        'Could not reach the FastAPI backend at ' +
        (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000') +
        '. Ensure the backend server is running.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initialFetch() {
      try {
        const [summaryRes, breakdownRes, expensesRes] = await Promise.all([
          fetchSummary(),
          fetchCategoryBreakdown(),
          fetchExpenses(),
        ]);

        if (!ignore) {
          setSummary(summaryRes);
          setBreakdown(breakdownRes);
          setExpenses(expensesRes);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (!ignore) {
          setError(
            'Could not reach the FastAPI backend at ' +
            (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000') +
            '. Ensure the backend server is running.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    initialFetch();

    return () => {
      ignore = true;
    };
  }, []);

  const handleExpenseAdded = () => {
    // Refresh all statistics, chart, and history
    refreshData(true);
  };

  const handleExpenseDeleted = () => {
    // Refresh all statistics, chart, and history
    refreshData(true);
  };

  const totalSpendingFormatted = summary 
    ? `$${Number(summary.total_spending).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
    : '$0.00';

  const transactionCount = summary ? summary.transaction_count : 0;
  const highestCategory = summary && summary.highest_spending_category 
    ? summary.highest_spending_category 
    : 'None';

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          backendStatus={!error} 
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative z-10 w-64 bg-[#0F172A]">
            <div className="p-4 flex justify-end">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }} 
              backendStatus={!error} 
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Smart Expense Dashboard
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Real-time financial analytics powered by FastAPI, Supabase & OpenRouter
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-400 font-medium hidden md:inline">
                Synced at {lastUpdated}
              </span>
            )}

            <button
              onClick={() => refreshData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Global Connection Error Banner */}
        {error && (
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <strong className="font-semibold block text-sm text-amber-950">Backend Connection Warning</strong>
              <p className="mt-0.5 leading-relaxed">{error}</p>
              <p className="mt-2 text-slate-600">
                To run the backend: navigate to the <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono">backend</code> folder and run <code className="bg-amber-100/70 px-1 py-0.5 rounded font-mono">uvicorn main:app --reload</code>.
              </p>
            </div>
            <button
              onClick={() => refreshData()}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium shrink-0 cursor-pointer"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* Dashboard Body */}
        <main className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Section 1: Top Metric Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard
              title="Total Spending"
              value={totalSpendingFormatted}
              subtitle="All persistent transactions"
              icon={DollarSign}
              color="purple"
              loading={loading}
            />
            <StatCard
              title="Total Transactions"
              value={transactionCount.toString()}
              subtitle="Active database records"
              icon={Receipt}
              color="indigo"
              loading={loading}
            />
            <StatCard
              title="Top Spending Category"
              value={highestCategory}
              subtitle="Highest budget utilization"
              icon={Award}
              color="amber"
              loading={loading}
            />
          </section>

          {/* Section 2: AI Spending Analysis & Recommendations */}
          <section>
            <SpendingAnalysis onAnalysisComplete={() => {}} />
          </section>

          {/* Section 3: Add Expense & Category Breakdown Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Add Expense Form (5 cols on large screens) */}
            <div className="lg:col-span-5 w-full">
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>

            {/* Category Chart (7 cols on large screens) */}
            <div className="lg:col-span-7 w-full">
              <CategoryChart breakdown={breakdown} loading={loading} />
            </div>
          </section>

          {/* Section 4: Full Expense History Table */}
          <section>
            <ExpenseTable 
              expenses={expenses} 
              onExpenseDeleted={handleExpenseDeleted}
              loading={loading}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
