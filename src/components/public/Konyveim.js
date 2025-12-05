import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { myAxios } from '../../contexts/MyAxios';

const Konyveim = () => {
    const { user } = useAuth();
    const [sajatKonyvek, setSajatKonyvek] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showUjKonyvModal, setShowUjKonyvModal] = useState(false);
    const [showSzerkesztesModal, setShowSzerkesztesModal] = useState(false);
    const [kivalasztottKonyv, setKivalasztottKonyv] = useState(null);
    const [kepHiba, setKepHiba] = useState('');
    const [ujKonyvForm, setUjKonyvForm] = useState({
        cim: '',
        szerzo: '',
        kiado: '',
        kiadas_ev: '',
        kategoria: '',
        allapot: 'jó',
        leiras: '',
        kep: null,
        megjegyzes: '',
        statusz: 'elerheto'
    });
    const [szerkesztesForm, setSzerkesztesForm] = useState({
        statusz: 'elerheto',
        megjegyzes: ''
    });

    useEffect(() => {
        betoltSajatKonyvek();
    }, []);

    const betoltSajatKonyvek = async () => {
        try {
            setLoading(true);
            const response = await myAxios.get('/api/felhasznaloKonyvek');
            
            console.log('API válasz:', response.data);
            setSajatKonyvek(response.data || []);
        } catch (error) {
            console.error('Hiba a saját könyvek betöltésekor:', error);
            setError('Hiba történt a könyvek betöltésekor.');
        } finally {
            setLoading(false);
        }
    };

    // 🔥 SZERKESZTÉS MODAL MEGNYITÁSA
    const handleSzerkesztes = (konyv) => {
        setKivalasztottKonyv(konyv);
        setSzerkesztesForm({
            statusz: konyv.statusz,
            megjegyzes: konyv.megjegyzes || ''
        });
        setShowSzerkesztesModal(true);
    };

    // 🔥 SZERKESZTÉS MENTÉSE
    const handleSzerkesztesMentes = async () => {
        if (!kivalasztottKonyv) return;

        try {
            console.log('Szerkesztés mentése:', { 
                id: kivalasztottKonyv.id, 
                ujAdatok: szerkesztesForm 
            });
            
            await myAxios.put(`/api/felhasznaloKonyvModosit/${kivalasztottKonyv.id}`, {
                statusz: szerkesztesForm.statusz,
                megjegyzes: szerkesztesForm.megjegyzes
            });

            // 🔥 FRISSÍTJÜK A LOCAL STATE-ET
            setSajatKonyvek(prevKonyvek => 
                prevKonyvek.map(konyv => 
                    konyv.id === kivalasztottKonyv.id 
                        ? { 
                            ...konyv, 
                            statusz: szerkesztesForm.statusz,
                            megjegyzes: szerkesztesForm.megjegyzes
                        }
                        : konyv
                )
            );

            setShowSzerkesztesModal(false);
            setKivalasztottKonyv(null);
            
            console.log('✅ Szerkesztés sikeresen mentve');
            alert('A módosítások sikeresen elmentve!');
            
        } catch (error) {
            console.error('❌ Hiba a szerkesztés mentésekor:', error);
            alert('Hiba történt a módosítások mentésekor!');
        }
    };

    // 🔥 JAVÍTOTT KÉP URL GENERÁLÁS
    const getKepUrl = (konyv) => {
        if (!konyv?.konyv?.kep) {
            return 'http://localhost:8000/kepek/capaca.jpg';
        }
        
        const kepUtvonal = konyv.konyv.kep;
        return `http://localhost:8000/${kepUtvonal}`;
    };

    const handleKepValasztas = (e) => {
        const file = e.target.files[0];
        setKepHiba('');
        
        if (file) {
            const elfogadottTipusok = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
            if (!elfogadottTipusok.includes(file.type)) {
                setKepHiba('Csak JPG, PNG vagy GIF formátumú képek fogadhatók el!');
                return;
            }
            
            if (file.size > 2 * 1024 * 1024) {
                setKepHiba('A kép mérete nem haladhatja meg a 2MB-ot!');
                return;
            }
            
            setUjKonyvForm({...ujKonyvForm, kep: file});
        }
    };

    const handleUjKonyvFelvetele = async () => {
        if (!ujKonyvForm.cim || !ujKonyvForm.szerzo) {
            setError('Cím és szerző megadása kötelező!');
            return;
        }
        
        if (!ujKonyvForm.kep) {
            setKepHiba('Kötelező képet kiválasztani!');
            return;
        }

        try {
            const formData = new FormData();
            
            formData.append('cim', ujKonyvForm.cim);
            formData.append('szerzo', ujKonyvForm.szerzo);
            formData.append('kiado', ujKonyvForm.kiado);
            formData.append('kiadas_ev', ujKonyvForm.kiadas_ev);
            formData.append('kategoria', ujKonyvForm.kategoria);
            formData.append('allapot', ujKonyvForm.allapot);
            formData.append('leiras', ujKonyvForm.leiras);
            formData.append('kep', ujKonyvForm.kep);
            formData.append('megjegyzes', ujKonyvForm.megjegyzes);
            formData.append('statusz', ujKonyvForm.statusz);

            await myAxios.post('/api/konyvAdd', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            await betoltSajatKonyvek();
            
            setShowUjKonyvModal(false);
            setUjKonyvForm({
                cim: '',
                szerzo: '',
                kiado: '',
                kiadas_ev: '',
                kategoria: '',
                allapot: 'jó',
                leiras: '',
                kep: null,
                megjegyzes: '',
                statusz: 'elerheto'
            });
            setKepHiba('');
            setError('');
            
            alert('Könyv sikeresen hozzáadva a gyűjteményedhez!');
            
        } catch (error) {
            console.error('Hiba a könyv hozzáadásakor:', error);
            setError('Hiba történt a könyv hozzáadásakor.');
        }
    };

    const handleKonyvTorles = async (felhasznaloKonyvId) => {
        if (!window.confirm('Biztosan el szeretnéd távolítani ezt a könyvet a gyűjteményedből?')) {
            return;
        }

        try {
            await myAxios.delete(`/api/felhasznaloKonyvTorol/${felhasznaloKonyvId}`);
            await betoltSajatKonyvek();
            alert('Könyv sikeresen eltávolítva!');
        } catch (error) {
            console.error('Hiba a könyv törlésekor:', error);
            setError('Hiba történt a könyv törlésekor.');
        }
    };

    const getKepNev = () => {
        if (ujKonyvForm.kep) {
            return ujKonyvForm.kep.name;
        }
        return 'Nincs kép kiválasztva';
    };

    const getStatuszBadgeVariant = (statusz) => {
        switch (statusz) {
            case 'elerheto': return 'success';
            case 'foglalt': return 'warning';
            case 'elkelt': return 'secondary';
            default: return 'light';
        }
    };

    const getStatuszIcon = (statusz) => {
        switch (statusz) {
            case 'elerheto': return '✅';
            case 'foglalt': return '🔄';
            case 'elkelt': return '❌';
            default: return '❓';
        }
    };

    const getAllapotBadgeVariant = (allapot) => {
        switch (allapot) {
            case 'új': return 'success';
            case 'jó': return 'primary';
            case 'közepes': return 'warning';
            case 'elhasznált': return 'secondary';
            default: return 'light';
        }
    };

    if (loading) return <div className="text-center mt-4">Betöltés...</div>;

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Könyveim</h1>
                <Button 
                    variant="primary" 
                    onClick={() => setShowUjKonyvModal(true)}
                >
                    + Új könyv hozzáadása
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {sajatKonyvek.length === 0 ? (
                <div className="text-center py-5">
                    <h3>Még nincsenek könyveid a gyűjteményedben</h3>
                    <p className="text-muted">Add hozzá az első könyvedet a fenti gombbal!</p>
                </div>
            ) : (
                <Row>
                    {sajatKonyvek.map((felhasznaloKonyv, index) => {    
                        const kepUrl = getKepUrl(felhasznaloKonyv);
                        const uniqueKey = `konyv-${felhasznaloKonyv.id}-${index}`;

                        return (
                            <Col key={uniqueKey} lg={4} md={6} className="mb-4">
                                <Card className="h-100 shadow-sm">
                                    {/* KÉP RÉSZ */}
                                    <div className="text-center p-3 bg-light" style={{ minHeight: '200px' }}>
                                        <img 
                                            src={kepUrl}
                                            alt={felhasznaloKonyv.konyv?.cim || 'Könyv'}
                                            className="img-fluid rounded"
                                            style={{
                                                maxHeight: '180px',
                                                maxWidth: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </div>
                                    
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="h6">
                                            {felhasznaloKonyv.konyv?.cim}
                                        </Card.Title>
                                        <Card.Subtitle className="text-muted small mb-2">
                                            {felhasznaloKonyv.konyv?.szerzo}
                                        </Card.Subtitle>
                                        
                                        {/* STÁTUSZ ÉS BADGE-EK */}
                                        <div className="mb-2">
                                            <Badge bg={getStatuszBadgeVariant(felhasznaloKonyv.statusz)} className="me-1">
                                                {getStatuszIcon(felhasznaloKonyv.statusz)} {felhasznaloKonyv.statusz}
                                            </Badge>
                                            <Badge bg={getAllapotBadgeVariant(felhasznaloKonyv.konyv?.allapot)} className="me-1">
                                                {felhasznaloKonyv.konyv?.allapot}
                                            </Badge>
                                            <Badge bg="secondary">
                                                {felhasznaloKonyv.konyv?.kategoria}
                                            </Badge>
                                        </div>

                                        {/* KÖNYV INFÓK */}
                                        {felhasznaloKonyv.konyv?.kiado && (
                                            <p className="small mb-1">
                                                <strong>Kiadó:</strong> {felhasznaloKonyv.konyv.kiado}
                                            </p>
                                        )}

                                        {felhasznaloKonyv.konyv?.kiadas_ev && (
                                            <p className="small mb-1">
                                                <strong>Év:</strong> {felhasznaloKonyv.konyv.kiadas_ev}
                                            </p>
                                        )}

                                        {felhasznaloKonyv.megjegyzes && (
                                            <p className="small text-muted flex-grow-1">
                                                <strong>Megjegyzés:</strong> {felhasznaloKonyv.megjegyzes}
                                            </p>
                                        )}

                                        <div className="mt-auto pt-2">
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => handleSzerkesztes(felhasznaloKonyv)}
                                                    className="flex-grow-1"
                                                >
                                                    ✏️ Szerkesztés
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleKonyvTorles(felhasznaloKonyv.id)}
                                                    className="flex-grow-1"
                                                >
                                                    🗑️ Eltávolítás
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
            
            {/* 🔥 SZERKESZTÉS MODAL */}
            <Modal show={showSzerkesztesModal} onHide={() => setShowSzerkesztesModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        ✏️ Könyv szerkesztése - {kivalasztottKonyv?.konyv?.cim}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {kivalasztottKonyv && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <strong>Státusz</strong>
                                </Form.Label>
                                <Form.Select 
                                    value={szerkesztesForm.statusz}
                                    onChange={(e) => setSzerkesztesForm({
                                        ...szerkesztesForm, 
                                        statusz: e.target.value
                                    })}
                                >
                                    <option value="elerheto">✅ Elérhető (szeretném cserélni)</option>
                                    <option value="foglalt">🔄 Foglalt (épp cserélem)</option>
                                    <option value="elkelt">❌ Elkelt (már nincs meg)</option>
                                </Form.Select>
                                <Form.Text className="text-muted">
                                    Válaszd ki a könyv aktuális állapotát
                                </Form.Text>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <strong>Saját megjegyzés</strong>
                                </Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    value={szerkesztesForm.megjegyzes}
                                    onChange={(e) => setSzerkesztesForm({
                                        ...szerkesztesForm, 
                                        megjegyzes: e.target.value
                                    })}
                                    placeholder="Pl.: Kissé kopott a sarka, de olvasható..."
                                />
                                <Form.Text className="text-muted">
                                    Opcionális megjegyzés a könyvhöz
                                </Form.Text>
                            </Form.Group>

                            <div className="bg-light p-3 rounded small">
                                <strong>Könyv adatai:</strong><br />
                                <strong>Cím:</strong> {kivalasztottKonyv.konyv?.cim}<br />
                                <strong>Szerző:</strong> {kivalasztottKonyv.konyv?.szerzo}<br />
                                <strong>Állapot:</strong> {kivalasztottKonyv.konyv?.allapot}<br />
                                <strong>Kategória:</strong> {kivalasztottKonyv.konyv?.kategoria}
                            </div>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSzerkesztesModal(false)}>
                        Mégse
                    </Button>
                    <Button variant="primary" onClick={handleSzerkesztesMentes}>
                        💾 Módosítások mentése
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ÚJ KÖNYV MODAL (VÁLTOZATLAN) */}
            <Modal show={showUjKonyvModal} onHide={() => setShowUjKonyvModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Új könyv hozzáadása</Modal.Title>
                </Modal.Header>
                 <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cím *</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={ujKonyvForm.cim}
                                        onChange={(e) => setUjKonyvForm({...ujKonyvForm, cim: e.target.value})}
                                        placeholder="Könyv címe"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Szerző *</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={ujKonyvForm.szerzo}
                                        onChange={(e) => setUjKonyvForm({...ujKonyvForm, szerzo: e.target.value})}
                                        placeholder="Szerző neve"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Kiadó</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={ujKonyvForm.kiado}
                                        onChange={(e) => setUjKonyvForm({...ujKonyvForm, kiado: e.target.value})}
                                        placeholder="Kiadó neve"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Kiadás éve</Form.Label>
                                    <Form.Control 
                                        type="number"
                                        value={ujKonyvForm.kiadas_ev}
                                        onChange={(e) => setUjKonyvForm({...ujKonyvForm, kiadas_ev: e.target.value})}
                                        placeholder="pl. 2023"
                                        min="1900"
                                        max="2030"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Kategória</Form.Label>
                                    <Form.Control 
                                        type="text"
                                        value={ujKonyvForm.kategoria}
                                        onChange={(e) => setUjKonyvForm({...ujKonyvForm, kategoria: e.target.value})}
                                        placeholder="pl. Sci-fi, Dráma, Ismeretterjesztő"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Állapot</Form.Label>
                                    <Form.Select 
                                        value={ujKonyvForm.allapot}
                                        onChange={(e) => setUjKonyvForm({...ujKonyvForm, allapot: e.target.value})}
                                    >
                                        <option value="új">Új</option>
                                        <option value="jó">Jó</option>
                                        <option value="közepes">Közepes</option>
                                        <option value="elhasznált">Elhasznált</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Leírás</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                value={ujKonyvForm.leiras}
                                onChange={(e) => setUjKonyvForm({...ujKonyvForm, leiras: e.target.value})}
                                placeholder="Rövid leírás a könyvről..."
                            />
                        </Form.Group>

                        {/* KÖTELEZŐ KÉP RÉSZ */}
                        <Form.Group className="mb-3">
                            <Form.Label>Borítókép *</Form.Label>
                            <Form.Control 
                                type="file"
                                accept="image/jpeg, image/png, image/jpg, image/gif"
                                onChange={handleKepValasztas}
                                required
                            />
                            {ujKonyvForm.kep && (
                                <div className="mt-2">
                                    <Badge bg="success">Kiválasztva: {getKepNev()}</Badge>
                                </div>
                            )}
                            {kepHiba && (
                                <div className="text-danger small mt-1">{kepHiba}</div>
                            )}
                            <Form.Text className="text-muted">
                                Kötelező képet kiválasztani! (JPG, PNG, GIF, max 2MB)
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Saját megjegyzés</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={2}
                                value={ujKonyvForm.megjegyzes}
                                onChange={(e) => setUjKonyvForm({...ujKonyvForm, megjegyzes: e.target.value})}
                                placeholder="Pl.: Kissé kopott a sarka, de olvasható..."
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Státusz</Form.Label>
                            <Form.Select 
                                value={ujKonyvForm.statusz}
                                onChange={(e) => setUjKonyvForm({...ujKonyvForm, statusz: e.target.value})}
                            >
                                <option value="elerheto">Elérhető (szeretném cserélni)</option>
                                <option value="foglalt">Foglalt (épp cserélem)</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUjKonyvModal(false)}>
                        Mégse
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleUjKonyvFelvetele}
                        disabled={!ujKonyvForm.cim || !ujKonyvForm.szerzo || !ujKonyvForm.kep}
                    >
                        Könyv hozzáadása
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Konyveim;