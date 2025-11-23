import { NextResponse } from "next/server";
import { removeContactFromUser } from "@/app/lib/contacts";

/**
 * DELETE /api/users/[userId]/contacts/[contactId]
 * Removes a contact from a user's contact list
 */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ userId: string; contactId: string }> }
) {
  try {
    const { userId, contactId } = await params;
    
    console.log('[API DELETE /api/users/[userId]/contacts/[contactId]]', { userId, contactId });
    
    const result = await removeContactFromUser(userId, contactId);
    
    console.log('[API DELETE] removeContactFromUser result:', result);
    
    if (!result) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    console.log('[API DELETE] Success');
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error removing contact from user:", error);
    
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al eliminar el contacto" },
      { status: 500 }
    );
  }
}

