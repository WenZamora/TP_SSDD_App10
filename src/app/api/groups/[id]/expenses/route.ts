import { NextResponse } from "next/server";
import { getGroupExpenses, getGroupById, addExpenseToGroup } from "@/app/lib/groups";

/**
 * GET /api/groups/[id]/expenses
 * Returns all expenses for a group
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const expenses = await getGroupExpenses(id);
    
    if (expenses === null) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error("Error retrieving expenses:", error);
    return NextResponse.json(
      { error: "Error al obtener los gastos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/[id]/expenses
 * Creates a new expense in a group
 * Body: { description, amount, payer, category, date? }
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Validation
    if (!body.description || typeof body.description !== "string" || body.description.trim() === "") {
      return NextResponse.json(
        { error: "La descripción es requerida" },
        { status: 400 }
      );
    }
    
    if (!body.amount || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json(
        { error: "El monto debe ser un número positivo" },
        { status: 400 }
      );
    }
    
    if (!body.payer || typeof body.payer !== "string") {
      return NextResponse.json(
        { error: "El pagador es requerido" },
        { status: 400 }
      );
    }
    
    if (!body.category || typeof body.category !== "string") {
      return NextResponse.json(
        { error: "La categoría es requerida" },
        { status: 400 }
      );
    }
    
    // Validate category is valid
    const validCategories = ['Food', 'Transport', 'Accommodation', 'Entertainment', 'Shopping', 'Health', 'Education', 'Utilities', 'Other', 'General'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: "Categoría inválida" },
        { status: 400 }
      );
    }
    
    // Get group to validate payer is a member
    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    // Validate payer is a member of the group
    if (!group.members.includes(body.payer)) {
      return NextResponse.json(
        { error: "El pagador debe ser miembro del grupo" },
        { status: 400 }
      );
    }
    
    // Create expense data
    const expenseData = {
      description: body.description.trim(),
      amount: body.amount,
      payer: body.payer,
      category: body.category,
      date: body.date,
    };
    
    const expense = await addExpenseToGroup(id, expenseData);
    
    if (!expense) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(expense, { status: 201 });
    
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Error al crear el gasto" },
      { status: 500 }
    );
  }
}