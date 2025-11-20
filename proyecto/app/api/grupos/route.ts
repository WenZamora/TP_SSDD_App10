import { NextResponse } from "next/server";
import { getAllGrupos, addGrupo } from "@/lib/grupos";

export async function GET() { //para devolver TODOS los grupos
  const grupos = await getAllGrupos();
  
  return NextResponse.json(grupos);
}

export async function POST(req: Request) { //para crear un grupo nuevo
  const body = await req.json();
  const nuevo = await addGrupo(body);
  
  return NextResponse.json(nuevo, { status: 201 });
}