-- ====================================================================
-- Smart Expense Analyzer — Supabase PostgreSQL Database Schema
-- ====================================================================
-- This schema creates the `expenses` table with proper constraints,
-- data types, indices for fast queries, and optional Row Level Security.
--
-- How to apply this schema:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project and navigate to the "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste the entire contents of this file, and click "Run".
-- ====================================================================

-- 1. Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add indices for optimal performance on date and category queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

-- 3. Optional: Enable Row Level Security (RLS)
-- If you use standard service role keys in FastAPI, service role bypasses RLS.
-- If you use anon key with public access, allow public read/write:
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full access to expenses"
ON public.expenses
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Realistic sample expenses for initial demo (inserted only if table is empty)
INSERT INTO public.expenses (title, amount, category, date)
SELECT title, amount, category, date::DATE FROM (
    VALUES
        ('Grocery Shopping at Whole Foods', 142.50, 'Groceries', CURRENT_DATE - INTERVAL '1 day'),
        ('Monthly Internet Subscription', 65.00, 'Utilities', CURRENT_DATE - INTERVAL '3 days'),
        ('Dinner with Friends', 78.20, 'Dining Out', CURRENT_DATE - INTERVAL '4 days'),
        ('Gas Station Refill', 45.00, 'Transportation', CURRENT_DATE - INTERVAL '6 days'),
        ('Electric Bill', 115.40, 'Utilities', CURRENT_DATE - INTERVAL '8 days'),
        ('Gym Membership', 50.00, 'Health & Fitness', CURRENT_DATE - INTERVAL '10 days'),
        ('Coffee & Bakery Snacks', 18.75, 'Dining Out', CURRENT_DATE - INTERVAL '11 days'),
        ('Supermarket Weekly Supplies', 95.80, 'Groceries', CURRENT_DATE - INTERVAL '14 days'),
        ('Streaming Services Bundle', 29.99, 'Entertainment', CURRENT_DATE - INTERVAL '15 days'),
        ('Pharmacy & Medicine', 34.50, 'Health & Fitness', CURRENT_DATE - INTERVAL '18 days')
) AS sample_data(title, amount, category, date)
WHERE NOT EXISTS (SELECT 1 FROM public.expenses LIMIT 1);
