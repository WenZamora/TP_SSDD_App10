import { promises as fs } from "fs";
import path from "path";

//Rutas de archivos
const DB_PATH = path.join(process.cwd(), "src", "app", "data", "db.json");
const TMP_PATH = path.join(process.cwd(), "src", "app", "data", "db.json.tmp");

/**
 * Validates the database structure
 * Expected schema: { groups: [], users: [] }
 */
function validateDBShape(db) {
  if (!db || typeof db !== "object") return false;
  if (!Array.isArray(db.groups)) return false;
  if (!Array.isArray(db.users)) return false;
  return true;
}

/**
 * Ensures the database file exists and has valid structure
 * Creates a new database with initial schema if it doesn't exist or is invalid
 */
export async function ensureDBExists() {
  try {
    await fs.access(DB_PATH);
    // existe -> validar estructura
    const content = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(content || "{}"); // si está vacío -> parsea a {}
    if (!validateDBShape(parsed)) {// si no es valido
      throw new Error("db.json tiene forma inesperada");
    }
  } catch (err) { //no existe -> se crea
    const initial = {
      groups: [],
      users: []
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

/**
 * Reads the entire database
 * @returns {Promise<Object>} Database object with groups and users
 */
export async function readDB() {
  await ensureDBExists();
  const txt = await fs.readFile(DB_PATH, "utf8");
  //si existe ->
  try {
    return JSON.parse(txt); //convierte a objeto

  } catch (err) {// si está corrupto, se reinicia o se puede cambiar para que lance un error 
    const initial = { groups: [], users: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

/**
 * Writes to the database atomically
 * Uses a temporary file to prevent corruption during writes
 * @param {Object} dbObj - The complete database object to write
 */
export async function writeDB(dbObj) {
    //escribe en el aechivo temporal
  const txt = JSON.stringify(dbObj, null, 2);
  await fs.writeFile(TMP_PATH, txt, "utf8");
  //cuando termina -> renombra el archivo temporal al original
  await fs.rename(TMP_PATH, DB_PATH); 
}