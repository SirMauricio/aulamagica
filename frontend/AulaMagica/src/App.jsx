import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, ProtectedRouteLogin, ProtectedAdmin } from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import Header from "./componentes/header";
import Footer from "./componentes/footer";
import Login from "./componentes/login";
import Formulario from "./componentes/Formulario";
import Dashboard from "./componentes/Dashboard";
import PrivacyPolicy from "./componentes/infoPoliticas";


function App() {
    return (
        <AuthProvider>
            <Router>
                <Header />
                <Routes>
                    {/* Redirige desde / al login si no está logueado */}
                    <Route path="/" element={<ProtectedRouteLogin />}>
                        <Route index element={<Login />} />
                    </Route>

                    {/* Página de login */}
                    <Route path="/login" element={<ProtectedRouteLogin />}>
                        <Route index element={<Login />} />
                    </Route>

                    {/* Rutas protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/formulario" element={<Formulario />} />
                        {/* Agrega aquí más rutas protegidas */}
                    </Route>

                    {/* Admin */}
                    <Route element={<ProtectedAdmin />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Route>

                    <Route path="/privacidad" element={<PrivacyPolicy />} />

                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;