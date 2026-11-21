function validateCategory(category) {
  if (!category || typeof category.name !== 'string' || category.name.trim().length === 0) {
    return false;
  }
  if (typeof category.limit !== 'number' || category.limit <= 0) {
    return false;
  }
  return true;
}

function validateExpense(expense) {
  if (!expense || typeof expense.amount !== 'number' || expense.amount <= 0) {
    return false;
  }
  if (!expense.categoryId || typeof expense.categoryId !== 'string') {
    return false;
  }
  if (!expense.description || expense.description.trim().length === 0) {
    return false;
  }
  if (!expense.date || isNaN(new Date(expense.date).getTime())) {
    return false;
  }
  return true;
}

function calculateCategorySpent(categoryId, expenses) {
  return expenses
    .filter((e) => e.categoryId === categoryId)
    .reduce((sum, e) => sum + e.amount, 0);
}

function calculateRemainingBudget(category, expenses) {
  const spent = calculateCategorySpent(category.id, expenses);
  return category.limit - spent;
}

function isOverBudget(category, expenses) {
  return calculateRemainingBudget(category, expenses) < 0;
}

function filterExpensesByDateRange(expenses, from, to) {
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;
  return expenses.filter((e) => {
    const d = new Date(e.date);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;
    return true;
  });
}

function calculateMonthlyTotal(expenses, month) {
  return expenses
    .filter((e) => e.date.slice(0, 7) === month)
    .reduce((sum, e) => sum + e.amount, 0);
}

function calculateOverallSummary(categories, expenses, month) {
  const scopedExpenses = month
    ? expenses.filter((e) => e.date.slice(0, 7) === month)
    : expenses;

  const totalBudget = categories.reduce((sum, c) => sum + c.limit, 0);
  const totalSpent = scopedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const percentUsed = totalBudget === 0 ? 0 : (totalSpent / totalBudget) * 100;

  const categoriesOverBudget = categories
    .filter((c) => isOverBudget(c, scopedExpenses))
    .map((c) => c.id);

  return { totalBudget, totalSpent, totalRemaining, percentUsed, categoriesOverBudget };
}

module.exports = {
  validateCategory,
  validateExpense,
  calculateCategorySpent,
  calculateRemainingBudget,
  isOverBudget,
  filterExpensesByDateRange,
  calculateMonthlyTotal,
  calculateOverallSummary,
};
