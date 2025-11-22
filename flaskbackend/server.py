import sqlite3
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_PATH = "users.db"

@app.route("/api/user/<username>")
def get_user(username):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # makes rows behave like dicts
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cur.fetchone()

    conn.close()

    if row is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(dict(row))  # convert row to JSON

if __name__ == "__main__":
    app.run(port=4000, debug=True)
