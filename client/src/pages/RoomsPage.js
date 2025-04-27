import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Table, Button, Modal, Form, Toast } from 'react-bootstrap';
import { FaBed, FaTrashAlt, FaPlus, FaExchangeAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import ChangeRoomModal from '../components/ChangeRoom';

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomCislo, setNewRoomCislo] = useState('');
  const [newRoomKapacita, setNewRoomKapacita] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [touchedFields, setTouchedFields] = useState({ cislo: false, kapacita: false });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRoomId, setNewRoomId] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomsRes = await fetch(`${API_URL}/izba/read`);
        const studentsRes = await fetch(`${API_URL}/ziak/read`);
        
        let roomsData, studentsData;
        
        try {
          roomsData = await roomsRes.json();
          if (!roomsRes.ok) {
            const errorMessage = roomsData.message || roomsData.error || "Nepodarilo sa načítať izby";
            throw new Error(errorMessage);
          }
        } catch (err) {
          console.error("Error parsing rooms data:", err);
          throw new Error(err.message || "Nepodarilo sa načítať izby");
        }
        
        try {
          studentsData = await studentsRes.json();
          if (!studentsRes.ok) {
            const errorMessage = studentsData.message || studentsData.error || "Nepodarilo sa načítať študentov";
            throw new Error(errorMessage);
          }
        } catch (err) {
          console.error("Error parsing students data:", err);
          throw new Error(err.message || "Nepodarilo sa načítať študentov");
        }
        
        setRooms(roomsData);
        setStudents(studentsData);
        setLoading(false);
      } catch (err) {
        console.error("Chyba pri načítaní:", err);
        setError(err.message || "Nepodarilo sa načítať údaje.");
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  
  // Validate form inputs
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    
    // Only validate fields that have been touched or when submitting
    if (touchedFields.cislo) {
      // Validate room number (cislo)
      if (!newRoomCislo.trim()) {
        errors.cislo = "Číslo izby je povinné";
        isValid = false;
      } else if (!/^\d+$/.test(newRoomCislo.trim())) {
        errors.cislo = "Číslo izby musí byť celé číslo";
        isValid = false;
      } else if (parseInt(newRoomCislo) < 1) {
        errors.cislo = "Číslo izby musí byť väčšie ako 0";
        isValid = false;
      } else if (rooms.some(room => room.cislo === parseInt(newRoomCislo))) {
        errors.cislo = "Izba s týmto číslom už existuje";
        isValid = false;
      }
    }
    
    if (touchedFields.kapacita) {
      // Validate capacity (kapacita)
      if (!newRoomKapacita.trim()) {
        errors.kapacita = "Kapacita izby je povinná";
        isValid = false;
      } else if (!/^\d+$/.test(newRoomKapacita.trim())) {
        errors.kapacita = "Kapacita musí byť celé číslo";
        isValid = false;
      } else if (parseInt(newRoomKapacita) < 1) {
        errors.kapacita = "Kapacita musí byť aspoň 1";
        isValid = false;
      }
    }
    
    // For the button to be enabled, both fields need to be valid
    const allFieldsValid = 
      newRoomCislo.trim() && 
      /^\d+$/.test(newRoomCislo.trim()) && 
      parseInt(newRoomCislo) >= 1 && 
      !rooms.some(room => room.cislo === parseInt(newRoomCislo)) &&
      newRoomKapacita.trim() && 
      /^\d+$/.test(newRoomKapacita.trim()) && 
      parseInt(newRoomKapacita) >= 1;
    
    setFormErrors(errors);
    setIsFormValid(allFieldsValid);
    return isValid;
  }, [newRoomCislo, newRoomKapacita, rooms, touchedFields]);
  
  // Run validation when inputs change
  useEffect(() => {
    if (touchedFields.cislo || touchedFields.kapacita) {
      validateForm();
    }
  }, [newRoomCislo, newRoomKapacita, validateForm, touchedFields]);
  
  const handleInputChange = (field, value) => {
    if (field === 'cislo') {
      setNewRoomCislo(value);
    } else if (field === 'kapacita') {
      setNewRoomKapacita(value);
    }
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };
  
  const resetForm = () => {
    setNewRoomCislo('');
    setNewRoomKapacita('');
    setFormErrors({});
    setIsFormValid(false);
    setTouchedFields({ cislo: false, kapacita: false });
  };

  const getStudentsForRoom = (roomId) => {
    return students.filter(s => s.id_izba === roomId);
  };

  const handleAddRoom = async () => {
    // Mark all fields as touched to show all validation errors
    setTouchedFields({ cislo: true, kapacita: true });
  
    try {
      const res = await fetch(`${API_URL}/izba/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cislo: parseInt(newRoomCislo),
          kapacita: parseInt(newRoomKapacita)
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Extract the specific error message from the response
        const errorMessage = data.message || data.error || 'Nepodarilo sa pridať izbu';
        throw new Error(errorMessage);
      }

      setShowAddModal(false);
      resetForm();
      setToastMessage('Nová izba bola úspešne pridaná.');
      setToastVariant('success');
      setShowToast(true);
      
      // Refresh the rooms list
      const roomsRes = await fetch(`${API_URL}/izba/read`);
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      }
    } catch (err) {
      console.error('Error adding room:', err);
      setToastMessage(err.message);
      setToastVariant('danger');
      setShowToast(true);
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Naozaj chcete odstrániť túto izbu?")) return;
    try {
      const res = await fetch(`${API_URL}/izba/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_izba: roomId })
      });
      
      const data = await res.json();
      console.log('Server response:', data, 'Status:', res.status);
      
      if (!res.ok) {
        // Extract the specific error message from the response
        const errorMessage = data.message || data.error || "Chyba pri odstraňovaní izby";
        throw new Error(errorMessage);
      }

      setToastMessage('Izba bola úspešne odstránená.');
      setToastVariant('success');
      setShowToast(true);
      
      // Refresh the rooms list
      const roomsRes = await fetch(`${API_URL}/izba/read`);
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData);
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      setToastMessage(err.message || 'Nepodarilo sa odstrániť izbu.');
      setToastVariant('danger');
      setShowToast(true);
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

  const handleRoomChangeSuccess = async () => {
    try {
      const [studentsRes, roomsRes] = await Promise.all([
        fetch(`${API_URL}/ziak/read`),
        fetch(`${API_URL}/izba/read`)
      ]);
      
      const studentsData = await studentsRes.json();
      const roomsData = await roomsRes.json();
      
      setStudents(studentsData);
      setRooms(roomsData);
      
      setShowEditModal(false);
      setToastMessage('Izba študenta bola úspešne zmenená.');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error("Error refreshing data after room change:", err);
      setShowEditModal(false);
      setToastMessage('Izba študenta bola úspešne zmenená.');
      setToastVariant('success');
      setShowToast(true);
    }
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    resetForm();
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

      <Modal show={showAddModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Pridať novú izbu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate>
            <Form.Group controlId="roomCislo">
              <Form.Label>Číslo izby</Form.Label>
              <Form.Control
                type="text"
                value={newRoomCislo}
                onChange={(e) => handleInputChange('cislo', e.target.value)}
                isInvalid={!!formErrors.cislo && touchedFields.cislo}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.cislo}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="roomKapacita" className="mt-3">
              <Form.Label>Kapacita</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newRoomKapacita}
                onChange={(e) => handleInputChange('kapacita', e.target.value)}
                isInvalid={!!formErrors.kapacita && touchedFields.kapacita}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.kapacita}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Zrušiť
          </Button>
          <Button
            variant="primary"
            onClick={handleAddRoom}
            disabled={!isFormValid}
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
        setShowToast={setShowToast}
        setToastMessage={setToastMessage}
        setToastVariant={setToastVariant}
      />

        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          className={"position-fixed bottom-0 end-0 m-3"}
          delay={3000}
          autohide
          style={{
            minWidth: '300px',
            backgroundColor: 'white',
            minHeight: '90px',
            borderRadius: '16px',
          }}
        >
          <Toast.Body className="d-flex align-items-center">
            {toastVariant === 'success' ? (
              <FaCheckCircle className="text-success" style={{ fontSize: '6rem', marginRight: '1rem' }} />
            ) : (
              <FaTimesCircle className="text-danger" style={{ fontSize: '6rem', marginRight: '1rem' }} />
            )}
            <span style={{ fontSize: '1.7rem' }}>{toastMessage}</span>
          </Toast.Body>
        </Toast>
      
    </Container>
  );
}

export default RoomsPage;
