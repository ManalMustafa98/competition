'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, Receipt, AlertCircle, Calendar, Tag } from 'lucide-react';
import { deleteExpense } from '../services/api';

const CATEGORY_COLORS = {
  Groceries: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Dining Out': 'bg-amber-50 text-amber-700 border-amber-200',
  Transportation: 'bg-blue-50 text-blue-700 border-blue-200',
  Utilities: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
  'Health & Fitness': 'bg-rose-50 text-rose-700 border-rose-200',
  Shopping: 'bg-pink-50 text-pink-700 border-pink-200',
  Education: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Other: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function ExpenseTable({ expenses = [], onExpenseDeleted, loading = false }) {
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    setDeleteError(null);

    try {
      await deleteExpense(id);
      if (onExpenseDeleted) {
        onExpenseDeleted(id);
      }
    } catch (err) {
      setDeleteError(`Failed to delete "${title}": ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-600" />
            Expense History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All persistent transactions synced with Supabase
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          {expenses.length} Records
        </span>
      </div>

      {deleteError && (
        <div className="m-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-6">Description</th>
              <th className="py-3 px-6">Category</th>
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-6 text-right">Amount</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-xs">Loading transaction history...</span>
                  </div>
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-slate-400">
                    <Receipt className="w-10 h-10 text-slate-300 stroke-1" />
                    <p className="text-sm font-semibold text-slate-700">No Expenses Recorded</p>
                    <p className="text-xs text-slate-400">
                      Add your first expense using the form above to view transaction logs and start AI analysis.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => {
                const badgeStyle = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Other;
                const isDeleting = deletingId === expense.id;

                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {expense.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
                        <Tag className="w-3 h-3 opacity-60" />
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {expense.date}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                      ${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(expense.id, expense.title)}
                        disabled={isDeleting}
                        title="Delete expense"
                        className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
