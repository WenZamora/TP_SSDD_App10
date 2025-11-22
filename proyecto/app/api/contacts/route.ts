import { NextResponse } from "next/server";
import { getAllContacts, addContact } from "@/lib/contacts";

export async function GET() {
  const contacts = await getAllContacts();
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const { name, email, phone } = await request.json();

  if (!email || !name) {
    return NextResponse.json({ error: "Nombre y email requeridos." }, { status: 400 });
  }

  const newContact = await addContact(name, email, phone ?? "");
  return NextResponse.json(newContact, { status: 201 });
}