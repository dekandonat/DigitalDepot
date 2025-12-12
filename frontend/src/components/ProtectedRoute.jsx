import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }){
    const token = localStorage.getItem('token');

    if(!token){
        return <Navigate to = "/" replace />
    }

    try{
        const decodedToken = jwtDecode(token);

        if(decodedToken.exp * 1000 < Date.now()){
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('email');
            return <Navigate to = "/" replace />
        }

        if(decodedToken.role !== 'admin'){
            return <Navigate to = "/" replace />
        }
    }
    catch(error){
        localStorage.clear();
        return <Navigate to = "/" replace />
    }

    return children;
};