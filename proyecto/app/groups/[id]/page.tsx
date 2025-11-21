//para  ver un grupo y sus gastos

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  payer: string;
  participants: string[];
  category: string;
  date: number;
}

interface Group {
  id: string;
  name: string;
  baseCurrency: string;
  members: string[];
  expenses: Expense[];
  createdAt: number;
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/groups/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el grupo");

        const data = await res.json();

        if (!data) {
          setError("El grupo no existe");
          return;
        }

        setGroup(data);
      } catch (err) {
        setError("Error al cargar el grupo");
      }
    }

    load();
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!group) return <p>Cargando...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>{group.name}</h1>
      <p>Moneda base: {group.baseCurrency}</p>

      <h2>Integrantes</h2>
      <ul>
        {group.members.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>

      <h2>Gastos</h2>
      {group.expenses.length === 0 ? (
        <p>No hay gastos.</p>
      ) : (
        <ul>
          {group.expenses.map((exp) => (
            <li key={exp.id}>
              <strong>{exp.description}</strong>
              {" — "}
              {exp.amount} {exp.currency}
              {" — pagó "}
              {exp.payer}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}