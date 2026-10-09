import database

print("1. Seeding sample data...")
database.seed_sample_data_if_empty()

expenses = database.get_all_expenses()
print(f"2. Total expenses in database: {len(expenses)}")
assert len(expenses) >= 10, f"Expected at least 10 sample records, got {len(expenses)}"

summary = database.get_summary_statistics()
print(f"3. Calculated summary statistics: {summary}")
assert summary["total_spending"] > 0
assert summary["transaction_count"] >= 10
assert summary["highest_spending_category"] is not None

breakdown = database.get_category_breakdown()
print(f"4. Category breakdown count: {len(breakdown)}")
for b in breakdown:
    print(f"   - {b['category']}: ${b['total']:.2f} ({b['percentage']}%)")

print("\n5. Testing idempotency: Calling seed_sample_data_if_empty() a second time...")
database.seed_sample_data_if_empty()
expenses_second = database.get_all_expenses()
assert len(expenses_second) == len(expenses), "Seeding should NOT insert duplicates on subsequent calls!"
print(f" Verified: Record count unchanged at {len(expenses_second)}. No duplicates created!")

print("\nSeeding & persistence test passed cleanly! ")
