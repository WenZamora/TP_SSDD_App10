import { NextResponse } from "next/server";
import { getAllContacts, addContact, getUserContacts, addContactToUser } from "@/app/lib/contacts";

/**
 * GET /api/contacts?userId=xxx
 * Returns all contacts for a specific user, or all users if no userId provided
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (userId) {
      // Get contacts for specific user
      const contacts = await getUserContacts(userId);
      return NextResponse.json(contacts, { status: 200 });
    } else {
      // Get all users (for backwards compatibility and admin views)
      const contacts = await getAllContacts();
      return NextResponse.json(contacts, { status: 200 });
    }
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
 * Creates a new user OR adds an existing user as contact
 * Body: { name: string, email: string } - creates new user
 * Body: { userId: string, contactId: string } - adds contact to user
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if this is adding a contact to a user
    if (body.userId && body.contactId) {
      const { userId, contactId } = body;
      
      if (!userId || !contactId) {
        return NextResponse.json(
          { error: "userId y contactId son requeridos" },
          { status: 400 }
        );
      }
      
      try {
        const updatedUser = await addContactToUser(userId, contactId);
        return NextResponse.json(updatedUser, { status: 200 });
      } catch (error) {
        if (error instanceof Error) {
          return NextResponse.json(
            { error: error.message },
            { status: 400 }
          );
        }
        throw error;
      }
    }
    
    // Otherwise, create a new user
    const { name, email } = body;

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