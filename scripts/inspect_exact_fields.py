import csv

with open(r"C:\Users\pc\Desktop\aviralifecare_master_orders_779_2026-08-28.csv", "r", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    print("Fieldnames in CSV:", reader.fieldnames)
    for i, r in enumerate(reader):
        if i < 3:
            print(f"\n--- ROW {i+1} ---")
            for k, v in r.items():
                print(f"  {k} => {v}")
