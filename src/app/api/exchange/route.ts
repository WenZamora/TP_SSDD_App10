import { NextResponse } from "next/server";
import { getExchangeRate } from "@/app/lib/exchange";

/**
 * GET /api/exchange?from=USD&to=ARS
 * Returns exchange rate between two currencies
 * Response: { rate: number, from: string, to: string, timestamp: number }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    
    // Validation
    if (!from || !to) {
      return NextResponse.json(
        { error: "Los parámetros 'from' y 'to' son requeridos" },
        { status: 400 }
      );
    }
    
    if (typeof from !== "string" || typeof to !== "string") {
      return NextResponse.json(
        { error: "Los parámetros deben ser strings" },
        { status: 400 }
      );
    }
    
    if (from.length !== 3 || to.length !== 3) {
      return NextResponse.json(
        { error: "Los códigos de moneda deben tener 3 caracteres (ej: USD, ARS)" },
        { status: 400 }
      );
    }
    
    // Get exchange rate
    const exchangeRate = await getExchangeRate(from.toUpperCase(), to.toUpperCase());
    
    return NextResponse.json(exchangeRate, { status: 200 });
    
  } catch (error) {
    console.error("Error getting exchange rate:", error);
    return NextResponse.json(
      { error: "Error al obtener la tasa de cambio" },
      { status: 500 }
    );
  }
}

