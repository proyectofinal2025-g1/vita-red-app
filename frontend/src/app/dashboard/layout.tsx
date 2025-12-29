'use client' 
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { 
    children: React.ReactNode }) { 
        const { dataUser } = useAuth(); 
        const [loading, setLoading] = useState(true); 
        
        useEffect(() => { 
            setLoading(false); 
        }, []); 
        if (loading) return null;

        if (!dataUser) { 
            redirect("/auth/login"); 
        } 
    return <>{children}</>; 
}