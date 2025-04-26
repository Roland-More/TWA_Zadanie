import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Modal, Form, Toast } from 'react-bootstrap';
import { FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import StudentsTable from '../components/StudentsTable';
import StudentsCards from '../components/StudentsCards';
import ChangeRoomModal from '../components/ChangeRoom';


function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRoomId, setNewRoomId] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [newStudent, setNewStudent] = useState({
    meno: '',
    priezvisko: '',
    datum_narodenia: '',
    email: '',
    ulica: '',
    mesto: '',
    PSC: '',
    id_izba: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, roomsRes] = await Promise.all([
          fetch(`${API_URL}/ziak/read`),
          fetch(`${API_URL}/izba/read`)
        ]);
    
        const studentsData = await studentsRes.json();
        const roomsData = await roomsRes.json();
    
        console.log('Room data from API:', roomsData);
        
        // Ensure the data is an array before setting it to state
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setLoading(false);

      } catch (err) {
        console.error("Chyba pri načítaní:", err);
        setError("Nepodarilo sa načítať údaje o študentoch alebo izbách.");
        setLoading(false);
      }
    };
  
    fetchData();
  }, [API_URL]);

  const handleAddStudent = async () => {
    try {
      const res = await fetch(`${API_URL}/ziak/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });

      if (!res.ok) throw new Error('Chyba pri pridávaní študenta');

      // await fetchData();
      setShowModal(false);
      setNewStudent({
        meno: '', priezvisko: '', datum_narodenia: '', email: '',
        ulica: '', mesto: '', PSC: '', id_izba: ''
      });

      setToastMessage('Študent bol úspešne pridaný.');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage('Študenta sa nepodarilo pridať.');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const handleDeleteStudent = async (id_ziak) => {
    if (!window.confirm("Naozaj chceš odstrániť tohto študenta?")) return;

    try {
      const res = await fetch(`${API_URL}/ziak/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_ziak })
      });
      if (!res.ok) throw new Error('Chyba pri mazaní študenta');
      
      setToastMessage('Študent úspešne odstránený.');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage('Nepodarilo sa odstrániť študenta.');
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
    setToastMessage('Izba študenta bola úspešne zmenená.');
    setToastVariant('success');
    setShowToast(true);
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="mb-3 text-center">Zoznam študentov</h1>
        <div className="d-flex justify-content-end gap-2">
          <Button
            variant={viewMode === 'table' ? 'outline-primary' : 'outline-secondary'}
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          >
            {viewMode === 'table' ? 'Zobraziť ako karty' : 'Zobraziť ako tabuľku'}
          </Button>
          <Button variant="success" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" style={{ fontSize: '1.5rem', marginBottom: '0.1rem' }} />
            Pridať študenta
          </Button>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        viewMode === 'table' ? (
          <StudentsTable students={students} rooms={rooms} onDelete={handleDeleteStudent} onMove={handleStartMoveStudent} />
        ) : (
          <StudentsCards students={students} rooms={rooms} onDelete={handleDeleteStudent} onMove={handleStartMoveStudent} />
        )     
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pridať študenta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Meno</Form.Label>
              <Form.Control type="text" value={newStudent.meno} onChange={e => setNewStudent({ ...newStudent, meno: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Priezvisko</Form.Label>
              <Form.Control type="text" value={newStudent.priezvisko} onChange={e => setNewStudent({ ...newStudent, priezvisko: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Dátum narodenia</Form.Label>
              <Form.Control type="date" value={newStudent.datum_narodenia} onChange={e => setNewStudent({ ...newStudent, datum_narodenia: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Ulica</Form.Label>
              <Form.Control type="text" value={newStudent.ulica} onChange={e => setNewStudent({ ...newStudent, ulica: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mesto</Form.Label>
              <Form.Control type="text" value={newStudent.mesto} onChange={e => setNewStudent({ ...newStudent, mesto: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>PSČ</Form.Label>
              <Form.Control type="text" value={newStudent.PSC} onChange={e => setNewStudent({ ...newStudent, PSC: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Izba</Form.Label>
              <Form.Select value={newStudent.id_izba} onChange={e => setNewStudent({ ...newStudent, id_izba: e.target.value })}>
                <option value="">Vyber izbu</option>
                {rooms.map(room => (
                  <option key={room.id_izba} value={room.id_izba}>
                    Izba {room.cislo} ({room.pocet_ubytovanych}/{room.kapacita})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Zrušiť</Button>
          <Button variant="primary" onClick={handleAddStudent}>Pridať</Button>
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

export default StudentsPage;
