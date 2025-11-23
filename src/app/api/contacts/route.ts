import { NextResponse } from "next/server";
import { getAllContacts, addContact } from "@/app/lib/contacts";

/**
 * GET /api/contacts
 * Returns all contacts
 */
export async function GET() {
  try {
    const contacts = await getAllContacts();
    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Error retrieving contacts:", error);
    return NextResponse.json(
      { error: "Error al obtener los contactos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Creates a new contact
 * Body: { name: string, email: string }
 */
export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    // Validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || email.trim() === "") {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "El email no es válido" },
        { status: 400 }
      );
    }

    const newContact = await addContact(name, email);
    return NextResponse.json(newContact, { status: 201 });
    
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Error al crear el contacto" },
      { status: 500 }
    );
  }
}