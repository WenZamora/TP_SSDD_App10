import { NextResponse } from "next/server";
import { getGroupById, updateGroup, deleteGroup } from "@/app/lib/groups";

/**
 * GET /api/groups/[id]
 * Returns a single group by ID
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const group = await getGroupById(id);
    
    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(group, { status: 200 });
  } catch (error) {
    console.error("Error retrieving group:", error);
    return NextResponse.json(
      { error: "Error al obtener el grupo" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/groups/[id]
 * Updates a group
 * Body: Partial<Group> & { updaterUserId: string }
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Validate members array if provided
    if (data.members !== undefined && !Array.isArray(data.members)) {
      return NextResponse.json(
        { error: "Los miembros deben ser un array" },
        { status: 400 }
      );
    }
    
    // Require updaterUserId if members are being updated
    if (data.members && !data.updaterUserId) {
      return NextResponse.json(
        { error: "El ID del usuario es requerido para actualizar miembros" },
        { status: 400 }
      );
    }
    
    const { updaterUserId, ...updateData } = data;
    const updatedGroup = await updateGroup(id, updateData, updaterUserId);
    
    if (!updatedGroup) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedGroup, { status: 200 });
    
  } catch (error) {
    console.error("Error updating group:", error);
    
    // Check for specific errors
    if (error instanceof Error) {
      if (error.message === "Updater user not found") {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      if (error.message.includes("not in your contact list")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Error al actualizar el grupo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * Deletes a group
 */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = await deleteGroup(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Error al eliminar el grupo" },
      { status: 500 }
    );
  }
}