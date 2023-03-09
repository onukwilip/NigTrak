import { Route, Routes } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./styles/App.scss";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";

const App = () => {
  const toogleOnline = (e) => {
    if (e?.type === "online") {
      alert("You are online");
    }
    if (e?.type === "offline") {
      alert("You are offline");
    }
  };

  useEffect(() => {
    window.addEventListener("online", toogleOnline);
    window.addEventListener("offline", toogleOnline);

    return () => {
      window.removeEventListener("online", toogleOnline);
      window.removeEventListener("offline", toogleOnline);
    };
  }, []);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home/*" element={<Home />} />
      </Routes>
    </div>
  );
};

export default App;
