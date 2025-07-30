import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = () => {
    const { isLoggedIn } = useAuth();

    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export const ProtectedRouteLogin = () => {
    const { isLoggedIn } = useAuth();

    return isLoggedIn ? <Navigate to="/formulario" replace /> : <Outlet />;
};

// En tus rutas protegidas
export const ProtectedAdmin = () => {
    const { rol } = useAuth();

    if (Number(rol) !== 1) {
        alert('Acceso denegado: esta sección es solo para administradores.');
        return <Navigate to="/formulario" replace />;
    }

    return <Outlet />;
};

