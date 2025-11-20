import { NextResponse } from "next/server";
import { addGastoToGrupo } from "@/lib/grupos";

export async function POST(req: Request, { params }: any) {
  const body = await req.json();
  const gasto = await addGastoToGrupo(params.id, body);
  
  if (!gasto) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  
  return NextResponse.json(gasto, { status: 201 });
}