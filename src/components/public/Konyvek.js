import React, { useEffect, useState } from 'react';
import './Konyv.css';
import { Row, Col, Modal, Button, Card, Badge } from 'react-bootstrap';
import { myAxios } from '../../contexts/MyAxios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 🔥 IMPORTÁLD

const Konyvek = () => {
    const [konyvek, setKonyvek] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [selectedKonyv, setSelectedKonyv] = useState(null); 
    const [showModal, setShowModal] = useState(false);
    const [expandedKonyvId, setExpandedKonyvId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate(); // 🔥 HOZD LÉTRE

   useEffect(() => {
    console.log('Token:', localStorage.getItem('token'));
    console.log('User:', localStorage.getItem('user'));

    myAxios.get('/api/konyvek')
      .then(response => {
        console.log('Sikeres válasz:', response.data);
        const data = response.data || [];
        setKonyvek(data); 
        setLoading(false); 
      })
      .catch(err => {
        console.error('Hiba részletei:', err.response?.data);
        setError(err.response?.data?.message || err.message); 
        setLoading(false); 
      });
}, []);

    const handleSelectKonyv = (konyv) => {
        setSelectedKonyv(konyv);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedKonyv(null);
    };

    const handleToggleDetails = (konyvId) => {
        if (expandedKonyvId === konyvId) {
            setExpandedKonyvId(null);
        } else {
            setExpandedKonyvId(konyvId);
        }
    };

    const handleRequestBook = (konyv) => {
        if (!user) {
            alert('Előbb be kell jelentkezned!');
            return;
        }
        
        console.log('Könyv kérése:', konyv);
        
        // 🔥 ÁTNAVIGÁLÁS A CSERE OLDALRA
        navigate('/csere-ajanlat', { 
            state: { 
                kivalasztottKonyv: konyv 
            } 
        });
    };

    if (loading) return <div className="text-center mt-4">Betöltés...</div>;
    if (error) return <div className="alert alert-danger mt-4">Hiba: {error}</div>;

    return (
        <div className="container mt-4">
            <div className='text-center mb-4'>
                <h1>Könyvek</h1>
                <p className="text-muted">Kattints a "Részletek" gombra a könyv információk megtekintéséhez</p>
            </div>

            <Row>
                {konyvek.map((konyv, index) => (
                    <Col 
                        key={konyv.konyv_id || index} 
                        xl={3} lg={4} md={6} sm={6}
                        className="mb-4"
                    >
                        <Card className="shadow-sm book-card h-100">
                            <div className="row g-0 h-100">
                                {/* Könyv kép */}
                                <div className="col-12">
                                    <div className="d-flex align-items-center justify-content-center p-3 bg-light">
                                        <img 
                                            src={"http://localhost:8000/" + (konyv.kep || '')}
                                            alt={konyv.cim}
                                            className="img-fluid rounded"
                                            style={{ 
                                                maxHeight: '180px',
                                                objectFit: 'cover',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                            }}
                                            onError={(e) => {
                                                e.target.src = '/images/default-book.jpg';
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Könyv információ */}
                                <div className="col-12">
                                    <Card.Body className="h-100 d-flex flex-column p-3">
                                        {/* Alap információk - mindig látszik */}
                                        <div className="basic-info text-center">
                                            <Card.Title className="h6 mb-1">{konyv.cim}</Card.Title>
                                            <Card.Subtitle className="text-muted small mb-2">{konyv.szerzo}</Card.Subtitle>
                                            
                                            {/* Állapot és kategória badge-ek */}
                                            <div className="mb-2">
                                                <Badge bg={getStatusBadgeVariant(konyv.allapot)} className="me-1 small">
                                                    {konyv.allapot || 'Ismeretlen'}
                                                </Badge>
                                                <Badge bg="secondary" className="small">
                                                    {konyv.kategoria || 'Kategória'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Részletes információk - csak ha kinyitva van */}
                                        {expandedKonyvId === konyv.konyv_id && (
                                            <div className="detailed-info flex-grow-1 mt-2">
                                                <div className="book-details small">
                                                    <div className="mb-2">
                                                        <strong>Kiadó:</strong><br />
                                                        <span className="text-muted">{konyv.kiado || 'Nincs megadva'}</span>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Év:</strong><br />
                                                        <span className="text-muted">{konyv.kiadas_ev || 'Nincs megadva'}</span>
                                                    </div>
                                                </div>

                                                {konyv.leiras && (
                                                    <div className="description-section">
                                                        <strong>Leírás:</strong>
                                                        <p className="text-muted small mb-0" style={{ fontSize: '0.8rem' }}>
                                                            {konyv.leiras.length > 100 
                                                                ? `${konyv.leiras.substring(0, 100)}...` 
                                                                : konyv.leiras
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Gomb szekció */}
                                        <div className="mt-auto pt-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Button 
                                                    variant={expandedKonyvId === konyv.konyv_id ? "outline-secondary" : "outline-primary"}
                                                    size="sm"
                                                    onClick={() => handleToggleDetails(konyv.konyv_id)}
                                                    className="flex-grow-1 me-1"
                                                >
                                                    {expandedKonyvId === konyv.konyv_id ? '✖️ Bezár' : '📚 Részletek'}
                                                </Button>
                                                
                                                {expandedKonyvId === konyv.konyv_id && (
                                                    <Button 
                                                        variant="success" 
                                                        size="sm"
                                                        onClick={() => handleRequestBook(konyv)}
                                                        className="flex-grow-1 ms-1"
                                                    >
                                                        {user ? '🔄 Csere' : '🔐'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal részletekhez */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Könyv részletei</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedKonyv && (
                        <div className="text-center">
                            <img 
                                src={"http://localhost:8000/" + (selectedKonyv.kep || '')}
                                alt={selectedKonyv.cim}
                                className="img-fluid mb-3 rounded"
                                style={{ maxHeight: '300px' }}
                                onError={(e) => {
                                    e.target.src = '/images/default-book.jpg';
                                }}
                            />
                            <h4>{selectedKonyv.cim}</h4>
                            <h5 className="text-muted">{selectedKonyv.szerzo}</h5>
                            <div className="my-3">
                                <Badge bg={getStatusBadgeVariant(selectedKonyv.allapot)} className="me-2">
                                    {selectedKonyv.allapot}
                                </Badge>
                                <Badge bg="secondary">
                                    {selectedKonyv.kategoria}
                                </Badge>
                            </div>
                            <p><strong>Kiadó:</strong> {selectedKonyv.kiado}</p>
                            <p><strong>Kiadás éve:</strong> {selectedKonyv.kiadas_ev}</p>
                            <p>{selectedKonyv.leiras || 'Nincs leírás.'}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Bezárás
                    </Button>
                    <Button variant="primary" onClick={() => handleRequestBook(selectedKonyv)}>
                        {user ? '🔄 Csere ajánlat' : 'Bejelentkezés szükséges'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const getStatusBadgeVariant = (allapot) => {
    switch (allapot) {
        case 'új': return 'success';
        case 'jó': return 'primary';
        case 'közepes': return 'warning';
        case 'elhasznált': return 'secondary';
        default: return 'light';
    }
};

export default Konyvek;