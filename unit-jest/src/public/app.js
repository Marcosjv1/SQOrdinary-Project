const API = '/api';

async function fetchCategories() {
  const res = await fetch(`${API}/categories`);
  return res.json();
}

async function fetchExpenses() {
  const res = await fetch(`${API}/expenses`);
  return res.json();
}

async function fetchSummary(month) {
  const query = month ? `?month=${month}` : '';
  const res = await fetch(`${API}/summary${query}`);
  return res.json();
}

async function createCategory(name, limit) {
  await fetch(`${API}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, limit }),
  });
}

async function createExpense(categoryId, amount, description, date) {
  await fetch(`${API}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categoryId, amount, description, date }),
  });
}

async function deleteCategory(id) {
  await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
}

async function deleteExpense(id) {
  await fetch(`${API}/expenses/${id}`, { method: 'DELETE' });
}

async function renderCategories() {
  const categories = await fetchCategories();
  const list = document.getElementById('category-list');
  const select = document.getElementById('expense-category');
  list.innerHTML = '';
  select.innerHTML = '';

  categories.forEach((c) => {
    const li = document.createElement('li');
    li.setAttribute('data-test', 'category-item');
    li.innerHTML = `
      <span>${c.name}: $${c.spent} / $${c.limit}</span>
      ${c.overBudget ? '<span class="badge-over" data-test="over-budget-badge">Over budget</span>' : ''}
      <button data-test="delete-category-btn" data-id="${c.id}">Delete</button>
    `;
    list.appendChild(li);

    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.name;
    select.appendChild(option);
  });

  list.querySelectorAll('[data-test="delete-category-btn"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await deleteCategory(btn.dataset.id);
      await refresh();
    });
  });
}

async function renderExpenses() {
  const expenses = await fetchExpenses();
  const categories = await fetchCategories();
  const list = document.getElementById('expense-list');
  list.innerHTML = '';

  expenses.forEach((e) => {
    const category = categories.find((c) => c.id === e.categoryId);
    const li = document.createElement('li');
    li.setAttribute('data-test', 'expense-item');
    li.innerHTML = `
      <span>${e.description} - $${e.amount} (${category ? category.name : 'Unknown'}) - ${e.date}</span>
      <button data-test="delete-expense-btn" data-id="${e.id}">Delete</button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll('[data-test="delete-expense-btn"]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await deleteExpense(btn.dataset.id);
      await refresh();
    });
  });
}

async function renderSummary() {
  const month = document.getElementById('summary-month').value;
  const summary = await fetchSummary(month);
  document.getElementById('summary-total-budget').textContent = summary.totalBudget;
  document.getElementById('summary-total-spent').textContent = summary.totalSpent;
  document.getElementById('summary-total-remaining').textContent = summary.totalRemaining;
  const fill = document.getElementById('summary-progress-fill');
  fill.style.width = `${Math.min(summary.percentUsed, 100)}%`;
}

async function refresh() {
  await renderCategories();
  await renderExpenses();
  await renderSummary();
}

document.getElementById('category-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const name = document.getElementById('category-name').value;
  const limit = parseFloat(document.getElementById('category-limit').value);
  await createCategory(name, limit);
  document.getElementById('category-form').reset();
  await refresh();
});

document.getElementById('expense-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const categoryId = document.getElementById('expense-category').value;
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const description = document.getElementById('expense-description').value;
  const date = document.getElementById('expense-date').value;
  await createExpense(categoryId, amount, description, date);
  document.getElementById('expense-form').reset();
  await refresh();
});

document.getElementById('summary-month').addEventListener('change', renderSummary);

refresh();
