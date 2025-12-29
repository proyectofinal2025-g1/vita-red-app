'use client'

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function ProfilePage() {
    const { dataUser } = useAuth();
    const [userData, setUserData] = useState({
        id: '',
        first_name: '',
        last_name: '',
        dni: '',
        email: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const savedData = localStorage.getItem('userProfileData');
        
        let currentUserId = '';
        if (dataUser?.Token) {
            try {
                const parts = dataUser.Token.split('.');
                if (parts.length === 3) {
                    const decoded = JSON.parse(atob(parts[1]));
                    currentUserId = decoded.sub;
                }
            } catch (error) {
                console.error("Error extrayendo ID:", error);
            }
        }

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.id !== currentUserId) {
                    localStorage.removeItem('userProfileData');
                } else {
                    setUserData(parsed);
                    setFormData({
                        first_name: parsed.first_name,
                        last_name: parsed.last_name,
                        email: parsed.email
                    });
                    return;
                }
            } catch (error) {
                console.error('Error en localStorage:', error);
                localStorage.removeItem('userProfileData');
            }
        }

        if (dataUser?.Token) {
            try {
                const parts = dataUser.Token.split('.');
                if (parts.length === 3) {
                    const decoded = JSON.parse(atob(parts[1]));
                    const newData = {
                        id: decoded.sub,
                        first_name: decoded.first_name,
                        last_name: decoded.last_name,
                        dni: '',
                        email: decoded.email
                    };
                    setUserData(newData);
                    setFormData({
                        first_name: decoded.first_name,
                        last_name: decoded.last_name,
                        email: decoded.email
                    });
                    localStorage.setItem('userProfileData', JSON.stringify(newData));
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }, [dataUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            let userId = userData.id;
            if (!userId && dataUser?.Token) {
                try {
                    const parts = dataUser.Token.split('.');
                    if (parts.length === 3) {
                        const decoded = JSON.parse(atob(parts[1]));
                        userId = decoded.sub;
                    }
                } catch (error) {
                    console.error("Error extrayendo ID del token:", error);
                }
            }

            if (!userId) {
                setMessage('Error: No se pudo obtener el ID del usuario');
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:3000/user/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${dataUser?.Token}`
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            
            if (response.ok) {
                const updatedData = {
                    id: userData.id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    dni: userData.dni,
                    email: formData.email
                };
                setUserData(updatedData);
                
                localStorage.setItem('userProfileData', JSON.stringify(updatedData));

                setMessage('Datos actualizados correctamente');
                setIsEditing(false);
                setTimeout(() => setMessage(''), 3000);
            } else {
                const error = await response.text();
                console.error('Error response:', error);
                setMessage('Error al actualizar los datos');
            }
        } catch (error) {
            console.error('Error:', error);
            setMessage('Error al actualizar los datos');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email
        });
        setIsEditing(false);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Mis datos</h1>

            {message && (
                <div className={`mb-6 p-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
                {!isEditing ? (
                    <>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Nombre</label>
                                <p className="text-lg text-gray-800">{userData.first_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Apellido</label>
                                <p className="text-lg text-gray-800">{userData.last_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Email</label>
                                <p className="text-lg text-gray-800">{userData.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">DNI</label>
                                <p className="text-lg text-gray-800">{userData.dni}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Modificar
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Apellido</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                            >
                                {loading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}