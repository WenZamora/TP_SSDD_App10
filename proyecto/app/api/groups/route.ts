import { NextResponse } from "next/server";
import { getAllGroups, addGroup } from "@/lib/groups";

export async function GET() { //para devolver TODOS los grupos
  const groups = await getAllGroups();
  
  return NextResponse.json(groups);
}

export async function POST(req: Request) { //para crear un grupo nuevo
  const body = await req.json();
  const newG = await addGroup(body);
  
  return NextResponse.json(newG, { status: 201 });
}