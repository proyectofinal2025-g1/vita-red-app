'use client'

import Link from "next/link";

export default function ContactPage() {
    return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg shadow-black/10 p-8 space-y-8">
        
        <div className="space-y-3 text-center">
            <h1 className="text-3xl font-semibold text-gray-800">
                Contacto
            </h1>
            
            <p className="text-gray-600 max-w-xl mx-auto">
                Podés comunicarte con Clínica Vita Red a través de los siguientes medios. Nuestro equipo está disponible para ayudarte.
            </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
                <span className="text-lg">📍</span>
                <p className="font-medium mt-1">Dirección</p>
                <p className="text-sm">
                    Laprida 235, San Miguel de Tucumán, Tucumán
                </p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
                <span className="text-lg">📞</span>
                <p className="font-medium mt-1">Teléfono</p>
                <p className="text-sm">+54 11 4567-8900</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
                <span className="text-lg">✉️</span>
                <p className="font-medium mt-1">Email</p>
                <p className="text-sm">contacto@vitared.com</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
                <span className="text-lg">🕒</span>
                <p className="font-medium mt-1">Horarios</p>
                <p className="text-sm">
                    Lunes a Viernes de 8:00 a 18:00 hs
                </p>
            </div>

        </div>
        
        <div className="text-center pt-2">
            <Link href="/" className="text-blue-600 font-medium hover:underline">
            Volver al inicio
            </Link>
        </div>

    </div>
</div>

    );
}
