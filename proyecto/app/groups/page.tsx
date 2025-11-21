// client componente -> para manejaar formulario y feych!!
'use client';

import { useEffect, useState } from "react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string; //moneda
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

export default function GruposPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState("");
  const [membersInput, setMembersInput] = useState("");

// Cargar grupos al montar el componente
  useEffect(() => {
    fetch("/api/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();

    const membersArray = membersInput
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        members: membersArray,
      }),
    });

    const newGroup = await res.json();

    // Actualizar UI
    setGroups([...groups, newGroup]);

    // Resetear formulario
    setName("");
    setMembersInput("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Grupos</h1>

      <form onSubmit={createGroup} style={{ marginBottom: 20 }}>
        <h3>Crear nuevo grupo</h3>

        <input
          placeholder="Nombre del grupo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Integrantes separados por coma: Ana, Luis, Marta"
          value={membersInput}
          onChange={(e) => setMembersInput(e.target.value)}
        />

        <br /><br />

        <button type="submit">Crear</button>
      </form>

      <h3>Listado</h3>
      <ul>
        {groups.map((g) => (
          <li key={g.id}>
            {g.name} — {g.members.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}