import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import "../App.css";

export default function Bejelentkezes() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState(null);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  function handleSubmit(event) {
    event.preventDefault();
    const adat = {
      email: email,
      password: password,
    };
    console.log("Bejelentkezés sikeres:", adat);
    login(adat);
  }

  const handleClick = () => {
    navigate("/regisztralas");
  };

  const handleForgotPassword = () => {
    navigate("/elfelejtett-jelszo"); // A megfelelő oldalra navigálás
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={6} className="bejelentkezes">
          <h2 className="text-center">Bejelentkezés</h2>
          {error && <p className="text-danger text-center">{error}</p>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Add meg az email címed"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Jelszó</Form.Label>
              <Form.Control
                type="password"
                placeholder="Add meg a jelszavad"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Bejelentkezés
            </Button>
          </Form>
          <button onClick={handleForgotPassword} className="btn btn-link">
            Elfelejtett jelszó?
          </button>
        </Col>
        <Col xs={6} className="textdoboz">
          <h2>Üdvözöllek a Könyvek boltja weboldalán!</h2>
          <p>Ha van már fiókod, kérlek jelentkezz be!<br />
   Regisztrálni alul a regisztráció gombra kattintva lehet. ⇣</p>
          <img
            src="/kepek/hal.png"
            alt="Bejelentkezés illusztráció"
            className="bejelentkezes-kep"
            style={{ width: "100%", height: "auto" }} 
          />
        </Col>
        {/* Regisztrációs rész */}
        <Col xs={12} className="regisztracio">
          <div className="text-center mt-3">
            <p>
              Nincs még fiókod?{" "}
              <button onClick={handleClick} className="btn btn-link">
                Regisztráció
              </button>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}