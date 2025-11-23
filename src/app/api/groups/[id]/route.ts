import { NextResponse } from "next/server";
import { getGroupById, updateGroup, deleteGroup } from "@/app/lib/groups";

/**
 * GET /api/groups/[id]
 * Returns a single group by ID
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const group = await getGroupById(params.id);
    
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
 * Body: Partial<Group>
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    
    // Validate members array if provided
    if (data.members !== undefined && !Array.isArray(data.members)) {
      return NextResponse.json(
        { error: "Los miembros deben ser un array" },
        { status: 400 }
      );
    }
    
    const updatedGroup = await updateGroup(params.id, data);
    
    if (!updatedGroup) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedGroup, { status: 200 });
    
  } catch (error) {
    console.error("Error updating group:", error);
    
    // Check if error is from member validation
    if (error instanceof Error && error.message.includes("Invalid member IDs")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
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
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteGroup(params.id);
    
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