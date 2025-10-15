import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";
import { Button, Modal } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const { user, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const email = document.getElementById("layout-email").value;
    const password = document.getElementById("layout-password").value;
    
    if (!email || !password) {
      alert("Email és jelszó megadása kötelező!");
      return;
    }
    
    try {
      await login({ email, password });
      setShowLogin(false);
    } catch (error) {
      alert("Bejelentkezési hiba: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLogin(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Könyvek Bolja</h1>
      </header>
      
      {/* FŐ NAVIGÁCIÓ */}
      <nav className="main-navigation">
        {/* BAL OLDALI LINKJEK */}
        <div className="nav-left">
          {user && (
            <>
              <Link to="/konyv" className="nav-link">
                📚 Könyvek
              </Link>
              
              {user.szerep === "admin" && (
                <Link to="/admin" className="nav-link">
                  ⚙️ Admin
                </Link>
              )}
              
              <Link to="/profil" className="nav-link">
                👤 Profilom
              </Link>
              
              <Link to="/konyveim" className="nav-link">
                📖 Könyveim
              </Link>
            </>
          )}
        </div>

        {/* JOBB OLDALI GOMBOK */}
        <div className="nav-right">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="user-welcome">
                Üdv, {user.name}!
              </span>
              <button 
                onClick={logout}
                className="nav-button logout"
              >
                Kijelentkezés
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLoginClick}
              className="nav-button"
            >
              Bejelentkezés
            </button>
          )}
        </div>
      </nav>

      {/* BEJELENTKEZÉSI MODAL */}
      <Modal show={showLogin} onHide={() => setShowLogin(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Bejelentkezés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="layout-email" className="form-label">Email</label>
            <input 
              id="layout-email"
              type="email" 
              placeholder="email@example.com" 
              className="form-control" 
            />
          </div>
          <div className="mb-3">
            <label htmlFor="layout-password" className="form-label">Jelszó</label>
            <input 
              id="layout-password"
              type="password" 
              placeholder="Jelszó" 
              className="form-control" 
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogin(false)}>
            Mégse
          </Button>
          <Button variant="primary" onClick={handleLogin}>
            Belépés
          </Button>
        </Modal.Footer>
      </Modal>

      {/* TARTALOM */}
      <div className="App-content">
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;