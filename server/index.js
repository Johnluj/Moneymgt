require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const db = new sqlite3.Database('./server/pocketplan.db');

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const id = uuidv4();

  db.run(
    'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
    [id, name, email, hashedPassword],
    (err) => {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      const token = jwt.sign({ id, name, email }, JWT_SECRET);
      res.json({ token, user: { id, name, email } });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});

// Transactions
app.get('/api/transactions', authenticateToken, (req, res) => {
  db.all('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions', authenticateToken, (req, res) => {
  const { amount, category, date, note, type } = req.body;
  const id = uuidv4();

  db.run(
    'INSERT INTO transactions (id, user_id, amount, category, date, note, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, req.user.id, amount, category, date, note, type],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id, amount, category, date, note, type });
    }
  );
});

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.sendStatus(204);
  });
});

// Budgets
app.get('/api/budgets', authenticateToken, (req, res) => {
  db.all('SELECT category, limit_amount as "limit" FROM budgets WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/budgets', authenticateToken, (req, res) => {
  const { category, limit } = req.body;
  db.run(
    'INSERT INTO budgets (user_id, category, limit_amount) VALUES (?, ?, ?) ON CONFLICT(user_id, category) DO UPDATE SET limit_amount = ?',
    [req.user.id, category, limit, limit],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ category, limit });
    }
  );
});

// Savings Goals
app.get('/api/savings-goals', authenticateToken, (req, res) => {
  db.all('SELECT id, name, target_amount as targetAmount, current_amount as currentAmount FROM savings_goals WHERE user_id = ?', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/savings-goals', authenticateToken, (req, res) => {
  const { name, targetAmount, currentAmount } = req.body;
  const id = uuidv4();
  db.run(
    'INSERT INTO savings_goals (id, user_id, name, target_amount, current_amount) VALUES (?, ?, ?, ?, ?)',
    [id, req.user.id, name, targetAmount, currentAmount || 0],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id, name, targetAmount, currentAmount });
    }
  );
});

app.patch('/api/savings-goals/:id', authenticateToken, (req, res) => {
  const { currentAmount } = req.body;
  db.run(
    'UPDATE savings_goals SET current_amount = ? WHERE id = ? AND user_id = ?',
    [currentAmount, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.sendStatus(204);
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
