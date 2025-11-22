import { NextResponse } from "next/server";
import {deleteContact } from "@/lib/contacts";

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const result = await deleteContact(id);
  return NextResponse.json(result);
}