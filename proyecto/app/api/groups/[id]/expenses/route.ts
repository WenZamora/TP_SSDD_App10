import { NextResponse } from "next/server";
import { addExpenseToGroup } from "@/lib/groups";

export async function POST(req: Request, { params }: any) {
  const body = await req.json();
  const expense = await addExpenseToGroup(params.id, body);
  
  if (!expense) return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
  
  return NextResponse.json(expense, { status: 201 });
}