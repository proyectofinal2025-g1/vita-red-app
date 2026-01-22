"use client";

import { useEffect, useState } from "react";
import {
  getDashboardKpis,
  getMonthlyAppointments,
  getMonthlyRevenue,
  getAppointmentsByStatus,
} from "@/services/superAdminDashboard.service";

interface DashboardData {
  kpis: DashboardKpis | null;
  monthlyAppointments: MonthlyAppointments[];
  monthlyRevenue: MonthlyRevenue[];
  appointmentsByStatus: AppointmentStatus[];
}

interface DashboardKpis {
  totalAppointments: number;
  appointmentsThisMonth: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface MonthlyAppointments {
  month: string;
  totalAppointments: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface AppointmentStatus {
  status: string;
  total: number;
}

export function useSuperAdminDashboard(year?: number) {
  const [data, setData] = useState<DashboardData>({
    kpis: null,
    monthlyAppointments: [],
    monthlyRevenue: [],
    appointmentsByStatus: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [
          kpis,
          monthlyAppointments,
          monthlyRevenue,
          appointmentsByStatus,
        ] = await Promise.all([
          getDashboardKpis(year) as Promise<DashboardKpis>,
          getMonthlyAppointments(year) as Promise<MonthlyAppointments[]>,
          getMonthlyRevenue(year) as Promise<MonthlyRevenue[]>,
          getAppointmentsByStatus(year) as Promise<AppointmentStatus[]>,
        ]);

        if (!isMounted) return;

        setData({
          kpis,
          monthlyAppointments,
          monthlyRevenue,
          appointmentsByStatus,
        });
      } catch (err) {
        if (!isMounted) return;
        setError("Error al cargar las estadísticas del dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [year]);

  return {
    data,
    loading,
    error,
  };
}
