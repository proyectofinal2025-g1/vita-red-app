"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useSuperAdminDashboard } from "@/hooks/useSuperAdminDashboard";
import { AppointmentsByMonthChart } from "./components/AppointmentsByMonthChart";
import { RevenueByMonthChart } from "./components/RevenueByMonthChart";
import { AppointmentsByStatusChart } from "./components/AppointmentsByStatusChart";

const apiURL = process.env.NEXT_PUBLIC_API_URL;

interface OverviewData {
  totalUsers: number;
  totalDoctors: number;
  activeUsers: number;
  inactiveUsers: number;
}

export default function SuperAdminOverview() {
  useRoleGuard("superadmin");

  const currentYear = new Date().getUTCFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useSuperAdminDashboard(selectedYear);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSession = localStorage.getItem("userSession");
        if (!userSession) throw new Error("Sesión no encontrada");

        const session = JSON.parse(userSession);
        const token = session.token;

        const response = await fetch(`${apiURL}/superadmin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al cargar estadísticas");

        const data = await response.json();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-lg">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" />
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-red-700">⚠️ Error</h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
        <div className="text-center">
          <Link
            href="/dashboard/super-admin"
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
          >
            ← Volver al Panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          📊 Panel de Estadísticas
        </h1>
        <Link
          href="/dashboard/super-admin"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          ← Volver al Panel
        </Link>
      </div>
      {/* Nota informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-8">
        <p className="text-sm text-blue-700">
          Las estadísticas se actualizan automáticamente cada vez que ingresas.
        </p>
      </div>

      {/* Tarjetas principales - Ordenado como solicitaste */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {/* Fila 1 */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Usuarios Totales
          </h2>
          <p className="text-4xl font-bold text-blue-600">
            {overview?.totalUsers || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Usuarios Activos
          </h2>
          <p className="text-4xl font-bold text-green-600">
            {overview?.activeUsers || 0}
          </p>
        </div>

        {/* Fila 2 */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Médicos Registrados
          </h2>
          <p className="text-4xl font-bold text-purple-600">
            {overview?.totalDoctors || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Usuarios Inactivos
          </h2>
          <p className="text-4xl font-bold text-red-600">
            {overview?.inactiveUsers || 0}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📈 Estadísticas de Turnos e Ingresos
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-gray-600">Año:</label>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>
        </div>

        {dashboardLoading && (
          <div className="text-gray-600">
            Cargando estadísticas de negocio...
          </div>
        )}

        {dashboardError && (
          <div className="text-red-600 mb-4">{dashboardError}</div>
        )}

        {!dashboardLoading && !dashboardError && dashboardData?.kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h3 className="text-sm text-gray-500">Turnos Totales</h3>
              <p className="text-3xl font-bold text-blue-600">
                {dashboardData.kpis.totalAppointments}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h3 className="text-sm text-gray-500">Turnos del Mes</h3>
              <p className="text-3xl font-bold text-indigo-600">
                {dashboardData.kpis.appointmentsThisMonth}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h3 className="text-sm text-gray-500">Turnos Confirmados</h3>
              <p className="text-3xl font-bold text-green-600">
                {dashboardData.kpis.confirmedAppointments}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h3 className="text-sm text-gray-500">Turnos Cancelados</h3>
              <p className="text-3xl font-bold text-red-600">
                {dashboardData.kpis.cancelledAppointments}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-xl md:col-span-2 lg:col-span-1">
              <h3 className="text-sm text-gray-500">Ingresos Totales</h3>
              <p className="text-3xl font-bold text-emerald-600">
                ${dashboardData.kpis.totalRevenue}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentsByMonthChart
          data={dashboardData?.monthlyAppointments || []}
        />

        <RevenueByMonthChart data={dashboardData?.monthlyRevenue || []} />

        <div className="mt-10 pb-16">
          <AppointmentsByStatusChart
            data={dashboardData?.appointmentsByStatus || []}
          />
        </div>
      </div>

      {/* Pie */}
      <div className="text-center">
        <Link
          href="/dashboard/super-admin"
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          ← Volver al Panel
        </Link>
      </div>
    </div>
  );
}
