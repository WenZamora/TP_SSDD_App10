import { readDB, writeDB } from "./db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Gets all contacts from the database
 * @returns {Promise<Array>} Array of all contacts
 */
export async function getAllContacts() {
  const db = await readDB();
  return db.contacts || [];
}

/**
 * Gets a single contact by ID
 * @param {string} id - Contact ID
 * @returns {Promise<Object|null>} Contact object or null if not found
 */
export async function getContactById(id) {
  const db = await readDB();
  return db.contacts.find((c) => c.id === id) || null;
}

/**
 * Creates a new contact
 * @param {string} name - Contact name
 * @param {string} email - Contact email
 * @returns {Promise<Object>} The created contact
 */
export async function addContact(name, email) {
  const db = await readDB();

  const newContact = {
    id: uuidv4(),
    name,
    email,
    avatar: "",
    createdAt: Date.now(),
  };

  db.contacts.push(newContact);
  await writeDB(db);

  return newContact;
}

/**
 * Updates a contact's data
 * @param {string} id - Contact ID
 * @param {Object} data - Data to update { name?, email?, avatar? }
 * @returns {Promise<Object|null>} Updated contact or null if not found
 */
export async function updateContact(id, data) {
  const db = await readDB();
  
  const index = db.contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  
  db.contacts[index] = {
    ...db.contacts[index],
    ...data,
  };
  
  await writeDB(db);
  return db.contacts[index];
}

/**
 * Deletes a contact
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Success status
 * @throws {Error} If contact is a member of any group
 */
export async function deleteContact(contactId) {
  const db = await readDB();

  // Check if contact is used in any group
  const isUsedInGroup = db.groups.some((group) =>
    group.members && group.members.includes(contactId)
  );

  if (isUsedInGroup) {
    throw new Error("Cannot delete contact: contact is a member of one or more groups");
  }

  const initialLength = db.contacts.length;
  db.contacts = db.contacts.filter((c) => c.id !== contactId);
  
  const deleted = db.contacts.length !== initialLength;
  
  if (!deleted) {
    throw new Error("Contact not found");
  }

  await writeDB(db);

  return { success: true };
}
