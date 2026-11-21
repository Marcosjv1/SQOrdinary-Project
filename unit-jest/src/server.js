const express = require('express');
const path = require('path');
const { randomUUID } = require('crypto');
const { readData, writeData } = require('./storage');
const {
  validateCategory,
  validateExpense,
  calculateCategorySpent,
  calculateRemainingBudget,
  isOverBudget,
  filterExpensesByDateRange,
  calculateOverallSummary,
} = require('./logic');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/categories', (req, res) => {
  const category = { id: randomUUID(), name: req.body.name, limit: req.body.limit };
  if (!validateCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const data = readData();
  data.categories.push(category);
  writeData(data);
  res.status(201).json(category);
});

app.get('/api/categories', (req, res) => {
  const data = readData();
  const result = data.categories.map((c) => ({
    ...c,
    spent: calculateCategorySpent(c.id, data.expenses),
    remaining: calculateRemainingBudget(c, data.expenses),
    overBudget: isOverBudget(c, data.expenses),
  }));
  res.json(result);
});

app.get('/api/categories/:id', (req, res) => {
  const data = readData();
  const category = data.categories.find((c) => c.id === req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json({
    ...category,
    spent: calculateCategorySpent(category.id, data.expenses),
    remaining: calculateRemainingBudget(category, data.expenses),
    overBudget: isOverBudget(category, data.expenses),
  });
});

app.put('/api/categories/:id', (req, res) => {
  const data = readData();
  const category = data.categories.find((c) => c.id === req.params.id);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  const updated = {
    ...category,
    name: req.body.name ?? category.name,
    limit: req.body.limit ?? category.limit,
  };
  if (!validateCategory(updated)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  Object.assign(category, updated);
  writeData(data);
  res.json(category);
});

app.delete('/api/categories/:id', (req, res) => {
  const data = readData();
  const index = data.categories.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  data.categories.splice(index, 1);
  data.expenses = data.expenses.filter((e) => e.categoryId !== req.params.id);
  writeData(data);
  res.status(204).send();
});

app.post('/api/expenses', (req, res) => {
  const expense = {
    id: randomUUID(),
    amount: req.body.amount,
    categoryId: req.body.categoryId,
    description: req.body.description,
    date: req.body.date,
  };
  if (!validateExpense(expense)) {
    return res.status(400).json({ error: 'Invalid expense' });
  }
  const data = readData();
  const categoryExists = data.categories.some((c) => c.id === expense.categoryId);
  if (!categoryExists) {
    return res.status(400).json({ error: 'Category does not exist' });
  }
  data.expenses.push(expense);
  writeData(data);
  res.status(201).json(expense);
});

app.get('/api/expenses', (req, res) => {
  const data = readData();
  let expenses = data.expenses;
  if (req.query.category) {
    expenses = expenses.filter((e) => e.categoryId === req.query.category);
  }
  if (req.query.from || req.query.to) {
    expenses = filterExpensesByDateRange(expenses, req.query.from, req.query.to);
  }
  res.json(expenses);
});

app.get('/api/expenses/:id', (req, res) => {
  const data = readData();
  const expense = data.expenses.find((e) => e.id === req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  res.json(expense);
});

app.put('/api/expenses/:id', (req, res) => {
  const data = readData();
  const expense = data.expenses.find((e) => e.id === req.params.id);
  if (!expense) return res.status(404).json({ error: 'Expense not found' });
  const updated = { ...expense, ...req.body };
  if (!validateExpense(updated)) {
    return res.status(400).json({ error: 'Invalid expense' });
  }
  Object.assign(expense, updated);
  writeData(data);
  res.json(expense);
});

app.delete('/api/expenses/:id', (req, res) => {
  const data = readData();
  const index = data.expenses.findIndex((e) => e.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Expense not found' });
  data.expenses.splice(index, 1);
  writeData(data);
  res.status(204).send();
});

app.get('/api/summary', (req, res) => {
  const data = readData();
  const summary = calculateOverallSummary(data.categories, data.expenses, req.query.month);
  res.json(summary);
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
