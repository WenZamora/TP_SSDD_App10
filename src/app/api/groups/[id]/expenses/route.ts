import { NextResponse } from "next/server";
import { getGroupExpenses, getGroupById, addExpenseToGroup } from "@/app/lib/groups";
import { convertAmount } from "@/app/lib/exchange";

/**
 * GET /api/groups/[id]/expenses
 * Returns all expenses for a group
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const expenses = await getGroupExpenses(params.id);
    
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
 * Body: { description, amount, currency, payer, participants, category?, date? }
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    
    // Validation
    if (!body.description || typeof body.description !== "string") {
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
    
    if (!body.currency || typeof body.currency !== "string") {
      return NextResponse.json(
        { error: "La moneda es requerida" },
        { status: 400 }
      );
    }
    
    if (!body.payer || typeof body.payer !== "string") {
      return NextResponse.json(
        { error: "El pagador es requerido" },
        { status: 400 }
      );
    }
    
    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { error: "Debe haber al menos un participante" },
        { status: 400 }
      );
    }
    
    // Get group to check base currency and members
    const group = await getGroupById(params.id);
    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    // Validate payer and participants are members of the group
    if (!group.members.includes(body.payer)) {
      return NextResponse.json(
        { error: "El pagador debe ser miembro del grupo" },
        { status: 400 }
      );
    }
    
    const invalidParticipants = body.participants.filter(
      (p: string) => !group.members.includes(p)
    );
    if (invalidParticipants.length > 0) {
      return NextResponse.json(
        { error: "Todos los participantes deben ser miembros del grupo" },
        { status: 400 }
      );
    }
    
    // Convert amount to group's base currency
    const convertedAmount = await convertAmount(
      body.amount,
      body.currency,
      group.baseCurrency
    );
    
    // Add expense with converted amount
    const expenseData = {
      ...body,
      convertedAmount,
    };
    
    const expense = await addExpenseToGroup(params.id, expenseData);
    
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