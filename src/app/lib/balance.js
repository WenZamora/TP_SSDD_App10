/**
 * Balance Calculation Module
 * Calculates member balances and settlement suggestions for expense groups
 */

import { getGroupById } from "./groups.js";
import { getAllContacts } from "./contacts.js";

/**
 * Calculates balances for all members in a group
 * @param {Object} group - Group object with expenses
 * @returns {Promise<Array>} Array of balance objects for each member
 */
export async function calculateBalances(group) {
  if (!group || !group.expenses || group.expenses.length === 0) {
    // If no expenses, all members have zero balance
    return group.members.map(memberId => ({
      memberId,
      memberName: "Unknown",
      totalPaid: 0,
      totalShare: 0,
      balance: 0,
    }));
  }

  // Get contact names for display
  const contacts = await getAllContacts();
  const contactMap = new Map(contacts.map(c => [c.id, c.name]));

  // Initialize balances for each member
  const balances = new Map();
  group.members.forEach(memberId => {
    balances.set(memberId, {
      memberId,
      memberName: contactMap.get(memberId) || "Unknown",
      totalPaid: 0,
      totalShare: 0,
      balance: 0,
    });
  });

  // Calculate totals for each member
  group.expenses.forEach(expense => {
    // Use convertedAmount (already in group's base currency)
    const amount = expense.convertedAmount || expense.amount;
    
    // Add to payer's totalPaid
    if (balances.has(expense.payer)) {
      const payerBalance = balances.get(expense.payer);
      payerBalance.totalPaid += amount;
    }

    // Divide expense equally among participants
    const participants = expense.participants || [];
    if (participants.length > 0) {
      const sharePerPerson = amount / participants.length;
      
      participants.forEach(participantId => {
        if (balances.has(participantId)) {
          const participantBalance = balances.get(participantId);
          participantBalance.totalShare += sharePerPerson;
        }
      });
    }
  });

  // Calculate final balance for each member (totalPaid - totalShare)
  balances.forEach(balance => {
    balance.balance = balance.totalPaid - balance.totalShare;
    // Round to 2 decimal places
    balance.totalPaid = Math.round(balance.totalPaid * 100) / 100;
    balance.totalShare = Math.round(balance.totalShare * 100) / 100;
    balance.balance = Math.round(balance.balance * 100) / 100;
  });

  return Array.from(balances.values());
}

/**
 * Calculates settlement suggestions using greedy algorithm
 * Minimizes the number of transactions needed to settle all debts
 * @param {Array} balances - Array of balance objects from calculateBalances
 * @returns {Array} Array of settlement objects { from, fromName, to, toName, amount }
 */
export function calculateSettlements(balances) {
  if (!balances || balances.length === 0) {
    return [];
  }

  // Separate creditors (balance > 0) and debtors (balance < 0)
  const creditors = balances
    .filter(b => b.balance > 0.01) // Ignore tiny amounts due to rounding
    .map(b => ({ ...b })) // Clone to avoid modifying original
    .sort((a, b) => b.balance - a.balance); // Sort descending

  const debtors = balances
    .filter(b => b.balance < -0.01) // Ignore tiny amounts due to rounding
    .map(b => ({ ...b, balance: -b.balance })) // Make balance positive for easier math
    .sort((a, b) => b.balance - a.balance); // Sort descending

  const settlements = [];

  // Use greedy algorithm to minimize transactions
  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    // Determine payment amount (minimum of what debtor owes and what creditor is owed)
    const paymentAmount = Math.min(creditor.balance, debtor.balance);

    if (paymentAmount > 0.01) { // Ignore tiny amounts
      settlements.push({
        from: debtor.memberId,
        fromName: debtor.memberName,
        to: creditor.memberId,
        toName: creditor.memberName,
        amount: Math.round(paymentAmount * 100) / 100,
      });
    }

    // Update balances
    creditor.balance -= paymentAmount;
    debtor.balance -= paymentAmount;

    // Move to next creditor/debtor if current one is settled
    if (creditor.balance < 0.01) i++;
    if (debtor.balance < 0.01) j++;
  }

  return settlements;
}

/**
 * Gets complete balance summary for a group
 * Combines balance calculation and settlement suggestions
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} { balances: Balance[], settlements: Settlement[] }
 */
export async function getGroupBalanceSummary(groupId) {
  const group = await getGroupById(groupId);
  
  if (!group) {
    throw new Error("Group not found");
  }

  const balances = await calculateBalances(group);
  const settlements = calculateSettlements(balances);

  return {
    balances,
    settlements,
  };
}

