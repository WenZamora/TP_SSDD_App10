import { NextResponse } from "next/server";
import { getAllGroups, addGroup } from "@/app/lib/groups";

/**
 * GET /api/groups
 * Returns all groups, optionally filtered by user membership
 * Query params:
 *  - userId: Optional user ID to filter groups where user is a member
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    const groups = await getAllGroups(userId || undefined);
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
 * Body: { name: string, baseCurrency: string, members: string[], creatorUserId: string, description?: string }
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
    
    if (!body.creatorUserId || typeof body.creatorUserId !== "string") {
      return NextResponse.json(
        { error: "El ID del creador es requerido" },
        { status: 400 }
      );
    }
    
    if (body.members && !Array.isArray(body.members)) {
      return NextResponse.json(
        { error: "Los miembros deben ser un array" },
        { status: 400 }
      );
    }
    
    const newGroup = await addGroup(body, body.creatorUserId);
    return NextResponse.json(newGroup, { status: 201 });
    
  } catch (error) {
    console.error("Error creating group:", error);
    
    // Check for specific errors
    if (error instanceof Error) {
      if (error.message === "Creator user not found") {
        return NextResponse.json(
          { error: "Usuario creador no encontrado" },
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
      { error: "Error al crear el grupo" },
      { status: 500 }
    );
  }
}