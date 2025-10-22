
import { Link, Outlet, useLocation } from "react-router-dom";
import "./Layout.css";
import { Container } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  return (
    <div className="App">
      <header className="app-header">
        <Container>
          <div className="header-content">
            <div className="logo-section">
              <h1 className="site-title">📚 Könyvek Bolja</h1>
              <p className="site-subtitle">Találd meg álmaid könyvét!</p>
            </div>
            
            {user && (
              <div className="user-info">
                <div className="user-greeting">
                  <span className="welcome-text">Üdvözöljük,</span>
                  <span className="user-name">{user.name || user.nev || user.email}!</span>
                </div>
                {user.szerep === "admin" && (
                  <span className="admin-badge">👑 Admin</span>
                )}
              </div>
            )}
          </div>
        </Container>
      </header>

      <nav className="main-navigation">
        <Container>
          <div className="nav-content">
            <div className="nav-links">
              {user ? (
                <>
                  <Link to="/konyv" className="nav-link">
                    <span className="nav-icon">📚</span>
                    Összes Könyv
                  </Link>
                  
                  <Link to="/konyveim" className="nav-link">
                    <span className="nav-icon">📖</span>
                    Könyveim
                  </Link>

                  <Link to="/profil" className="nav-link">
                    <span className="nav-icon">👤</span>
                    Profilom
                  </Link>
                  
                  {user.szerep === "admin" && (
                    <Link to="/admin" className="nav-link">
                      <span className="nav-icon">⚙️</span>
                      Admin Felület
                    </Link>
                  )}
                </>
              ) : (
                <div className="public-links">
                  <Link to="/" className="nav-link">
                    <span className="nav-icon">🏠</span>
                    Kezdőlap
                  </Link>
                </div>
              )}
            </div>

            <div className="auth-section">
              {user ? (
                <div className="user-actions">
                  <span className="user-status">
                    {user.szerep === 'admin' ? '👑 Admin' : 'Felhasználó'}
                  </span>
                  <button 
                    onClick={logout}
                    className="logout-btn"
                  >
                    <span className="btn-icon">🚪</span>
                    Kijelentkezés
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/regisztralas" className="register-btn">
                    <span className="btn-icon">📝</span>
                    Regisztráció
                  </Link>
                  
                  <Link to="/bejelentkezes" className="login-btn">
                    <span className="btn-icon">🔐</span>
                    Bejelentkezés
                  </Link>
                </div>
              )}
            </div>
          </div>
        </Container>
      </nav>

      <main className="app-main">
        <Container>
          <div className="content-wrapper">
            {/* Opcionális: csak a kezdőlapon mutasd a hero szekciót */}
            {!user && isHomePage && (
              <div className="home-content">
                <div className="hero-section text-center py-5">
                  <h1 className="hero-title">Üdvözöljük a Könyvek Boljában! 📚</h1>
                  <p className="hero-subtitle">
                    Fedezd fel a közösség könyveit, cserélj másokkal, és találd meg álmaid könyvét!
                  </p>
                </div>

                <div className="features-section mt-5">
                  <div className="row">
                    <div className="col-md-6 mb-4">
                      <div className="feature-item p-4 text-center">
                        <div className="feature-icon">🔄</div>
                        <h4>Könyvcsere</h4>
                        <p>Cseréld le olvasott könyveidet másokéra</p>
                      </div>
                    </div>
                    <div className="col-md-6 mb-4">
                      <div className="feature-item p-4 text-center">
                        <div className="feature-icon">👥</div>
                        <h4>Közösség</h4>
                        <p>Csatlakozz könyvszerető emberekhez</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* MINDIG rendereld az Outlet-et, hogy a router működjön */}
            <Outlet />
          </div>
        </Container>
      </main>

      <footer className="app-footer">
        <Container>
          <div className="footer-content">
            <div className="footer-section">
              <h5>Könyvek Bolja</h5>
              <p>Könyvcserélő közösség, ahol álmaid könyvével találkozhatsz.</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; Minden jog fenntartva.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;