import sqlite3

def remove_ayaa():
    db_path = 'db.sqlite3'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM api_exhibitorregistration WHERE company_name = ?', ('Ayaa Franchisor',))
    print(f"Deleted {cursor.rowcount} rows.")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    remove_ayaa()
