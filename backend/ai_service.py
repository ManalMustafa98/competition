import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List
import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("expense_analyzer.ai")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct").strip()
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


async def analyze_spending_with_ai(expenses: List[Dict[str, Any]], summary: Dict[str, Any], breakdown: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes spending data using OpenRouter API and returns a structured summary
    with exactly three personalized saving recommendations.
    """
    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    # 1. Check if there are sufficient records
    if len(expenses) < 2:
        return {
            "summary": "You only have one or zero recorded expenses so far. To provide meaningful financial insights and actionable pattern detection, the analyzer needs at least 2 to 3 recorded expenses.",
            "suggestions": [
                "Log your recurring monthly bills (such as utilities, internet, or subscriptions).",
                "Add your frequent variable expenses (like groceries, daily coffee, or dining out).",
                "Record transport and fuel costs to uncover potential commuting savings."
            ],
            "analyzed_at": now_str,
            "expense_count": len(expenses),
            "total_spent": summary.get("total_spending", 0.0)
        }

    # 2. Check if OpenRouter API Key is configured
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key or api_key.startswith("your_"):
        logger.warning("OpenRouter API key not configured or using placeholder.")
        # Provide smart fallback analysis calculated from the user's real backend data
        highest_cat = summary.get("highest_spending_category", "N/A")
        total_spent = summary.get("total_spending", 0.0)
        top_pct = breakdown[0]["percentage"] if breakdown else 0.0

        return {
            "summary": f"Based on your {len(expenses)} recorded transactions totaling ${total_spent:,.2f}, your largest spending area is '{highest_cat}', accounting for {top_pct}% of your overall budget. (Note: Configure OPENROUTER_API_KEY in backend/.env for generative LLM analysis).",
            "suggestions": [
                f"Evaluate your '{highest_cat}' expenditures for subscription overlaps or impulse buying.",
                "Establish a 50/30/20 budget framework to allocate a dedicated cap on variable non-essential categories.",
                "Review upcoming recurring bills 3 days before renewal to cancel unused services."
            ],
            "analyzed_at": now_str,
            "expense_count": len(expenses),
            "total_spent": total_spent
        }

    # 3. Prepare compact context for the LLM
    top_categories_str = ", ".join([f"{item['category']}: ${item['total']:.2f} ({item['percentage']}%)" for item in breakdown[:5]])
    sample_recent = [
        f"- {e['title']}: ${float(e['amount']):.2f} on {e['date']} ({e['category']})"
        for e in expenses[:10]
    ]
    recent_transactions_str = "\n".join(sample_recent)

    system_prompt = (
        "You are an expert personal finance advisor and expense analyst. "
        "Analyze the provided spending data and return a JSON object with strictly these keys:\n"
        "- 'summary': A concise 2-3 sentence overview of the user's spending habits, highlighting key trends and dominant categories.\n"
        "- 'suggestions': A JSON array of exactly 3 practical, realistic, and personalized saving tips based directly on their transactions.\n\n"
        "Output ONLY raw JSON with no Markdown backticks or additional text."
    )

    user_prompt = f"""
Here is the user's spending data:
- Total Transactions: {len(expenses)}
- Total Amount Spent: ${summary.get('total_spending', 0.0):.2f}
- Highest Spending Category: {summary.get('highest_spending_category', 'None')}
- Category Breakdown: {top_categories_str}
- Recent Transactions Sample:
{recent_transactions_str}

Please generate the financial summary and exactly 3 actionable saving suggestions in JSON format.
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Smart Expense Analyzer"
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 500
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(OPENROUTER_URL, headers=headers, json=payload)

            if response.status_code == 401:
                logger.error("OpenRouter returned 401 Unauthorized: Invalid API key.")
                return {
                    "summary": f"Your OpenRouter API Key was rejected (401 Unauthorized). Please verify that OPENROUTER_API_KEY in backend/.env is valid and active. Total spending analyzed: ${summary.get('total_spending', 0.0):,.2f}.",
                    "suggestions": [
                        "Double check your OpenRouter API Key at https://openrouter.ai/keys.",
                        "Confirm that you have credits or quota on your OpenRouter account.",
                        "Inspect your backend/.env file and restart the FastAPI server."
                    ],
                    "analyzed_at": now_str,
                    "expense_count": len(expenses),
                    "total_spent": summary.get("total_spending", 0.0)
                }

            if response.status_code == 429:
                logger.warning("OpenRouter rate limit hit (429).")
                return {
                    "summary": "The AI analysis service is temporarily rate-limited. Please wait a minute before requesting another analysis.",
                    "suggestions": [
                        f"Your top expenditure remains {summary.get('highest_spending_category', 'general items')}.",
                        "Try reducing discretionary spending by 10% this week.",
                        "Review your recurring subscriptions in the Expense History table."
                    ],
                    "analyzed_at": now_str,
                    "expense_count": len(expenses),
                    "total_spent": summary.get("total_spending", 0.0)
                }

            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"].strip()

            # Clean JSON markdown if the model wrapped it in ```json ... ```
            if content.startswith("```"):
                lines = content.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                content = "\n".join(lines).strip()

            parsed = json.loads(content)
            summary_text = parsed.get("summary", "Analysis completed.")
            raw_suggestions = parsed.get("suggestions", [])

            # Ensure exactly 3 suggestions
            if isinstance(raw_suggestions, list) and len(raw_suggestions) >= 3:
                suggestions = [str(s) for s in raw_suggestions[:3]]
            elif isinstance(raw_suggestions, list) and len(raw_suggestions) > 0:
                suggestions = [str(s) for s in raw_suggestions]
                while len(suggestions) < 3:
                    suggestions.append("Monitor high-frequency micro-purchases that aggregate over the month.")
            else:
                suggestions = [
                    "Audit high-frequency discretionary spending categories.",
                    "Set a weekly spending target to maintain balanced cash flow.",
                    "Automate a fixed percentage of income directly into savings."
                ]

            return {
                "summary": summary_text,
                "suggestions": suggestions,
                "analyzed_at": now_str,
                "expense_count": len(expenses),
                "total_spent": summary.get("total_spending", 0.0)
            }

    except json.JSONDecodeError as jde:
        logger.error(f"Failed to parse LLM response as JSON: {jde}")
        return {
            "summary": "AI generated analysis based on your spending, though formatting was slightly non-standard.",
            "suggestions": [
                f"Prioritize reducing expenses in your largest category: {summary.get('highest_spending_category', 'N/A')}.",
                "Keep tracking every daily purchase to build high-accuracy financial models.",
                "Review monthly utility and service contracts to negotiate lower rates."
            ],
            "analyzed_at": now_str,
            "expense_count": len(expenses),
            "total_spent": summary.get("total_spending", 0.0)
        }
    except Exception as e:
        logger.error(f"OpenRouter request error: {e}")
        return {
            "summary": f"Could not reach OpenRouter service ({str(e)}). Displaying baseline calculated metrics: Total expenses ${summary.get('total_spending', 0.0):,.2f} across {len(expenses)} transactions.",
            "suggestions": [
                "Verify internet connectivity and OpenRouter service status.",
                f"Keep an eye on '{summary.get('highest_spending_category', 'all categories')}' to avoid budget overrun.",
                "Ensure your OPENROUTER_MODEL is accessible on your account."
            ],
            "analyzed_at": now_str,
            "expense_count": len(expenses),
            "total_spent": summary.get("total_spending", 0.0)
        }
