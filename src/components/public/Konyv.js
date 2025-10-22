import React from 'react';
import Card from 'react-bootstrap/Card';

export default function Konyv({ obj, onSelect }) {
    const kattintasKezeles = () => {
        if (onSelect) {
            onSelect(obj);
        }
    };
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
