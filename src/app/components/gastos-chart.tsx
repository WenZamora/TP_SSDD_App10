'use client'

import "@/app/lib/chartjs-setup";
import { Bar } from "react-chartjs-2";

interface GastosChartProps {
  totalesPorPersona: Record<string, number>;
  totalesPorCategoria: Record<string, number>;
}

const GastosChart = ({ totalesPorPersona, totalesPorCategoria }: GastosChartProps) => {

  const dataPersona = {
    labels: Object.keys(totalesPorPersona),
    datasets: [
      {
        label: "Gastos por persona",
        data: Object.values(totalesPorPersona),
        backgroundColor: "#42a5f5",
      },
    ],
  };

  const dataCategoria = {
    labels: Object.keys(totalesPorCategoria),
    datasets: [
      {
        label: "Gastos por categoría",
        data: Object.values(totalesPorCategoria),
        backgroundColor: "#ffa726",
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">Gastos totales por persona</h3>
        <Bar data={dataPersona} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Gastos por categoría</h3>
        <Bar data={dataCategoria} />
      </div>
    </div>
  );
};

export default GastosChart;
