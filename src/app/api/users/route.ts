import { NextResponse } from "next/server";
import { getAllUsers, addUser, getUserById } from "@/app/lib/contacts";

/**
 * GET /api/users?email=xxx
 * Returns all users or a specific user by email
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    if (email) {
      // Find user by email
      const users = await getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(user, { status: 200 });
    } else {
      // Get all users
      const users = await getAllUsers();
      return NextResponse.json(users, { status: 200 });
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
    return NextResponse.json(
      { error: "Error al obtener los usuarios" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Creates a new user or logs in existing user
 * Body: { name: string, email: string }
 */
export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    // Validation
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

    // Check if user already exists
    const users = await getAllUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      // User exists, return it (login)
      return NextResponse.json(existingUser, { status: 200 });
    }

    // User doesn't exist, create new one
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido para crear un nuevo usuario" },
        { status: 400 }
      );
    }

    const newUser = await addUser(name, email);
    return NextResponse.json(newUser, { status: 201 });
    
  } catch (error) {
    console.error("Error creating/logging in user:", error);
    return NextResponse.json(
      { error: "Error al procesar el usuario" },
      { status: 500 }
    );
  }
}

