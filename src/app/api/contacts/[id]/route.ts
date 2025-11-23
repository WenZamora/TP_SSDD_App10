import { NextResponse } from "next/server";
import { getContactById, updateContact, deleteContact } from "@/app/lib/contacts";

/**
 * GET /api/contacts/[id]
 * Returns a single contact by ID
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const contact = await getContactById(params.id);
    
    if (!contact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    console.error("Error retrieving contact:", error);
    return NextResponse.json(
      { error: "Error al obtener el contacto" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contacts/[id]
 * Updates a contact
 * Body: Partial<Contact>
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    
    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return NextResponse.json(
          { error: "El email no es válido" },
          { status: 400 }
        );
      }
    }
    
    const updatedContact = await updateContact(params.id, data);
    
    if (!updatedContact) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedContact, { status: 200 });
    
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Error al actualizar el contacto" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/[id]
 * Deletes a contact
 * Returns 409 if contact is member of any group
 */
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const result = await deleteContact(params.id);
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting contact:", error);
    
    // Check if error is from group membership validation
    if (error instanceof Error && error.message.includes("member of one or more groups")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    if (error instanceof Error && error.message === "Contact not found") {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al eliminar el contacto" },
      { status: 500 }
    );
  }
}