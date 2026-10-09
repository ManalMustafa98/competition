import './globals.css';

export const metadata = {
  title: 'Smart Expense Analyzer — AI-Powered Spending Insights',
  description: 'Track expenses, visualize category patterns, and receive personalized AI saving recommendations powered by Supabase, FastAPI, and OpenRouter.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
