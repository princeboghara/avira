import csv
import psycopg2
import os

# Read database URL from .env
env_file = r'D:\aviracare\avira\.env.local' if os.path.exists(r'D:\aviracare\avira\.env.local') else r'D:\aviracare\avira\.env'
with open(env_file, 'r', encoding='utf-8') as f:
    for line in f:
        if line.strip().startswith('DATABASE_URL'):
            db_url = line.split('=', 1)[1].strip().strip('"').strip("'")
            break

conn = psycopg2.connect(db_url)
cur = conn.cursor()

csv_path = r'D:\aviracare\avira\scripts\aviralifecare_master_all_details.csv'
updated = 0

with open(csv_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
    reader = csv.DictReader(f)
    for row in reader:
        m_id = (row.get('Member ID') or '').strip().upper()
        j_date = (row.get('Joining Date') or '').strip()
        if m_id and m_id.startswith('AV') and j_date and j_date != '-':
            cur.execute("UPDATE users SET joined_date = %s WHERE UPPER(member_id) = %s", (j_date, m_id))
            updated += 1

conn.commit()
print(f"Successfully updated real Joining Dates for {updated} members!")

cur.execute("SELECT member_id, full_name, joined_date FROM users WHERE member_id IN ('AV0001', 'AV43341', 'AV72516')")
print(cur.fetchall())

cur.close()
conn.close()
