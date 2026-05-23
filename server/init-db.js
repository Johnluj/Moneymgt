const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'pocketplan.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    type TEXT CHECK(type IN ('income', 'expense')),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Budgets table
  db.run(`CREATE TABLE IF NOT EXISTS budgets (
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    limit_amount REAL NOT NULL,
    PRIMARY KEY (user_id, category),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Savings Goals table
  db.run(`CREATE TABLE IF NOT EXISTS savings_goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

console.log('Database initialized at', dbPath);
db.close();
