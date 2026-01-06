'use client'

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useRef } from "react";

export default function PatientDashboardHome() {
    const { dataUser } = useAuth();
    const [firstName, setFirstName] = useState("Paciente");
    const [avatar, setAvatar] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const token = dataUser?.token || dataUser?.token;
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

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Por favor seleccioná una imagen válida");
            return;
        }
        const imageUrl = URL.createObjectURL(file);
        setAvatar(imageUrl);
    }; 

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
                
                <div className="flex flex-col items-center mb-8">
                    <div onClick={handleAvatarClick} className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5 cursor-pointer overflow-hidden hover:ring-2 hover:ring-blue-500 transition">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ): (
                            <span className="text-3xl">👤</span>
                        )}
                    </div>

                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden"/>
                    
                    <h1 className="text-2xl font-bold text-gray-800">
                        ¡Hola {firstName}! <span className="inline-block">👋🏻</span>
                    </h1>
                    
                    <p className="text-sm text-gray-500 text-center">
                        Bienvenid@ a tu panel de paciente
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                    <Link href="/dashboard/patient/appointments" className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition shadow-md">
                    Mis turnos
                    </Link>
                    
                    <Link href="/dashboard/patient/profile" className="flex-1 text-center px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-800 transition shadow-md">
                    Mis datos
                    </Link>
                </div>
            </div>
        </div>
    );
}