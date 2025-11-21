import { NextResponse } from "next/server";
import { getGroupById, updateGroup, deleteGroup } from "@/lib/groups";

export async function GET(_: Request, { params }: any) { 
  const grupo = await getGroupById(params.id);
  
  if (!grupo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  
  return NextResponse.json(grupo);
}

export async function PUT(req: Request, { params }: any) { 
  const data = await req.json();
  const upd = await updateGroup(params.id, data);
  
  if (!upd) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  
  return NextResponse.json(upd); 
}

export async function DELETE(_: Request, { params }: any) { 
  const ok = await deleteGroup(params.id);
  
  return NextResponse.json({ success: ok });
}