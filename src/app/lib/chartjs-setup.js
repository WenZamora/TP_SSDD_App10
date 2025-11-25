// src/app/lib/chartjs-setup.ts

import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Registra absolutamente todo lo necesario para cualquier gráfico
ChartJS.register(
  // Básicos
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,

  // Extras
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// Evita el mensaje de "already registered"
if (typeof window !== "undefined") {
  console.log("[Chart.js] setup loaded ✔️");
}
