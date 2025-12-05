import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Profil() {
  const { logout, isLoggedIn, user, updateUserData } = useContext(AuthContext);
  const [username, setUsername] = useState(user?.name || "");
  const [tempUsername, setTempUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [tempEmail, setTempEmail] = useState("");
  const [password, setPassword] = useState("");  
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/bejelentkezes");
    }
  }, [isLoggedIn, navigate]);  // Ha a user nincs bejelentkezve, irányítson át
  
  useEffect(() => {
    if (user) {
      setUsername(user.name || "Ismeretlen felhasználó");
      setTempUsername(user.name || "");
      setEmail(user.email || ""); 
      setTempEmail(user.email || "");
    }
  }, [user]);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.name);
      setEmail(user.email);
    }
  }, []);
  
  useEffect(() => {
    if (!user || !user.azonosito) {
      console.error("Nincs bejelentkezett felhasználó vagy hiányzó azonosító.");
      return;
    }
  
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get-user/${user.azonosito}`, { //http kérést küld hogy frissitse a a felhasználó adatokat backendből
          method: 'GET',
          credentials: 'include',
        });
  
        if (!response.ok) throw new Error("Felhasználó nem található");
  
        const data = await response.json();
        setUsername(data.user.name);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch (error) {
        console.error("Hiba a felhasználó lekérésekor:", error);
      }
    };
  
    fetchUser();
  }, [user?.azonosito]); // Ellenőrizzük, hogy van-e user és azonosítója
  
  
  
  
  const getCsrfToken = () => {
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  };
  
  const handleSave = async () => {
    if (!user || !user.azonosito) {
      console.error("Felhasználói ID nem található.");
      return;
    }

  
    try {
      const updates = {
        name: tempUsername || username,
        email: tempEmail || email,
      };
  
      if (password.trim() !== "") {
        updates.password = password;
      }
  
      const response = await fetch(`http://localhost:8000/api/update-user/${user.azonosito}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": getCsrfToken(),
        },
        credentials: "include",
        body: JSON.stringify(updates),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Hiba történt az adatok frissítésekor");
      }
  
      setUsername(data.user.name);
      setTempUsername(data.user.name);
      setEmail(data.user.email);
      setTempEmail(data.user.email);
      
    
  
      localStorage.setItem("user", JSON.stringify(data.user));
  
      await updateUserData();
      console.log("Adatok sikeresen frissítve:", data);
    } catch (error) {
      console.error("Hiba a mentéskor:", error);
    }
  };
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6} className="text-center">
          <Card className="profile-card">
            <Card.Body>
              <div className="profile-section mt-4">

                {/* Felhasználói adatok megjelenítése */}
                <div className="user-info mt-4 text-center">
                  <h4>Profil Információk</h4>
                  <p><strong>Felhasználónév:</strong> {username || "Nincs megadva"}</p>
                  <p><strong>Email cím:</strong> {email || "Nincs email megadva"}</p>
                </div>

                {/* Felhasználónév módosítása */}
                <Form.Group controlId="username" className="mt-3">
                  <Form.Label>Felhasználói név módosítása:</Form.Label>
                  <Form.Control
                    type="text"
                    value={tempUsername}
                    onChange={(e) => setTempUsername(e.target.value)} // Csak a tempUsername frissül
                    placeholder="Írd be a neved..."
                  />


                </Form.Group>

                <Form.Group controlId="email" className="mt-3">
                  <Form.Label>Email cím módosítása:</Form.Label>
                  <Form.Control
                    type="email"
                    value={tempEmail} // 🔹 Most már a tempEmail-t használja
                    onChange={(e) => setTempEmail(e.target.value)} // 🔹 Csak a tempEmail frissül
                    placeholder="Írd be az email címed..."
                  />
                </Form.Group>


                {/* Jelszó módosítása */}
                <Form.Group controlId="password" className="mt-3">
                  <Form.Label>Jelszó módosítása:</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Írd be az új jelszót..."
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mt-4">
                  <Button variant="danger" onClick={logout}> 
                    Kijelentkezés
                  </Button>

                  <Button variant="primary" onClick={handleSave}>
                    Mentés
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}