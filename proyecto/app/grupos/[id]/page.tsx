//para  ver un grupo y sus gastos

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function GrupoDetallePage() {
  const { id } = useParams();
  const [grupo, setGrupo] = useState<Grupo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`/api/grupos/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el grupo");

        const data = await res.json();

        if (!data) {
          setError("El grupo no existe");
          return;
        }

        setGrupo(data);
      } catch (err) {
        setError("Error al cargar el grupo");
      }
    }

    cargar();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!grupo) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{grupo.nombre}</h1>
      <p>Moneda base: {grupo.monedaBase}</p>

      <h2>Integrantes</h2>
      <ul>
        {grupo.integrantes.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>

      <h2>Gastos</h2>
      {grupo.gastos.length === 0 ? (
        <p>No hay gastos.</p>
      ) : (
        <ul>
          {grupo.gastos.map((g) => (
            <li key={g.id}>
              <strong>{g.descripcion}</strong>
              {" — "}
              {g.monto} {g.moneda}
              {" — pagó "}
              {g.pagador}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
