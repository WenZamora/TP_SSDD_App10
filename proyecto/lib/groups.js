import { readDB, writeDB } from "./db.js";
import { v4 as uuidv4 } from "uuid"; //para gerar ID unicos

//Obtiene TODOS los grupos
export async function getAllGroups() {
  const db = await readDB();
  return db.groups; // devuelve el array de grupos
}

//Obtener 1 grupo por id -> busca el grupo del id, y si no existe null
export async function getGroupById(id) {
  const db = await readDB();
  return db.groups.find((g) => g.id === id) || null;
}

//Crear un grupo nuevo
//data = { nombre, monedaBase, integrantes }
export async function addGroup(data) {
  const db = await readDB();

  const newGroup = {
    id: uuidv4(),                   // generamos ID único
    name: data.name,
    baseCurrency: data.baseCurrency || "ARS",
    members: data.members || [],
    expenses: [],
    createdAt: Date.now(),
  };

  db.groups.push(newGroup);
  await writeDB(db);
//guarda y devuelve el nuevo grupo
  return newGroup;
}

//Actualiza los datos de un grupo (lo que se envia por param datos)
export async function updateGroup(id, updatedData) {
  const db = await readDB();

  const index = db.groups.findIndex((g) => g.id === id);
  if (index === -1) return null;

  db.groups[index] = {
    ...db.groups[index],
    ...updatedData, // merge
  };

  await writeDB(db);
  return db.groups[index];
}

//Eliminar un grupo
export async function deleteGroup(id) {
  const db = await readDB();
  const filtered  = db.groups.filter((g) => g.id !== id);

  const deleted  = filtered .length !== db.groups.length;

  db.groups = filtered;
  await writeDB(db);

  return deleted ; //Va a devolver true su elimino - false si no exitia 
}

//Agregar un gasto a un grupo
export async function addExpenseToGroup(groupId, expenseData) {
  const db = await readDB();

  const group = db.groups.find((g) => g.id === groupId);
  if (!group) return null; // si el grupo no existe retorna null

  const newExpense = {
    id: uuidv4(),
    description: expenseData.description,
    amount: expenseData.amount,
    currency: expenseData.currency,
    payer: expenseData.payer,
    participants: expenseData.participants,
    category: expenseData.category || "General",
    date: Date.now(),
  };

  group.expenses.push(newExpense);

  await writeDB(db);
  return newExpense;
}