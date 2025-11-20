// client componente -> para manejaar formulario y feych!!
'use client';

import { useEffect, useState } from "react";

interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  moneda: string;
  pagador: string;
  participantes: string[];
  categoria: string;
  fecha: number;
}

interface Grupo {
  id: string;
  nombre: string;
  monedaBase: string;
  integrantes: string[];
  gastos: Gasto[];
  creadoEn: number;
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [nombre, setNombre] = useState("");
  const [integrantes, setIntegrantes] = useState("");

  // Cargar grupos
  useEffect(() => {
    fetch("/api/grupos")
      .then((res) => res.json())
      .then((data) => setGrupos(data));
  }, []);

  async function crearGrupo(e: React.FormEvent) {
    e.preventDefault();

    const integrArray = integrantes
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre,
        integrantes: integrArray,
      }),
    });

    const nuevo = await res.json();

    // Actualizar UI
    setGrupos([...grupos, nuevo]);

    // Resetear formulario
    setNombre("");
    setIntegrantes("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Grupos</h1>

      <form onSubmit={crearGrupo} style={{ marginBottom: 20 }}>
        <h3>Crear nuevo grupo</h3>

        <input
          placeholder="Nombre del grupo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Integrantes separados por coma: Ana, Luis, Marta"
          value={integrantes}
          onChange={(e) => setIntegrantes(e.target.value)}
        />

        <br /><br />

        <button type="submit">Crear</button>
      </form>

      <h3>Listado</h3>
      <ul>
        {grupos.map((g: any) => (
          <li key={g.id}>
            {g.nombre} — {g.integrantes.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}