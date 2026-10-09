/**
 * Centralized API service for communicating with the Python/FastAPI backend.
 * All business logic, database queries, and statistics calculations remain on the backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson && errJson.detail) {
          errorMessage = typeof errJson.detail === 'string'
            ? errJson.detail
            : JSON.stringify(errJson.detail);
        }
      } catch {
        // If response wasn't JSON, retain status message
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (error) {
    console.error(`API request error on ${endpoint}:`, error);
    throw error;
  }
}

export async function fetchExpenses() {
  return request('/api/expenses');
}

export async function createExpense(expenseData) {
  return request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
}

export async function deleteExpense(expenseId) {
  return request(`/api/expenses/${expenseId}`, {
    method: 'DELETE',
  });
}

export async function fetchSummary() {
  return request('/api/summary');
}

export async function fetchCategoryBreakdown() {
  return request('/api/category-breakdown');
}

export async function analyzeSpending() {
  return request('/api/analyze', {
    method: 'POST',
  });
}
