import sqlite3

def check_ayaa():
    db_path = 'db.sqlite3'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT id, company_name, status FROM api_exhibitorregistration WHERE company_name = ?', ('Ayaa Franchisor',))
    row = cursor.fetchone()
    print(f"Result: {row}")
    conn.close()

if __name__ == "__main__":
    check_ayaa()
