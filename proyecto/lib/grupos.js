import { readDB, writeDB } from "./db.js";
import { v4 as uuidv4 } from "uuid"; //para gerar ID unicos

//Obtiene TODOS los grupos
export async function getAllGrupos() {
  const db = await readDB();
  return db.grupos; // devuelve el array de grupos
}

//Obtener 1 grupo por id -> busca el grupo del id, y si no existe null
export async function getGrupoById(id) {
  const db = await readDB();
  return db.grupos.find((g) => g.id === id) || null;
}

//Crear un grupo nuevo
//data = { nombre, monedaBase, integrantes }
export async function addGrupo(data) {
  const db = await readDB();

  const nuevoGrupo = {
    id: uuidv4(),              // generamos ID único
    nombre: data.nombre,
    monedaBase: data.monedaBase || "ARS",
    integrantes: data.integrantes || [],
    gastos: [],
    creadoEn: Date.now(),
  };

  db.grupos.push(nuevoGrupo);
  await writeDB(db);
//guarda y devuelve el nuevo grupo
  return nuevoGrupo;
}

//Actualiza los datos de un grupo (lo que se envia por param datos)
export async function updateGrupo(id, datos) {
  const db = await readDB();

  const index = db.grupos.findIndex((g) => g.id === id);
  if (index === -1) return null;

  db.grupos[index] = {
    ...db.grupos[index],
    ...datos, // merge
  };

  await writeDB(db);
  return db.grupos[index];
}

//Eliminar un grupo
export async function deleteGrupo(id) {
  const db = await readDB();
  const nuevoArray = db.grupos.filter((g) => g.id !== id);

  const eliminado = nuevoArray.length !== db.grupos.length;

  db.grupos = nuevoArray;
  await writeDB(db);

  return eliminado; //Va a devolver true su elimino - false si no exitia 
}

//Agregar un gasto a un grupo
export async function addGastoToGrupo(idGrupo, gastoData) {
  const db = await readDB();

  const grupo = db.grupos.find((g) => g.id === idGrupo);
  if (!grupo) return null; //si el grupo no existe retorna null

  const nuevoGasto = {
    id: uuidv4(),
    descripcion: gastoData.descripcion,
    monto: gastoData.monto,
    moneda: gastoData.moneda,
    pagador: gastoData.pagador,
    participantes: gastoData.participantes,
    categoria: gastoData.categoria || "General",
    fecha: Date.now(),
  };

  grupo.gastos.push(nuevoGasto);

  await writeDB(db);
  return nuevoGasto;
}