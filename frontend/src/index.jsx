import React from "react"; 
import { StrictMode } from "react";
import ReactDOM from "react-dom/client"; 
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx"; 
import "./main.css";

const entryPoint = document.getElementById("root"); 
ReactDOM.createRoot(entryPoint).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);