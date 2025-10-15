import React from 'react';
import Card from 'react-bootstrap/Card';

//Prop-k átadása: A obj prop a vízi lény adatokat tartalmazza, és a onSelect callback funkció meghívásra kerül, ha a felhasználó rákattint a kártyára.
export default function Konyv({ obj, onSelect }) {
    const kattintasKezeles = () => {
        if (onSelect) {
            onSelect(obj); // Kiválasztja a vizilényt
        }
    };
//onClick eseménykezelés: A komponens a felhasználói interakciót kezeli, és megfelelően frissíti a szülő komponenst a kiválasztott vízi lény adataival.
    return (
        <div className="d-flex justify-content-center mb-4" onClick={kattintasKezeles}>
            <Card className="custom-card">
                <Card.Img variant="top" src={"http://localhost:8000/" + obj.kep} />
                <Card.Body>
                    <Card.Title>{obj.cim}</Card.Title>
                </Card.Body>
            </Card>
        </div>
    );
}
// Ez egy önálló kártyakomponens, amely egyetlen elemet jelenit meg