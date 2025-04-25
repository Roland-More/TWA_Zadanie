import React from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import { FaTrashAlt, FaExchangeAlt, FaUserGraduate } from 'react-icons/fa';

function StudentsCards({ students, rooms, onDelete, onMove }) {
  return (
    <Row>
      {students.map((s) => (
        <Col md={6} lg={4} className="mb-4" key={s.id_ziak}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title>
                <FaUserGraduate className="me-2 mb-1" />
                {s.meno} {s.priezvisko}
              </Card.Title>
              <Card.Text>
                <strong>Dátum narodenia:</strong> {new Date(s.datum_narodenia).toLocaleDateString('sk-SK')}<br />
                <strong>Email:</strong> {s.email}<br />
                <strong>Adresa:</strong> {s.ulica}, {s.mesto} {s.PSC}<br />
                <strong>Izba:</strong> {rooms.find(r => r.id_izba === s.id_izba)?.cislo || 'Neznáma'}
              </Card.Text>
              <div className="d-flex justify-content-between">
                <Button variant="outline-primary" size="sm" onClick={() => onMove(s)}>
                  <FaExchangeAlt className="me-1" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }} /> Zmeniť izbu
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(s.id_ziak)}>
                  <FaTrashAlt className="me-1 " style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }} /> Odstrániť
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default StudentsCards;
