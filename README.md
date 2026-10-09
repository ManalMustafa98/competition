# Smart Expense Analyzer — Full-Stack Application

A full-stack financial dashboard designed to help users track expenses, explore category-wise distributions, and receive AI-powered saving suggestions.

---

## 1. Architecture Overview

This project is decoupled into two independent applications:

```
competition/
├── frontend/                     # Next.js App Router (JavaScript + Tailwind CSS)
│   ├── app/
│   │   ├── layout.js             # Root layout with Inter typography and page title
│   │   ├── page.js               # Main Dashboard page
│   │   └── globals.css           # Global Tailwind CSS directives
│   ├── components/
│   │   ├── Sidebar.js            # Dark navy sidebar navigation
│   │   ├── StatCard.js           # Reusable metric cards
│   │   ├── ExpenseForm.js        # Add expense form with live validation
│   │   ├── ExpenseTable.js       # Transaction history with category tags and delete action
│   │   ├── CategoryChart.js      # Recharts Donut & Bar chart switcher
│   │   └── SpendingAnalysis.js   # OpenRouter AI advisor with 3 personalized tips
│   ├── services/
│   │   └── api.js                # Centralized API service for FastAPI communication
│   ├── .env.local.example        # Frontend environment template
│   └── package.json
│
├── backend/                      # Python FastAPI Backend
│   ├── main.py                   # FastAPI server, endpoints, CORS, lifespans
│   ├── database.py               # Supabase persistent driver with SQLite fallback
│   ├── models.py                 # Pydantic validation & schemas
│   ├── ai_service.py             # OpenRouter API client for intelligent spending analysis
│   ├── schema.sql                # Supabase PostgreSQL schema with RLS and indices
│   ├── requirements.txt          # Python dependencies
│   ├── test_api.py               # Automated endpoint test suite
│   ├── test_seeding.py           # Automated database seeding and idempotency tests
│   ├── .env.example              # Backend environment template
│   └── .env                      # Local runtime environment file
│
└── README.md                     # Complete project documentation
```

### Key Architectural Decisions
- **Separation of Concerns**: Python/FastAPI handles all database access, business statistics, calculations, validations, and AI prompts. React only renders returned data.
- **Persistent Storage**: Uses **Supabase** cloud database (`supabase-py`). If credentials are not yet entered, it gracefully falls back to local persistent SQLite (`backend/expenses.db`) so the application never crashes while awaiting cloud setup.
- **AI Intelligence**: Connects to the **OpenRouter API** to provide spending summaries and exactly 3 practical saving suggestions.
- **Visual Design**: Professional dark navy sidebar (`#0F172A`), white content cards, subtle purple accents (`#7C3AED`), and interactive charts.

---

## 2. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Health & active storage engine status |
| `GET` | `/api/expenses` | Retrieve all expenses ordered by date descending |
| `POST` | `/api/expenses` | Validate and persist a new expense (`title`, `amount > 0`, `category`, `date`) |
| `DELETE` | `/api/expenses/{expense_id}` | Delete an expense record by its unique ID |
| `GET` | `/api/summary` | Return `total_spending`, `transaction_count`, and `highest_spending_category` |
| `GET` | `/api/category-breakdown` | Return category totals and percentage shares for visualization |
| `POST` | `/api/analyze` | Request AI analysis via OpenRouter and return summary with 3 saving tips |

Interactive Swagger API Documentation is available at: **`http://127.0.0.1:8000/docs`**

---

## 3. Running the Application on Windows

### Prerequisites
- **Python 3.10+** (Tested on Python 3.12 / 3.14)
- **Node.js 18+** (Tested on Node.js v26)
- **Git**

---

### Step 1: Start the Backend (Terminal 1)

1. Open PowerShell and navigate to the `backend` folder:
   ```powershell
   cd backend
   ```

2. Create a Python virtual environment:
   ```powershell
   py -3.12 -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   *(If script execution is disabled in PowerShell, you can run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` or activate using `cmd /c .\venv\Scripts\activate.bat`)*

4. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
   Edit `.env` to insert your **Supabase** and **OpenRouter** credentials (see sections below).

6. Start the FastAPI development server:
   ```powershell
   uvicorn main:app --reload --port 8000
   ```
   - Server URL: **`http://127.0.0.1:8000`**
   - Interactive Docs: **`http://127.0.0.1:8000/docs`**

---

### Step 2: Start the Frontend (Terminal 2)

1. Open a second PowerShell terminal and navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```

2. Install Node.js packages:
   ```powershell
   npm install
   ```

3. Set up the local environment file:
   Ensure `frontend/.env.local` exists with:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
   ```

4. Start the Next.js development server:
   ```powershell
   npm run dev
   ```

5. Open your browser and navigate to:
   - **`http://localhost:3000`**

---

## 4. Supabase Setup Instructions

1. Create a free account at [Supabase](https://supabase.com) and click **"New Project"**.
2. Name your project (e.g., `smart-expense-analyzer`) and set a database password.
3. Once the project is provisioned, go to the **SQL Editor** tab on the left navigation bar.
4. Open the SQL file provided in [`backend/schema.sql`](file:///c:/Users/Manen/Downloads/competition/competition/backend/schema.sql).
5. Copy its contents into the Supabase SQL editor and click **Run**.
6. Retrieve your credentials:
   - Go to **Project Settings** -> **API**.
   - Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy the **service_role secret key** (for server-side FastAPI access) or the **anon key**.
7. In [`backend/.env`](file:///c:/Users/Manen/Downloads/competition/competition/backend/.env), set:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```
8. Restart your FastAPI backend server. It will automatically connect directly to your cloud Supabase database!

---

## 5. OpenRouter API Configuration

1. Visit [OpenRouter](https://openrouter.ai) and sign up for an account.
2. Go to **Keys** (`https://openrouter.ai/keys`) and click **"Create Key"**.
3. In [`backend/.env`](file:///c:/Users/Manen/Downloads/competition/competition/backend/.env), set:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxx
   OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
   ```
4. **Model Recommendations**:
   - `meta-llama/llama-3.3-70b-instruct` — Fast, top-tier financial reasoning and advice.
   - `anthropic/claude-3.5-haiku` — Excellent structured JSON adherence and speed.
   - `google/gemini-2.0-flash-001` — Economical and ultra-fast.
   - `openai/gpt-4o-mini` — Standard reliable model.
5. If the OpenRouter key is not set or balance is exhausted, the backend automatically provides calculated statistical analysis and personalized advice based on actual expenditures, ensuring uninterrupted operation.

---

## 6. Running Automated Tests

Run the test suite inside `backend`:
```powershell
cd backend
.\venv\Scripts\python test_api.py
.\venv\Scripts\python test_seeding.py
```

Run the frontend lint and production build:
```powershell
cd frontend
npm run lint
npm run build
```

## 7. Deploying the Frontend to Vercel

The Next.js application is located in the `frontend` directory, not at the repository root. When creating or configuring the Vercel project:

1. Open **Project Settings** -> **General**.
2. Set **Root Directory** to `frontend` and save.
3. Leave the framework preset as **Next.js**.
4. Use the default build command (`next build`) and output directory.
5. Add `NEXT_PUBLIC_API_BASE_URL` under **Environment Variables**, using the deployed backend URL (for example, `https://your-backend.example.com`).
6. Redeploy the project.

If Vercel reports that it cannot detect a Next.js version, the project Root Directory is still set to the repository root. The `next` dependency is declared in `frontend/package.json`.
