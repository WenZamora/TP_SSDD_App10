import { readDB, writeDB } from "./db.js";
import { v4 as uuidv4 } from "uuid";

export async function getAllContacts() {
  const db = await readDB();
  return db.contacts;
}

export async function addContact(name, email, phone) {
  const db = await readDB();

  const newContact = {
    id: uuidv4(),
    name,
    email,
    phone,
  };

  db.contacts.push(newContact);
  await writeDB(db);

  return newContact;
}

export async function deleteContact(contactId) {
  const db = await readDB();

  db.contacts = db.contacts.filter((c) => c.id !== contactId);
  await writeDB(db);

  return { success: true };
}
