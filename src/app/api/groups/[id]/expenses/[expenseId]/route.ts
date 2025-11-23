import { NextResponse } from "next/server";
import { updateExpense, deleteExpense, getGroupById } from "@/app/lib/groups";
import { convertAmount } from "@/app/lib/exchange";

/**
 * PUT /api/groups/[id]/expenses/[expenseId]
 * Updates an expense
 * Body: Partial<Expense>
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const body = await req.json();
    
    // If amount or currency changed, recalculate conversion
    if (body.amount !== undefined || body.currency !== undefined) {
      const group = await getGroupById(params.id);
      if (!group) {
        return NextResponse.json(
          { error: "Grupo no encontrado" },
          { status: 404 }
        );
      }
      
      // Find the expense to get current values
      const currentExpense = group.expenses.find(e => e.id === params.expenseId);
      if (!currentExpense) {
        return NextResponse.json(
          { error: "Gasto no encontrado" },
          { status: 404 }
        );
      }
      
      // Use new values or fall back to current
      const amount = body.amount !== undefined ? body.amount : currentExpense.amount;
      const currency = body.currency !== undefined ? body.currency : currentExpense.currency;
      
      // Recalculate converted amount
      const convertedAmount = await convertAmount(
        amount,
        currency,
        group.baseCurrency
      );
      
      body.convertedAmount = convertedAmount;
    }
    
    const updatedExpense = await updateExpense(params.id, params.expenseId, body);
    
    if (!updatedExpense) {
      return NextResponse.json(
        { error: "Gasto o grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedExpense, { status: 200 });
    
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Error al actualizar el gasto" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]/expenses/[expenseId]
 * Deletes an expense
 */
export async function DELETE(
  _: Request,
  { params }: { params: { id: string; expenseId: string } }
) {
  try {
    const deleted = await deleteExpense(params.id, params.expenseId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: "Gasto o grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Error al eliminar el gasto" },
      { status: 500 }
    );
  }
}

