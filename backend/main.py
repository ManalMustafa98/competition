from contextlib import asynccontextmanager
import logging
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from models import (
    ExpenseCreate,
    ExpenseResponse,
    SummaryResponse,
    CategoryBreakdownItem,
    AnalysisResponse,
)
import database
from ai_service import analyze_spending_with_ai

logger = logging.getLogger("expense_analyzer")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initializes database and seeds realistic sample data once if the database is empty.
    """
    logger.info("Starting Smart Expense Analyzer backend...")
    logger.info(f"Database Storage Backend: {database.get_storage_type()}")
    try:
        database.seed_sample_data_if_empty()
    except Exception as e:
        logger.error(f"Error during startup data check: {e}")
    yield
    logger.info("Shutting down Smart Expense Analyzer backend...")


app = FastAPI(
    title="Smart Expense Analyzer API",
    description="Backend API powering the Smart Expense Analyzer with Supabase persistence and OpenRouter AI integration.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "app": "Smart Expense Analyzer API",
        "version": "1.0.0",
        "storage": database.get_storage_type(),
        "docs_url": "/docs",
    }


@app.get(
    "/api/expenses",
    response_model=List[ExpenseResponse],
    summary="Retrieve all expenses",
    description="Returns all recorded expenses ordered by date descending."
)
def get_expenses():
    try:
        records = database.get_all_expenses()
        return records
    except Exception as e:
        logger.error(f"Failed to fetch expenses: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to fetch expenses from database")


@app.post(
    "/api/expenses",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new expense",
    description="Validates and persists a new expense to Supabase storage."
)
def create_expense(expense: ExpenseCreate):
    try:
        new_record = database.add_expense(expense.model_dump())
        return new_record
    except Exception as e:
        logger.error(f"Failed to create expense: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to persist expense")


@app.delete(
    "/api/expenses/{expense_id}",
    summary="Delete an expense",
    description="Removes an expense record from Supabase storage by its unique ID."
)
def delete_expense(expense_id: str):
    try:
        deleted = database.delete_expense(expense_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Expense with ID '{expense_id}' not found")
        return {"success": True, "message": f"Expense '{expense_id}' successfully deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete expense {expense_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete expense from database")


@app.get(
    "/api/summary",
    response_model=SummaryResponse,
    summary="Get spending summary statistics",
    description="Calculates total spending, transaction count, and highest spending category from database records."
)
def get_summary():
    try:
        return database.get_summary_statistics()
    except Exception as e:
        logger.error(f"Failed to calculate summary: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to calculate summary statistics")


@app.get(
    "/api/category-breakdown",
    response_model=List[CategoryBreakdownItem],
    summary="Get category-wise spending breakdown",
    description="Calculates total amount and percentage share per category for visualization charts."
)
def get_category_breakdown():
    try:
        return database.get_category_breakdown()
    except Exception as e:
        logger.error(f"Failed to calculate category breakdown: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to calculate category breakdown")


@app.post(
    "/api/analyze",
    response_model=AnalysisResponse,
    summary="Run AI spending analysis",
    description="Retrieves database records, analyzes patterns, and requests personalized saving suggestions via OpenRouter API."
)
async def analyze_spending():
    try:
        expenses = database.get_all_expenses()
        summary = database.get_summary_statistics()
        breakdown = database.get_category_breakdown()
        result = await analyze_spending_with_ai(expenses, summary, breakdown)
        return result
    except Exception as e:
        logger.error(f"Error in AI analysis endpoint: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while generating AI analysis")
