import { NextResponse } from "next/server";
import { getAllGroups, addGroup } from "@/app/lib/groups";

/**
 * GET /api/groups
 * Returns all groups
 */
export async function GET() {
  try {
    const groups = await getAllGroups();
    return NextResponse.json(groups, { status: 200 });
  } catch (error) {
    console.error("Error retrieving groups:", error);
    return NextResponse.json(
      { error: "Error al obtener los grupos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Creates a new group
 * Body: { name: string, baseCurrency: string, members: string[], description?: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validation
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del grupo es requerido" },
        { status: 400 }
      );
    }
    
    if (!body.baseCurrency || typeof body.baseCurrency !== "string") {
      return NextResponse.json(
        { error: "La moneda base es requerida" },
        { status: 400 }
      );
    }
    
    if (body.members && !Array.isArray(body.members)) {
      return NextResponse.json(
        { error: "Los miembros deben ser un array" },
        { status: 400 }
      );
    }
    
    const newGroup = await addGroup(body);
    return NextResponse.json(newGroup, { status: 201 });
    
  } catch (error) {
    console.error("Error creating group:", error);
    
    // Check if error is from member validation
    if (error instanceof Error && error.message.includes("Invalid member IDs")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al crear el grupo" },
      { status: 500 }
    );
  }
}