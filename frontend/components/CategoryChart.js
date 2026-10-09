'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { PieChart as PieIcon, BarChart3, AlertCircle } from 'lucide-react';

const noopSubscribe = () => () => {};

const PALETTE = [
  '#7C3AED', // Primary Purple
  '#6366F1', // Indigo
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#F43F5E', // Rose
  '#8B5CF6', // Violet
  '#64748B', // Slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl shadow-xl text-xs border border-slate-700">
        <p className="font-semibold text-slate-200">{data.category}</p>
        <p className="text-purple-300 font-mono text-sm font-bold mt-0.5">
          ${Number(data.total).toFixed(2)}
        </p>
        <p className="text-slate-400 text-[11px] mt-0.5">
          {data.percentage}% of overall budget
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryChart({ breakdown = [], loading = false }) {
  const [chartType, setChartType] = useState('donut'); // 'donut' or 'bar'
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const hasData = breakdown && breakdown.length > 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-purple-600" />
            Spending by Category
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated by backend from persistent database records
          </p>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setChartType('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              chartType === 'donut'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bar</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-[280px] w-full flex items-center justify-center">
        {!isMounted || loading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
            <span className="text-xs">Preparing chart metrics...</span>
          </div>
        ) : !hasData ? (
          <div className="text-center py-10 px-4 text-slate-400 max-w-xs">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Category Data</p>
            <p className="text-xs text-slate-400 mt-1">
              Add transactions to see visual category breakdowns and proportion distributions.
            </p>
          </div>
        ) : chartType === 'donut' ? (
          <ResponsiveContainer width="100%" height={280}>
            <RechartsPieChart>
              <Pie
                data={breakdown}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={3}
              >
                {breakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={breakdown} margin={{ top: 15, right: 10, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: '#64748B' }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {breakdown.map((entry, index) => (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend / Category List */}
      {hasData && (
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {breakdown.slice(0, 6).map((item, idx) => (
            <div key={item.category} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
              />
              <span className="truncate text-slate-600 font-medium">{item.category}</span>
              <span className="ml-auto text-slate-400 font-mono text-[11px]">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
