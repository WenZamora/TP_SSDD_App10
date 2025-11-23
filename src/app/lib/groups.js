import { readDB, writeDB } from "./db.js";
import { v4 as uuidv4 } from "uuid"; //para gerar ID unicos

/**
 * Gets all groups from the database, optionally filtered by user membership
 * @param {string} [userId] - Optional user ID to filter groups by membership
 * @returns {Promise<Array>} Array of all groups (filtered if userId provided)
 */
export async function getAllGroups(userId) {
  const db = await readDB();
  
  // If userId is provided, filter groups to only those where user is a member
  if (userId) {
    return db.groups.filter(group => 
      group.members && group.members.includes(userId)
    );
  }
  
  return db.groups; // devuelve el array de grupos
}

/**
 * Gets a single group by ID
 * @param {string} id - The group ID
 * @returns {Promise<Object|null>} Group object or null if not found
 */
export async function getGroupById(id) {
  const db = await readDB();
  return db.groups.find((g) => g.id === id) || null;
}

/**
 * Creates a new group
 * @param {Object} data - Group data { name, baseCurrency, members, description }
 * @param {string} creatorUserId - ID of the user creating the group
 * @returns {Promise<Object>} The created group
 * @throws {Error} If creator not found or members are not in creator's contacts
 */
export async function addGroup(data, creatorUserId) {
  const db = await readDB();

  // Find the creator user
  const creator = db.users.find(u => u.id === creatorUserId);
  if (!creator) {
    throw new Error("Creator user not found");
  }

  // Validate that all members are in the creator's contact list (or the creator themselves)
  if (data.members && data.members.length > 0) {
    const allowedMemberIds = [...creator.contacts, creatorUserId]; // Creator can add themselves
    const invalidMembers = data.members.filter(m => !allowedMemberIds.includes(m));
    if (invalidMembers.length > 0) {
      throw new Error(`Some members are not in your contact list. Add them as contacts first.`);
    }
  }

  const now = Date.now();
  const newGroup = {
    id: uuidv4(),                   // generamos ID único
    name: data.name,
    description: data.description || "",
    baseCurrency: data.baseCurrency || "ARS",
    members: data.members || [],
    expenses: [],
    createdAt: now,
    updatedAt: now,
  };

  db.groups.push(newGroup);
  await writeDB(db);
//guarda y devuelve el nuevo grupo
  return newGroup;
}

/**
 * Updates a group's data
 * @param {string} id - Group ID
 * @param {Object} updatedData - Data to update
 * @param {string} updaterUserId - ID of the user updating the group
 * @returns {Promise<Object|null>} Updated group or null if not found
 * @throws {Error} If updater not found or new members are not in updater's contacts
 */
export async function updateGroup(id, updatedData, updaterUserId) {
  const db = await readDB();

  const index = db.groups.findIndex((g) => g.id === id);
  if (index === -1) return null;

  // Validate members if they're being updated
  if (updatedData.members && updatedData.members.length > 0) {
    // Find the updater user
    const updater = db.users.find(u => u.id === updaterUserId);
    if (!updater) {
      throw new Error("Updater user not found");
    }

    // Validate that all NEW members are in the updater's contact list
    const currentMembers = db.groups[index].members || [];
    const newMembers = updatedData.members.filter(m => !currentMembers.includes(m));
    
    if (newMembers.length > 0) {
      const allowedMemberIds = [...updater.contacts, updaterUserId];
      const invalidMembers = newMembers.filter(m => !allowedMemberIds.includes(m));
      if (invalidMembers.length > 0) {
        throw new Error(`Some members are not in your contact list. Add them as contacts first.`);
      }
    }
  }

  db.groups[index] = {
    ...db.groups[index],
    ...updatedData, // merge
    updatedAt: Date.now(), // Always update timestamp
  };

  await writeDB(db);
  return db.groups[index];
}

/**
 * Deletes a group
 * @param {string} id - Group ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteGroup(id) {
  const db = await readDB();
  const filtered  = db.groups.filter((g) => g.id !== id);

  const deleted  = filtered .length !== db.groups.length;

  db.groups = filtered;
  await writeDB(db);

  return deleted ; //Va a devolver true su elimino - false si no exitia 
}

/**
 * Adds an expense to a group
 * @param {string} groupId - Group ID
 * @param {Object} expenseData - Expense data { description, amount, currency, convertedAmount, payer, category, date }
 * @returns {Promise<Object|null>} Created expense or null if group not found
 */
export async function addExpenseToGroup(groupId, expenseData) {
  const db = await readDB();

  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null; // si el grupo no existe retorna null

  const now = Date.now();
  const newExpense = {
    id: uuidv4(),
    description: expenseData.description,
    amount: expenseData.amount,
    currency: expenseData.currency || group.baseCurrency,
    convertedAmount: expenseData.convertedAmount || expenseData.amount,
    payer: expenseData.payer,
    category: expenseData.category || 'Other',
    date: expenseData.date || now,
    createdAt: now,
    updatedAt: now,
  };

  group.expenses.push(newExpense);
  
  // Update group's updatedAt
  group.updatedAt = now;

  await writeDB(db);
  return newExpense;
}

/**
 * Gets all expenses for a group
 * @param {string} groupId - Group ID
 * @returns {Promise<Array|null>} Array of expenses or null if group not found
 */
export async function getGroupExpenses(groupId) {
  const db = await readDB();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null;
  return group.expenses || [];
}

/**
 * Updates an expense in a group
 * @param {string} groupId - Group ID
 * @param {string} expenseId - Expense ID
 * @param {Object} updatedData - Data to update { description?, amount?, currency?, convertedAmount?, payer?, category?, date? }
 * @returns {Promise<Object|null>} Updated expense or null if not found
 */
export async function updateExpense(groupId, expenseId, updatedData) {
  const db = await readDB();
  
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null;
  
  const expenseIndex = group.expenses.findIndex((e) => e.id === expenseId);
  if (expenseIndex === -1) return null;
  
  const now = Date.now();
  // Merge updated data with existing expense
  group.expenses[expenseIndex] = {
    ...group.expenses[expenseIndex],
    ...updatedData,
    updatedAt: now,
  };
  
  // Update group's updatedAt
  group.updatedAt = now;
  
  await writeDB(db);
  return group.expenses[expenseIndex];
}

/**
 * Deletes an expense from a group
 * @param {string} groupId - Group ID
 * @param {string} expenseId - Expense ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteExpense(groupId, expenseId) {
  const db = await readDB();
  
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return false;
  
  const initialLength = group.expenses.length;
  group.expenses = group.expenses.filter((e) => e.id !== expenseId);
  
  const deleted = group.expenses.length !== initialLength;
  
  if (deleted) {
    // Update group's updatedAt
    group.updatedAt = Date.now();
    await writeDB(db);
  }
  
  return deleted;
}