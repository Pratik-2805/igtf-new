import sys
import sqlite3
import os

# Set output to UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        # Fallback for older python versions if any
        pass

def search_email_in_db(db_path, email):
    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]

    matches = []

    for table in tables:
        # Get columns for each table
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [row[1] for row in cursor.fetchall()]
        
        for column in columns:
            try:
                # Search for the email in each column
                query = f"SELECT * FROM {table} WHERE \"{column}\" LIKE ?"
                cursor.execute(query, (f"%{email}%",))
                rows = cursor.fetchall()
                if rows:
                    for row in rows:
                        matches.append({
                            "table": table,
                            "column": column,
                            "row_data": row
                        })
            except sqlite3.Error:
                pass

    conn.close()
    return matches

if __name__ == "__main__":
    db_file = r"c:\Users\Sitarahub\Downloads\backend\backend\db.sqlite3"
    target_email = "pradhanpratik219@gmail.com"
    results = search_email_in_db(db_file, target_email)

    if results:
        print(f"Found matches for '{target_email}':")
        for match in results:
            print(f"Table: {match['table']}, Column: {match['column']}")
            print(f"Data: {match['row_data']}")
            print("-" * 20)
    else:
        print(f"No matches found for '{target_email}'.")
