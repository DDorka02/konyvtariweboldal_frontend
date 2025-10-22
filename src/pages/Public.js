import React from "react";
import { Routes, Route } from "react-router-dom";
import Bejelentkezes from "./Bejelentkezes";
import Regisztralas from "./Regisztralas";


export default function Public() {
  return (
    <div>
      <Routes>
        {/* Bejelentkezés és regisztráció */}
        <Route path="/bejelentkezes" element={<Bejelentkezes />} />
        <Route path="/regisztralas" element={<Regisztralas />} />
      </Routes>
    </div>
  );
}