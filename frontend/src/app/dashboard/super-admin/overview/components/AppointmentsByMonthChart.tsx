"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: {
    month: string;
    totalAppointments: number;
  }[];
}

export function AppointmentsByMonthChart({ data }: Props) {
  const safeData =
    data && data.length > 0
      ? data
      : [{ month: "Sin datos", totalAppointments: 0 }];

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Turnos por mes
      </h3>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={safeData} barCategoryGap={55} maxBarSize={80}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
          <Tooltip />

          <Bar
            dataKey="totalAppointments"
            name="Turnos"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">
          No hay turnos para el período seleccionado
        </p>
      )}
    </div>
  );
}
