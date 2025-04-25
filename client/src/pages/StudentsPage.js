import React, { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
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
    } catch (err) {
      console.error(err);
      alert("Nepodarilo sa pridať študenta.");
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
      // await fetchData();
    } catch (err) {
      console.error(err);
      alert("Nepodarilo sa odstrániť študenta.");
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
      />
      
    </Container>
  );
}

export default StudentsPage;
