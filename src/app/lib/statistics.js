/**
 * Statistics Module
 * Provides aggregated data for charts and analytics
 */

import { getAllContacts } from "./contacts.js";

/**
 * Gets expenses grouped by person (payer)
 * @param {Object} group - Group object with expenses
 * @returns {Promise<Array>} Array of { personId, personName, totalAmount, count }
 */
export async function getExpensesByPerson(group) {
  if (!group || !group.expenses || group.expenses.length === 0) {
    return [];
  }

  // Get contact names for display
  const contacts = await getAllContacts();
  const contactMap = new Map(contacts.map(c => [c.id, c.name]));

  // Aggregate expenses by payer
  const expensesByPerson = new Map();

  group.expenses.forEach(expense => {
    const payerId = expense.payer;
    const amount = expense.convertedAmount || expense.amount;

    if (!expensesByPerson.has(payerId)) {
      expensesByPerson.set(payerId, {
        personId: payerId,
        personName: contactMap.get(payerId) || "Unknown",
        totalAmount: 0,
        count: 0,
      });
    }

    const personData = expensesByPerson.get(payerId);
    personData.totalAmount += amount;
    personData.count += 1;
  });

  // Convert to array and round amounts
  const result = Array.from(expensesByPerson.values()).map(item => ({
    ...item,
    totalAmount: Math.round(item.totalAmount * 100) / 100,
  }));

  // Sort by total amount descending
  result.sort((a, b) => b.totalAmount - a.totalAmount);

  return result;
}

/**
 * Gets expenses grouped by category
 * @param {Object} group - Group object with expenses
 * @returns {Array} Array of { category, totalAmount, count, percentage }
 */
export function getExpensesByCategory(group) {
  if (!group || !group.expenses || group.expenses.length === 0) {
    return [];
  }

  // Aggregate expenses by category
  const expensesByCategory = new Map();
  let totalAmount = 0;

  group.expenses.forEach(expense => {
    const category = expense.category || "General";
    const amount = expense.convertedAmount || expense.amount;

    if (!expensesByCategory.has(category)) {
      expensesByCategory.set(category, {
        category,
        totalAmount: 0,
        count: 0,
      });
    }

    const categoryData = expensesByCategory.get(category);
    categoryData.totalAmount += amount;
    categoryData.count += 1;
    totalAmount += amount;
  });

  // Convert to array and calculate percentages
  const result = Array.from(expensesByCategory.values()).map(item => ({
    ...item,
    totalAmount: Math.round(item.totalAmount * 100) / 100,
    percentage: totalAmount > 0 
      ? Math.round((item.totalAmount / totalAmount) * 100 * 10) / 10 
      : 0,
  }));

  // Sort by total amount descending
  result.sort((a, b) => b.totalAmount - a.totalAmount);

  return result;
}

/**
 * Gets expenses grouped by month
 * @param {Object} group - Group object with expenses
 * @returns {Array} Array of { month, year, totalAmount, count }
 */
export function getExpensesByMonth(group) {
  if (!group || !group.expenses || group.expenses.length === 0) {
    return [];
  }

  // Aggregate expenses by month
  const expensesByMonth = new Map();

  group.expenses.forEach(expense => {
    const date = new Date(expense.date || expense.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const amount = expense.convertedAmount || expense.amount;

    if (!expensesByMonth.has(monthKey)) {
      expensesByMonth.set(monthKey, {
        month: monthKey,
        year,
        monthNumber: month + 1,
        monthName: date.toLocaleString('default', { month: 'short' }),
        totalAmount: 0,
        count: 0,
      });
    }

    const monthData = expensesByMonth.get(monthKey);
    monthData.totalAmount += amount;
    monthData.count += 1;
  });

  // Convert to array and round amounts
  const result = Array.from(expensesByMonth.values()).map(item => ({
    ...item,
    totalAmount: Math.round(item.totalAmount * 100) / 100,
  }));

  // Sort by month chronologically
  result.sort((a, b) => a.month.localeCompare(b.month));

  return result;
}

/**
 * Gets total expenses for the group
 * @param {Object} group - Group object with expenses
 * @returns {Object} { total, count, average, currency }
 */
export function getTotalGroupExpenses(group) {
  if (!group || !group.expenses || group.expenses.length === 0) {
    return {
      total: 0,
      count: 0,
      average: 0,
      currency: group?.baseCurrency || "ARS",
    };
  }

  let total = 0;
  group.expenses.forEach(expense => {
    const amount = expense.convertedAmount || expense.amount;
    total += amount;
  });

  const count = group.expenses.length;
  const average = count > 0 ? total / count : 0;

  return {
    total: Math.round(total * 100) / 100,
    count,
    average: Math.round(average * 100) / 100,
    currency: group.baseCurrency || "ARS",
  };
}

/**
 * Gets expenses by date range
 * @param {Object} group - Group object with expenses
 * @param {number} startDate - Start timestamp
 * @param {number} endDate - End timestamp
 * @returns {Array} Filtered expenses
 */
export function getExpensesByDateRange(group, startDate, endDate) {
  if (!group || !group.expenses || group.expenses.length === 0) {
    return [];
  }

  return group.expenses.filter(expense => {
    const expenseDate = expense.date || expense.createdAt;
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

/**
 * Gets summary statistics for the group
 * @param {Object} group - Group object with expenses
 * @returns {Promise<Object>} Summary statistics
 */
export async function getGroupSummary(group) {
  const total = getTotalGroupExpenses(group);
  const byPerson = await getExpensesByPerson(group);
  const byCategory = getExpensesByCategory(group);
  const byMonth = getExpensesByMonth(group);

  return {
    total,
    byPerson,
    byCategory,
    byMonth,
    memberCount: group.members?.length || 0,
    expenseCount: group.expenses?.length || 0,
  };
}

