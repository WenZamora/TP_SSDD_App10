import { NextResponse } from "next/server";
import { getGrupoById, updateGrupo, deleteGrupo } from "@/lib/grupos";

export async function GET(_: Request, { params }: any) {
  const grupo = await getGrupoById(params.id);
  
  if (!grupo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  
  return NextResponse.json(grupo);
}

export async function PUT(req: Request, { params }: any) {
  const data = await req.json();
  const upd = await updateGrupo(params.id, data);
  
  if (!upd) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  
  return NextResponse.json(upd);
}

export async function DELETE(_: Request, { params }: any) {
  const ok = await deleteGrupo(params.id);
  
  return NextResponse.json({ success: ok });
}