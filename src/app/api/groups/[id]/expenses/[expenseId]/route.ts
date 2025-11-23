import { NextResponse } from "next/server";
import { updateExpense, deleteExpense, getGroupById } from "@/app/lib/groups";
import { convertAmount } from "@/app/lib/exchange";

/**
 * PUT /api/groups/[id]/expenses/[expenseId]
 * Updates an expense
 * Body: { description?, amount?, payer?, category?, date? }
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const body = await req.json();
    
    // Validation
    if (body.description !== undefined && (typeof body.description !== "string" || body.description.trim() === "")) {
      return NextResponse.json(
        { error: "La descripción no puede estar vacía" },
        { status: 400 }
      );
    }
    
    if (body.amount !== undefined && (typeof body.amount !== "number" || body.amount <= 0)) {
      return NextResponse.json(
        { error: "El monto debe ser un número positivo" },
        { status: 400 }
      );
    }
    
    // If category is being updated, validate it's valid
    if (body.category !== undefined) {
      const validCategories = ['Food', 'Transport', 'Accommodation', 'Entertainment', 'Shopping', 'Health', 'Education', 'Utilities', 'Other', 'General'];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: "Categoría inválida" },
          { status: 400 }
        );
      }
    }
    
    // Get group for validation and currency conversion
    const group = await getGroupById(id);
    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    // If payer is being updated, validate they are a member
    if (body.payer !== undefined) {
      if (!group.members.includes(body.payer)) {
        return NextResponse.json(
          { error: "El pagador debe ser miembro del grupo" },
          { status: 400 }
        );
      }
    }
    
    // Validate currency if provided
    if (body.currency !== undefined && (typeof body.currency !== "string" || body.currency.length !== 3)) {
      return NextResponse.json(
        { error: "La moneda debe ser un código de 3 caracteres (ej: USD)" },
        { status: 400 }
      );
    }
    
    // Prepare update data
    const updateData = { ...body };
    
    // Handle currency conversion if amount or currency is being updated
    if (body.amount !== undefined || body.currency !== undefined) {
      // Get current expense to access its currency
      const currentExpense = group.expenses.find(e => e.id === expenseId);
      if (!currentExpense) {
        return NextResponse.json(
          { error: "Gasto no encontrado" },
          { status: 404 }
        );
      }
      
      const newAmount = body.amount !== undefined ? body.amount : currentExpense.amount;
      const newCurrency = body.currency !== undefined ? body.currency.toUpperCase() : (currentExpense.currency || group.baseCurrency);
      const groupCurrency = group.baseCurrency.toUpperCase();
      
      // Convert to group currency if needed
      if (newCurrency !== groupCurrency) {
        try {
          const convertedAmount = await convertAmount(newAmount, newCurrency, groupCurrency);
          updateData.convertedAmount = convertedAmount;
          updateData.currency = newCurrency;
          console.log(`Converted ${newAmount} ${newCurrency} to ${convertedAmount} ${groupCurrency}`);
        } catch (error) {
          console.error("Currency conversion error:", error);
          return NextResponse.json(
            { error: "Error al convertir la moneda. Por favor, intente nuevamente." },
            { status: 500 }
          );
        }
      } else {
        // Same currency, no conversion needed
        updateData.convertedAmount = newAmount;
        updateData.currency = newCurrency;
      }
    }
    
    const updatedExpense = await updateExpense(id, expenseId, updateData);
    
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
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const deleted = await deleteExpense(id, expenseId);
    
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

