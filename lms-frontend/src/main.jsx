import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Animated background (gradient + image) */}
    <div className="lms-bg-animated" />
    <div className="lms-bg-image" />
    <div className="lms-bg-overlay" />

    <App />
  </React.StrictMode>
);
