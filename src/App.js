import { Route, Routes } from "react-router-dom";
import "./App.css";

import NoPage from "./pages/Nopage";
import Public from "./pages/Public";
import Konyvek from "./components/public/Konyvek";
import Layout from "./pages/Layout";
import Profil from "./pages/Profil";
import CsereAjanlat from "./components/public/CsereAjanlat";
import Konyveim from "./components/public/Konyveim";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <div>
      <div>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/*" element={<Public />} />
            <Route path="*" element={<NoPage />} />
            <Route path="/konyv" element={<Konyvek />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/csere-ajanlat" element={<CsereAjanlat />} />
            <Route path="/konyveim" element={<Konyveim />} />
            <Route path="/elfelejtett-jelszo" element={<ForgotPassword />} />
            <Route path="/password-reset" element={<ResetPassword />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
