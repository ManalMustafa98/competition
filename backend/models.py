from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, date

class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Expense title")
    amount: float = Field(..., gt=0, description="Expense amount must be strictly greater than 0")
    category: str = Field(..., min_length=1, max_length=50, description="Expense category")
    date: str = Field(..., description="Expense date formatted as YYYY-MM-DD")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Expense title cannot be empty or whitespace only")
        return clean

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Expense category cannot be empty")
        return clean

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            parsed = datetime.strptime(v.strip(), "%Y-%m-%d")
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD (e.g., 2026-03-30)")


class ExpenseResponse(BaseModel):
    id: str
    title: str
    amount: float
    category: str
    date: str
    created_at: Optional[str] = None


class SummaryResponse(BaseModel):
    total_spending: float
    transaction_count: int
    highest_spending_category: Optional[str] = None


class CategoryBreakdownItem(BaseModel):
    category: str
    total: float
    percentage: float


class AnalysisResponse(BaseModel):
    summary: str
    suggestions: List[str]
    analyzed_at: str
    expense_count: int
    total_spent: float
