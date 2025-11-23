import { NextResponse } from "next/server";
import { getGroupById } from "@/app/lib/groups";
import {
  getExpensesByPerson,
  getExpensesByCategory,
  getExpensesByMonth,
  getTotalGroupExpenses,
  getGroupSummary,
} from "@/app/lib/statistics";

/**
 * GET /api/groups/[id]/statistics?type=person|category|month|total|summary
 * Returns statistics for a group based on the type parameter
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    
    // Get group
    const group = await getGroupById(params.id);
    if (!group) {
      return NextResponse.json(
        { error: "Grupo no encontrado" },
        { status: 404 }
      );
    }
    
    // Return different statistics based on type
    switch (type) {
      case "person": {
        const data = await getExpensesByPerson(group);
        return NextResponse.json(data, { status: 200 });
      }
      
      case "category": {
        const data = getExpensesByCategory(group);
        return NextResponse.json(data, { status: 200 });
      }
      
      case "month": {
        const data = getExpensesByMonth(group);
        return NextResponse.json(data, { status: 200 });
      }
      
      case "total": {
        const data = getTotalGroupExpenses(group);
        return NextResponse.json(data, { status: 200 });
      }
      
      case "summary": {
        const data = await getGroupSummary(group);
        return NextResponse.json(data, { status: 200 });
      }
      
      default: {
        return NextResponse.json(
          { error: "Tipo de estadística inválido. Usar: person, category, month, total, o summary" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("Error calculating statistics:", error);
    return NextResponse.json(
      { error: "Error al calcular las estadísticas" },
      { status: 500 }
    );
  }
}

