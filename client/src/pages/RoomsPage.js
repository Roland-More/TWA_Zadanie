import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Button, Modal, Form } from 'react-bootstrap';
import { FaBed, FaTrashAlt, FaPlus, FaExchangeAlt } from 'react-icons/fa';
import ChangeRoomModal from '../components/ChangeRoom';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomCislo, setNewRoomCislo] = useState('');
  const [newRoomKapacita, setNewRoomKapacita] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRoomId, setNewRoomId] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, studentsRes] = await Promise.all([
          fetch(`${API_URL}/izba/read`).then(res => res.json()),
          fetch(`${API_URL}/ziak/read`).then(res => res.json())
        ]);
        setRooms(roomsRes);
        setStudents(studentsRes);
        setLoading(false);
      } catch (err) {
        console.error("Chyba pri načítaní:", err);
        setError("Nepodarilo sa načítať údaje.");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const getStudentsForRoom = (roomId) => {
    return students.filter(s => s.id_izba === roomId);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Naozaj chcete odstrániť túto izbu?")) return;
    try {
      const res = await fetch(`${API_URL}/izba/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_izba: roomId })
      });
      if (!res.ok) throw new Error("Chyba pri odstraňovaní izby");
    } catch (err) {
      console.error(err);
      alert("Nepodarilo sa odstrániť izbu.");
    }
  };

  const handleStartMoveStudent = (student) => {
    setSelectedStudent(student);
    const availableRooms = rooms.filter(
      room => room.pocet_ubytovanych < room.kapacita && room.id_izba !== student.id_izba
    );
    setNewRoomId(availableRooms[0]?.id_izba || '');
    setShowEditModal(true);
  };

  const handleRoomChangeSuccess = () => {
    // Update the local state to reflect the room change
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id_ziak === selectedStudent.id_ziak
          ? { ...student, id_izba: newRoomId }
          : student
      )
    );
    setShowEditModal(false);
  };

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Zoznam izieb</h1>

      <div className="text-end mb-3">
        <Button onClick={() => setShowAddModal(true)} variant="success">
          <FaPlus className="me-2" style={{ fontSize: '1.5rem', marginBottom: '0.1rem' }} /> 
          Pridať izbu
        </Button>
      </div>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Načítava sa...</span>
          </Spinner>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Row>
          {rooms.map((room) => {
            const studentsInRoom = getStudentsForRoom(room.id_izba);
            return (
              <Col md={6} className="mb-4" key={room.id_izba}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <Card.Title style={{ fontSize: '1.75rem' }}>
                      <FaBed className="me-2 mb-1" />
                      Izba {room.cislo}
                    </Card.Title>
                    <Card.Text>
                      <strong>Obsadené:</strong> {room.pocet_ubytovanych} / {room.kapacita}
                    </Card.Text>

                    <h6 className="mt-3">Študenti:</h6>
                    <Table size="sm" bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Meno</th>
                          <th>Priezvisko</th>
                          <th>Email</th>
                          <th>Zmeniť izbu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsInRoom.map(student => (
                          <tr key={student.id_ziak}>
                            <td>{student.meno}</td>
                            <td>{student.priezvisko}</td>
                            <td>{student.email}</td>
                            <td className="d-flex justify-content-center">
                              <Button variant="outline-primary" size="sm" onClick={() => handleStartMoveStudent(student)}>
                                <FaExchangeAlt className="me-1" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }} /> Zmeniť izbu
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {studentsInRoom.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center text-muted">Žiadny študenti</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>

                    <div className="text-end mt-3">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={studentsInRoom.length > 0}
                        onClick={() => handleDeleteRoom(room.id_izba)}
                      >
                        <FaTrashAlt className="me-1" style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }} />
                        Odstrániť izbu
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pridať novú izbu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="roomCislo">
              <Form.Label>Číslo izby</Form.Label>
              <Form.Control
                type="text"
                value={newRoomCislo}
                onChange={(e) => setNewRoomCislo(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="roomKapacita" className="mt-3">
              <Form.Label>Kapacita</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newRoomKapacita}
                onChange={(e) => setNewRoomKapacita(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Zrušiť
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              try {
                const res = await fetch(`${API_URL}/izba/insert`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    cislo: parseInt(newRoomCislo),
                    kapacita: parseInt(newRoomKapacita)
                  })
                });

                if (!res.ok) throw new Error('Chyba pri vytváraní izby');

                setShowAddModal(false);
                setNewRoomCislo('');
                setNewRoomKapacita('');
              } catch (err) {
                console.error(err);
                alert('Nepodarilo sa pridať izbu.');
              }
            }}
          >
            Pridať izbu
          </Button>
        </Modal.Footer>
      </Modal>

      <ChangeRoomModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        student={selectedStudent}
        rooms={rooms}
        selectedRoomId={newRoomId}
        setSelectedRoomId={setNewRoomId}
        onSuccess={handleRoomChangeSuccess}
      />

    </Container>
  );
}

export default RoomsPage;
