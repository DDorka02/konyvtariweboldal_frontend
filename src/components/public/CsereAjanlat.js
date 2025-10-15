// CsereAjanlat.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { myAxios } from '../../contexts/MyAxios';


const CsereAjanlat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [kivalasztottKonyv, setKivalasztottKonyv] = useState(null);
    const [sajatKonyvek, setSajatKonyvek] = useState([]);
    const [kivalasztottSajatKonyv, setKivalasztottSajatKonyv] = useState('');
    const [uzenet, setUzenet] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Könyv adatok betöltése
        if (location.state?.kivalasztottKonyv) {
            setKivalasztottKonyv(location.state.kivalasztottKonyv);
        } else {
            navigate('/konyv'); // Vissza a könyvekhez, ha nincs kiválasztott könyv
        }

        // Felhasználó saját könyveinek betöltése
        betoltSajatKonyvek();
    }, [location, navigate]);

    const betoltSajatKonyvek = async () => {
        try {
            const response = await myAxios.get('/api/felhasznaloKonyvek');
            setSajatKonyvek(response.data || []);
        } catch (error) {
            console.error('Hiba a saját könyvek betöltésekor:', error);
        }
    };

    const handleKuldCsereAjanlat = async () => {
        if (!kivalasztottSajatKonyv) {
            setError('Válassz ki egy könyvet a cseréhez!');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const csereAdatok = {
                kert_konyv_id: kivalasztottKonyv.konyv_id,
                ajanlott_konyv_id: kivalasztottSajatKonyv,
                uzenet: uzenet,
                statusz: 'fuggo'
            };

            await myAxios.post('/api/csereAdd', csereAdatok);
            
            setSuccess('Csere ajánlat sikeresen elküldve!');
            setTimeout(() => {
                navigate('/konyv');
            }, 2000);

        } catch (error) {
            console.error('Hiba a csere ajánlat küldésekor:', error);
            setError('Hiba történt a csere ajánlat küldésekor.');
        } finally {
            setLoading(false);
        }
    };

    if (!kivalasztottKonyv) {
        return <div>Betöltés...</div>;
    }

    return (
        <Container className="mt-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="text-center mb-4">Csere Ajánlat</h2>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Row>
                        {/* Kiválasztott könyv */}
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h5>Kért könyv</h5>
                                </Card.Header>
                                <Card.Body className="text-center">
                                    <img 
                                        src={"http://localhost:8000/" + (kivalasztottKonyv.kep || '')}
                                        alt={kivalasztottKonyv.cim}
                                        className="img-fluid mb-3 rounded"
                                        style={{ maxHeight: '200px' }}
                                        onError={(e) => {
                                            e.target.src = '/images/default-book.jpg';
                                        }}
                                    />
                                    <h6>{kivalasztottKonyv.cim}</h6>
                                    <p className="text-muted">{kivalasztottKonyv.szerzo}</p>
                                    <p><small>Állapot: {kivalasztottKonyv.allapot}</small></p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Saját könyv választása */}
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Header>
                                    <h5>Ajánlott könyv</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Válaszd ki a cserébe ajánlott könyved</Form.Label>
                                            <Form.Select 
                                                value={kivalasztottSajatKonyv}
                                                onChange={(e) => setKivalasztottSajatKonyv(e.target.value)}
                                            >
                                                <option value="">Válassz könyvet...</option>
                                                {sajatKonyvek.map(konyv => (
                                                    <option key={konyv.konyv_id} value={konyv.konyv_id}>
                                                        {konyv.cim} - {konyv.szerzo} ({konyv.allapot})
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Üzenet (opcionális)</Form.Label>
                                            <Form.Control 
                                                as="textarea" 
                                                rows={3}
                                                value={uzenet}
                                                onChange={(e) => setUzenet(e.target.value)}
                                                placeholder="Írj üzenetet a könyv tulajdonosának..."
                                            />
                                        </Form.Group>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className="text-center mt-4">
                        <Button 
                            variant="primary" 
                            size="lg"
                            onClick={handleKuldCsereAjanlat}
                            disabled={loading || !kivalasztottSajatKonyv}
                        >
                            {loading ? 'Küldés...' : '🔄 Csere ajánlat küldése'}
                        </Button>
                        
                        <Button 
                            variant="secondary" 
                            size="lg"
                            className="ms-2"
                            onClick={() => navigate('/konyv')}
                        >
                            Mégse
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default CsereAjanlat;