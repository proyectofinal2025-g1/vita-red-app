import React from "react";

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <main className="flex-1 p-6 bg-gray-50">
                {children}
            </main>
        </div>
    );
}