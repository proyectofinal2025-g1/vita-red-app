"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  data: {
    status: string;
    total: number;
  }[];
}

const COLORS: Record<string, string> = {
  CONFIRMED: "#16a34a", // verde
  PENDING: "#f59e0b", // amarillo
  CANCELLED: "#dc2626", // rojo
};

export function AppointmentsByStatusChart({ data }: Props) {
  const safeData =
    data && data.length > 0
      ? data
      : [
          { status: "CONFIRMED", total: 0 },
          { status: "PENDING", total: 0 },
          { status: "CANCELLED", total: 0 },
        ];

  const totalAppointments = safeData.reduce((acc, item) => acc + item.total, 0);

  const dataWithPercentages = safeData.map((item) => ({
    ...item,
    percentage:
      totalAppointments > 0
        ? Math.round((item.total / totalAppointments) * 100)
        : 0,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Turnos por estado
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-lg font-semibold fill-gray-700"
          >
            {totalAppointments}
          </text>

          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm fill-gray-400"
          >
            Turnos
          </text>

          <Pie
            data={dataWithPercentages}
            dataKey="total"
            nameKey="status"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {safeData.map((entry) => (
              <Cell
                key={entry.status}
                fill={COLORS[entry.status] || "#9ca3af"}
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(_, __, props) => {
              const payload = props.payload as any;
              return [`${payload.total} (${payload.percentage}%)`, "Turnos"];
            }}
          />

          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
  function renderLegend(props: any) {
    const { payload } = props;

    return (
      <ul className="space-y-2">
        {payload.map((entry: any) => (
          <li key={entry.value} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.value}</span>
            <span className="text-gray-500">
              {entry.payload.total} ({entry.payload.percentage}%)
            </span>
          </li>
        ))}
      </ul>
    );
  }
}
