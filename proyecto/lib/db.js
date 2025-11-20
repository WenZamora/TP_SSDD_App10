import { promises as fs } from "fs";
import path from "path";

//Rutas de archivos
const DB_PATH = path.join(process.cwd(), "data", "db.json");
const TMP_PATH = path.join(process.cwd(), "data", "db.json.tmp");

// Esquema mínimo esperado.. 
function validateDBShape(db) {
  if (!db || typeof db !== "object") return false;
  if (!Array.isArray(db.grupos)) return false;
  return true;
}

//Para asegurar que exista y sea valido db.json
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
    const initial = { grupos: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

// Lectura de la base de datos
export async function readDB() {
  await ensureDBExists();
  const txt = await fs.readFile(DB_PATH, "utf8");
  //si existe ->
  try {
    return JSON.parse(txt); //convierte a objeto

  } catch (err) {// si está corrupto, se reinicia o se puede cambiar para que lance un error 
    await fs.writeFile(DB_PATH, JSON.stringify({ grupos: [] }, null, 2), "utf8");
    return { grupos: [] };
  }
}

// Escritura atomica sirve para que nunca pse que el arcchivo quede corrupto
//Para que no quede a "medias" el archivo si se interrumpe la ejecución 
export async function writeDB(dbObj) {
    //escribe en el aechivo temporal
  const txt = JSON.stringify(dbObj, null, 2);
  await fs.writeFile(TMP_PATH, txt, "utf8");
  //cuando termina -> renombra el archivo temporal al original
  await fs.rename(TMP_PATH, DB_PATH); 
}