import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
                    {/* Página principal redirige al login */}
                    <Route path="/" element={<Login />} />

                    {/* Página de login */}
                    <Route path="/login" element={<Login />} />

                    {/* Página de formulario (ya no protegida) */}
                    <Route path="/formulario" element={<Formulario />} />
                </Routes>
                <Footer />
            </Router>
        </AuthProvider>
    );
}

export default App;
