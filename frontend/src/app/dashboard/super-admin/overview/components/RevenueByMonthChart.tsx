"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: {
    month: string;
    revenue: number;
  }[];
}

export function RevenueByMonthChart({ data }: Props) {
  const safeData =
    data && data.length > 0 ? data : [{ month: "Sin datos", revenue: 0 }];

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl ">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Ingresos por mes
      </h3>
      

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={safeData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value) => [`$${value}`, "Ingresos"]} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Ingresos"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {data.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">
          No hay ingresos confirmados para el período seleccionado
        </p>
      )}
    </div>
  );
}
