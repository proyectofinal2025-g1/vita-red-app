'use client'

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function PatientDashboardHome() {
    const { dataUser } = useAuth();
    const [firstName, setFirstName] = useState("Paciente");

    useEffect(() => {
        const token = dataUser?.Token || dataUser?.token;
        console.log("Token encontrado:", token);
        console.log("DataUser completo:", dataUser);
        
        if (token) {

            try {
                const parts = token.split('.');
                console.log("Partes del token:", parts.length);
                if (parts.length === 3) {
                    const decoded = JSON.parse(atob(parts[1]));
                    console.log("Token decodificado:", decoded);
                    if (decoded.first_name) {
                        setFirstName(decoded.first_name.split(" ")[0]);
                    }
                }
            } catch (error) {
                console.error("Error decodificando token:", error);
            }
        }
    }, [dataUser]);

    return (
        <div className="p-8 space-y-6 max-w-3xl mx-auto">

            <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl">
                    👤
                </div>
                
                <h1 className="text-2xl font-bold">
                    ¡Hola {firstName}!👋🏻
                </h1>
            </div>
            
            <div className="flex gap-4 justify-center mt-6">
                <Link href="/dashboard/patient/appointments" className="px-6 py-3 bg-blue-600 text-white rounded">
                Mis turnos
                </Link>

                <Link href="/dashboard/patient/profile" className="px-6 py-3 bg-gray-700 text-white rounded">
                Mis datos
                </Link>
            </div>

        </div>
    );
}