"use client"

import { useFormik } from "formik";
import { initialValuesLogin, loginValidationSchema } from "../../validators/loginSchema";
import { useState } from "react";
import { loginUserService } from "@/utils/auth.helper";
import { ILoginFormValues } from "@/interfaces/ILoginFormValues";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const LoginForm = () => {

    const { setDataUser } = useAuth()
    const router = useRouter();

    const formik = useFormik<ILoginFormValues>({
        initialValues: initialValuesLogin,
        validationSchema: loginValidationSchema,
        onSubmit: async (values, {resetForm}) => {
            const response = await loginUserService(values);
            setDataUser(response); 
            console.log("Sesión iniciada", response);
            resetForm()
            router.push('/')
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
            <form className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-blue-200" onSubmit={formik.handleSubmit}>

                <h1 className="text-xl font-semibold text-center text-gray-800 mb-6">
                Inicia sesión en Vita Red
                </h1>

                <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="email"
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                />
                <p className="text-sm text-red-600 mt-1 min-h-5">{formik.errors.email ?? ""}</p>
                </div>
                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="••••••••"
                        type="password"
                        id="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                    />
                    <p className="text-sm text-red-600 mt-1 min-h-[20px]">{formik.errors.password ?? ""}</p>
                </div>
                <div className="flex flex-col items-center">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition" type="submit" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">¿No tenés cuenta?{" "}
                <a href="/auth/register" className="text-blue-600 hover:underline">
                    Registrate
                </a>
                </p>

                </div>
            </form>
        </div>
    )
}

export default LoginForm