import csv
import json

file_path = r"C:\Users\pc\Desktop\aviralifecare_master_orders_779_2026-08-28.csv"

with open(file_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

print(f"Total Rows Parsed: {len(rows)}")
print("Columns:", reader.fieldnames)
print("\nSample Row 1:")
for k, v in rows[0].items():
    print(f"  {k}: {v}")

print("\nSample Row 2:")
for k, v in rows[1].items():
    print(f"  {k}: {v}")

print("\nSample Row 779 (Last Row):")
for k, v in rows[-1].items():
    print(f"  {k}: {v}")
