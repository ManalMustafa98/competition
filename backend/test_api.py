import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_endpoints():
    print("=== Testing FastAPI Root Endpoint ===")
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.status_code} {r.text}"
    print(" Root OK:", r.json())

    print("\n=== Testing GET /api/summary ===")
    r = client.get("/api/summary")
    assert r.status_code == 200, f"Summary failed: {r.status_code} {r.text}"
    summary = r.json()
    print(" Summary OK:", summary)
    assert "total_spending" in summary
    assert "transaction_count" in summary

    print("\n=== Testing GET /api/category-breakdown ===")
    r = client.get("/api/category-breakdown")
    assert r.status_code == 200, f"Breakdown failed: {r.status_code} {r.text}"
    breakdown = r.json()
    print(f" Breakdown OK ({len(breakdown)} categories):", breakdown[:2])

    print("\n=== Testing GET /api/expenses ===")
    r = client.get("/api/expenses")
    assert r.status_code == 200, f"Expenses failed: {r.status_code} {r.text}"
    expenses = r.json()
    print(f" Expenses OK ({len(expenses)} items)")

    print("\n=== Testing POST /api/expenses (Valid Creation) ===")
    payload = {
        "title": "Cloud Server Hosting Test",
        "amount": 42.50,
        "category": "Utilities",
        "date": "2026-03-25"
    }
    r = client.post("/api/expenses", json=payload)
    assert r.status_code == 201, f"Create expense failed: {r.status_code} {r.text}"
    created = r.json()
    print(" Expense Created:", created)
    new_id = created["id"]
    assert created["amount"] == 42.50
    assert created["title"] == "Cloud Server Hosting Test"

    print("\n=== Testing Validation (Negative Amount Rejection) ===")
    bad_payload = {
        "title": "Invalid Negative Expense",
        "amount": -50.00,
        "category": "Utilities",
        "date": "2026-03-25"
    }
    r = client.post("/api/expenses", json=bad_payload)
    assert r.status_code == 422, f"Should have failed validation, got: {r.status_code}"
    print(" Validation correctly rejected negative amount (HTTP 422)")

    print("\n=== Testing Validation (Empty Title Rejection) ===")
    bad_payload2 = {
        "title": "   ",
        "amount": 25.00,
        "category": "Dining Out",
        "date": "2026-03-25"
    }
    r = client.post("/api/expenses", json=bad_payload2)
    assert r.status_code == 422, f"Should have failed validation, got: {r.status_code}"
    print(" Validation correctly rejected empty title (HTTP 422)")

    print("\n=== Testing DELETE /api/expenses/{id} ===")
    r = client.delete(f"/api/expenses/{new_id}")
    assert r.status_code == 200, f"Delete failed: {r.status_code} {r.text}"
    print(" Expense Deleted successfully:", r.json())

    print("\n=== Testing DELETE Non-Existent ID ===")
    r = client.delete("/api/expenses/non-existent-uuid-1234")
    assert r.status_code == 404, f"Expected 404, got: {r.status_code}"
    print(" Correctly returned 404 for missing item")

    print("\n=== Testing POST /api/analyze (AI Endpoint) ===")
    r = client.post("/api/analyze")
    assert r.status_code == 200, f"Analyze failed: {r.status_code} {r.text}"
    analysis = r.json()
    print(" AI Analysis OK:")
    print(" - Summary:", analysis.get("summary"))
    print(" - Suggestions count:", len(analysis.get("suggestions", [])))
    for i, s in enumerate(analysis.get("suggestions", []), 1):
        print(f"   [{i}] {s}")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! ")

if __name__ == "__main__":
    test_endpoints()
