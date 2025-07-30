// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setLoggedIn] = useState(() => { 
        const storedState = localStorage.getItem('isLoggedIn');
    return storedState ? JSON.parse(storedState) : false;
    });

    const [rol, setRol] = useState(() => { 
        const storedState = localStorage.getItem('rol');
    return storedState ? JSON.parse(storedState) : null;
    });

    useEffect(() => {
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    }, [isLoggedIn]);

    useEffect(() => {
        localStorage.setItem('rol', JSON.stringify(rol));
    }, [rol]);

const login = (userData) => {
    setLoggedIn(true);
    setRol(Number(userData.rol));  // FORZAR A NÚMERO
};


    const logout = () => {
        setLoggedIn(false);
        setRol(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('rol');
    };

    const val = {
        isLoggedIn,
        rol,
        login,
        logout,
    };

    return <AuthContext.Provider value={val}>{children}</AuthContext.Provider>;
};
