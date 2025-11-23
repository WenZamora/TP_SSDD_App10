import { NextResponse } from "next/server";
import { getGroupBalanceSummary } from "@/app/lib/balance";

/**
 * GET /api/groups/[id]/balance
 * Returns balance information and settlement suggestions for a group
 * Response: { balances: Balance[], settlements: Settlement[] }
 */
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const balanceSummary = await getGroupBalanceSummary(params.id);
    
    return NextResponse.json(balanceSummary, { status: 200 });
    
  } catch (error) {
    console.error("Error calculating balance:", error);
    
    // Check if error is "Group not found"
    if (error instanceof Error && error.message === "Group not found") {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al calcular el balance" },
      { status: 500 }
    );
  }
}

