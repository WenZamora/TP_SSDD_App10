"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface Props {
  data: {
    category: string;
    totalAmount: number;
  }[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function PieChartByCategory({ data }: Props) {
  console.log("DATOS QUE RECIBE EL PIE CHART:", data);

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalAmount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => entry.category}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toFixed(2)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}