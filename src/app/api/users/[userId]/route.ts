import { NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/app/lib/contacts";

/**
 * GET /api/users/[userId]
 * Returns a single user by ID
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return NextResponse.json(
      { error: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[userId]
 * Updates a user
 * Body: Partial<User>
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
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
    
    const updatedUser = await updateUser(userId, data);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser, { status: 200 });
    
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar el usuario" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[userId]
 * Deletes a user from the system (admin operation)
 * Returns 409 if trying to delete a user who is member of any group
 */
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const result = await deleteUser(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    
    // Check if error is from group membership validation
    if (error instanceof Error && error.message.includes("member of one or more groups")) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al eliminar el usuario" },
      { status: 500 }
    );
  }
}

