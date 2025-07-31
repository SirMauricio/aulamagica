import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ProtectedRoute, ProtectedRouteLogin, ProtectedAdmin } from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";
import Header from "./views/header";
import Footer from "./views/footer";
import Login from "./views/login";
import Formulario from "./views/formulario";



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


                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;