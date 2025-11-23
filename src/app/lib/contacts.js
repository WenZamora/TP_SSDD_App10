import { readDB, writeDB } from "./db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Gets all users from the database
 * @returns {Promise<Array>} Array of all users
 */
export async function getAllUsers() {
  const db = await readDB();
  return db.users || [];
}

/**
 * Gets a single user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(id) {
  const db = await readDB();
  return db.users.find((u) => u.id === id) || null;
}

/**
 * Gets contacts for a specific user (returns full user objects for contact IDs)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of contact objects
 */
export async function getUserContacts(userId) {
  const db = await readDB();
  const user = db.users.find((u) => u.id === userId);
  
  if (!user) {
    return [];
  }
  
  // Get full user objects for each contact ID
  const contacts = db.users.filter((u) => user.contacts.includes(u.id));
  
  // Return contacts without their contacts array to avoid deep nesting
  return contacts.map(({ contacts: _, ...contact }) => contact);
}

/**
 * Gets all contacts from the database (for backwards compatibility)
 * This returns all users for scenarios where all users need to be visible
 * @returns {Promise<Array>} Array of all users as contacts
 */
export async function getAllContacts() {
  const db = await readDB();
  // Return users without their contacts array for backwards compatibility
  return (db.users || []).map(({ contacts, ...user }) => user);
}

/**
 * Gets a single contact by ID (for backwards compatibility)
 * @param {string} id - Contact ID
 * @returns {Promise<Object|null>} Contact object or null if not found
 */
export async function getContactById(id) {
  const db = await readDB();
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;
  
  // Return without contacts array
  const { contacts, ...contact } = user;
  return contact;
}

/**
 * Creates a new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} avatar - User avatar URL (optional)
 * @returns {Promise<Object>} The created user
 */
export async function addUser(name, email, avatar = "") {
  const db = await readDB();

  const newUser = {
    id: uuidv4(),
    name,
    email,
    avatar,
    contacts: [],
    createdAt: Date.now(),
  };

  db.users.push(newUser);
  await writeDB(db);

  return newUser;
}

/**
 * Creates a new contact (for backwards compatibility - creates a user)
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @returns {Promise<Object>} The created contact
 */
export async function addContact(name, email) {
  return await addUser(name, email);
}

/**
 * Adds a contact to a user's contact list
 * @param {string} userId - User ID
 * @param {string} contactId - Contact (user) ID to add
 * @returns {Promise<Object|null>} Updated user or null if not found
 * @throws {Error} If trying to add self as contact or contact doesn't exist
 */
export async function addContactToUser(userId, contactId) {
  const db = await readDB();
  
  // Check if user exists
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  
  // Check if contact exists
  const contactExists = db.users.some((u) => u.id === contactId);
  if (!contactExists) {
    throw new Error("Contact user not found");
  }
  
  // Check if trying to add self
  if (userId === contactId) {
    throw new Error("Cannot add yourself as a contact");
  }
  
  // Check if already a contact
  if (db.users[userIndex].contacts.includes(contactId)) {
    throw new Error("Contact already exists");
  }
  
  // Add contact
  db.users[userIndex].contacts.push(contactId);
  
  await writeDB(db);
  return db.users[userIndex];
}

/**
 * Removes a contact from a user's contact list
 * @param {string} userId - User ID
 * @param {string} contactId - Contact ID to remove
 * @returns {Promise<Object|null>} Updated user or null if not found
 */
export async function removeContactFromUser(userId, contactId) {
  const db = await readDB();
  
  console.log('[removeContactFromUser] Before removal:', { 
    userId, 
    contactId, 
    currentContacts: db.users.find(u => u.id === userId)?.contacts 
  });
  
  const userIndex = db.users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    console.log('[removeContactFromUser] User not found');
    return null;
  }
  
  // Remove contact
  const contactsBefore = [...db.users[userIndex].contacts];
  db.users[userIndex].contacts = db.users[userIndex].contacts.filter(
    (id) => id !== contactId
  );
  
  console.log('[removeContactFromUser] After removal:', { 
    contactsBefore,
    contactsAfter: db.users[userIndex].contacts,
    removed: contactsBefore.length - db.users[userIndex].contacts.length
  });
  
  await writeDB(db);
  console.log('[removeContactFromUser] Database written successfully');
  return db.users[userIndex];
}

/**
 * Updates a user's data
 * @param {string} id - User ID
 * @param {Object} data - Data to update { name?, email?, avatar? }
 * @returns {Promise<Object|null>} Updated user or null if not found
 */
export async function updateUser(id, data) {
  const db = await readDB();
  
  const index = db.users.findIndex((u) => u.id === id);
  if (index === -1) return null;
  
  // Don't allow updating contacts array through this method
  const { contacts, ...updateData } = data;
  
  db.users[index] = {
    ...db.users[index],
    ...updateData,
  };
  
  await writeDB(db);
  return db.users[index];
}

/**
 * Updates a contact's data (for backwards compatibility)
 * @param {string} id - Contact ID
 * @param {Object} data - Data to update { name?, email?, avatar? }
 * @returns {Promise<Object|null>} Updated contact or null if not found
 */
export async function updateContact(id, data) {
  return await updateUser(id, data);
}

/**
 * Deletes a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success status
 * @throws {Error} If user is a member of any group
 */
export async function deleteUser(userId) {
  const db = await readDB();

  // Check if user is used in any group
  const isUsedInGroup = db.groups.some((group) =>
    group.members && group.members.includes(userId)
  );

  if (isUsedInGroup) {
    throw new Error("Cannot delete user: user is a member of one or more groups");
  }

  const initialLength = db.users.length;
  
  // Remove user from everyone's contact list
  db.users.forEach((user) => {
    user.contacts = user.contacts.filter((id) => id !== userId);
  });
  
  // Delete the user
  db.users = db.users.filter((u) => u.id !== userId);
  
  const deleted = db.users.length !== initialLength;
  
  if (!deleted) {
    throw new Error("User not found");
  }

  await writeDB(db);

  return { success: true };
}

/**
 * Deletes a contact (for backwards compatibility)
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Success status
 * @throws {Error} If contact is a member of any group
 */
export async function deleteContact(contactId) {
  return await deleteUser(contactId);
}
