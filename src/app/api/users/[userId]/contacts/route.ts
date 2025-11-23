import { NextResponse } from "next/server";
import { getUserContacts, addContactToUser } from "@/app/lib/contacts";

/**
 * GET /api/users/[userId]/contacts
 * Returns all contacts for a specific user
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    const contacts = await getUserContacts(userId);
    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Error retrieving user contacts:", error);
    return NextResponse.json(
      { error: "Error al obtener los contactos del usuario" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[userId]/contacts
 * Adds an existing user as a contact to another user
 * Body: { contactId: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { contactId } = body;

    if (!contactId) {
      return NextResponse.json(
        { error: "Se requiere contactId" },
        { status: 400 }
      );
    }

    const updatedUser = await addContactToUser(userId, contactId);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error adding contact to user:", error);

    if (error instanceof Error) {
      if (error.message === "User not found") {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      if (error.message === "Contact user not found") {
        return NextResponse.json(
          { error: "El contacto no existe" },
          { status: 404 }
        );
      }
      if (error.message === "Cannot add yourself as a contact") {
        return NextResponse.json(
          { error: "No puedes agregarte a ti mismo como contacto" },
          { status: 400 }
        );
      }
      if (error.message === "Contact already exists") {
        return NextResponse.json(
          { error: "El contacto ya existe" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al agregar el contacto" },
      { status: 500 }
    );
  }
}

