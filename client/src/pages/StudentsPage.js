import React, { useEffect, useState, useCallback } from 'react';
import { Container, Spinner, Alert, Button, Modal, Form, Toast } from 'react-bootstrap';
import { FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import StudentsTable from '../components/StudentsTable';
import StudentsCards from '../components/StudentsCards';
import ChangeRoomModal from '../components/ChangeRoom';

const StudentSchema = Yup.object().shape({
  meno: Yup.string()
    .matches(/^[A-ZÁ-Ž][a-zá-ž]{0,29}$/, 'Meno musí začínať veľkým písmenom a obsahovať len písmená')
    .min(1, 'Meno je povinné')
    .max(30, 'Meno môže mať maximálne 30 znakov')
    .required('Meno je povinné'),
  priezvisko: Yup.string()
    .matches(/^[A-ZÁ-Ž][a-zá-ž]{0,29}$/, 'Priezvisko musí začínať veľkým písmenom a obsahovať len písmená')
    .min(1, 'Priezvisko je povinné')
    .max(30, 'Priezvisko môže mať maximálne 30 znakov')
    .required('Priezvisko je povinné'),
  datum_narodenia: Yup.date()
    .max(new Date(), 'Dátum narodenia nemôže byť v budúcnosti')
    .required('Dátum narodenia je povinný'),
  email: Yup.string()
    .email('Neplatný formát emailu')
    .max(30, 'Email môže mať maximálne 30 znakov')
    .required('Email je povinný'),
  ulica: Yup.string()
    .matches(/^[A-ZÁ-Ž][a-zá-ž ]+ [0-9]+(\/\d+)?$/, 'Ulica musí byť v tvare "Názov ulice číslo" (napr. "Hlavná 123" alebo "Hlavná 123/4")')
    .max(30, 'Ulica môže mať maximálne 30 znakov')
    .required('Ulica je povinná'),
  mesto: Yup.string()
    .matches(/^[A-ZÁ-Ž][a-zá-ž ]{0,29}$/, 'Mesto musí začínať veľkým písmenom a obsahovať len písmená')
    .min(1, 'Mesto je povinné')
    .max(30, 'Mesto môže mať maximálne 30 znakov')
    .required('Mesto je povinné'),
  PSC: Yup.string()
    .matches(/^[0-9]{3} [0-9]{2}$/, 'PSČ musí byť vo formáte "123 45"')
    .required('PSČ je povinné'),
  id_izba: Yup.number()
    .min(1, 'Izba musí byť zvolená')
    .typeError('Výber izby je povinný')
    .required('Výber izby je povinný')
});

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newRoomId, setNewRoomId] = useState('');
  const [viewMode, setViewMode] = useState(window.innerWidth > 768 ? 'table' : 'cards');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const API_URL = process.env.REACT_APP_API_URL;

  // Handle window resize
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (mobile) {
      setViewMode('cards');
    }
  }, []);

  useEffect(() => {
    // Set initial view mode based on screen size
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

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
        
        setStudents(studentsData);
        setRooms(roomsData);
        setLoading(false);

      } catch (err) {
        console.error("Chyba pri načítaní:", err);
        setError("Nepodarilo sa načítať údaje o študentoch alebo izbách.");
        setLoading(false);
      }
    };
  
    fetchData();
  }, [API_URL]);

  const handleAddStudent = async (values, { resetForm, setSubmitting, setErrors }) => {
    try {  
      const res = await fetch(`${API_URL}/ziak/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
  
      const data = await res.json();
      if (!res.ok) {
        const errorMessage = data.message || data.error || "Nepodarilo sa pridať študenta.";
        
        // Check if we have field-specific validation errors from the server
        if (data.validationErrors) {
          setErrors(data.validationErrors);
          throw new Error("Oprav chyby vo formulári");
        }
        
        throw new Error(errorMessage);
      }
      
      const newStudentData = {
        ...values,
        id_ziak: data.id_ziak // Try to use any ID returned from server
      };
      
      // Ensure id_izba is a number
      newStudentData.id_izba = parseInt(newStudentData.id_izba || values.id_izba);
      
      // Find the room information for this student
      const studentRoom = rooms.find(room => room.id_izba === newStudentData.id_izba);
      
      // Add room information to the student object
      const enhancedStudentData = {
        ...newStudentData,
        room: studentRoom,
        cislo_izby: studentRoom?.cislo
      };
      
      setStudents(prevStudents => [...prevStudents, enhancedStudentData]);
      
      // Update room occupancy
      setRooms(prevRooms => prevRooms.map(room => 
        room.id_izba === newStudentData.id_izba
          ? { ...room, pocet_ubytovanych: room.pocet_ubytovanych + 1 }
          : room
      ));
      
      setShowModal(false);
      resetForm();
  
      setToastMessage('Študent bol úspešne pridaný.');
      setToastVariant('success');
      setShowToast(true);
      
      // After adding a student, refresh the student list to ensure correct IDs
      fetchStudents();
      
    } catch (err) {
      console.error(err);
      
      // Don't show toast for validation errors as they'll be displayed in the form
      if (!err.message.includes("Oprav chyby vo formulári")) {
        setToastMessage(err.message || 'Študenta sa nepodarilo pridať.');
        setToastVariant('danger');
        setShowToast(true);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Add this function to refresh the student list
  const fetchStudents = async () => {
    try {
      const studentsRes = await fetch(`${API_URL}/ziak/read`);
      const studentsData = await studentsRes.json();
      setStudents(studentsData);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleDeleteStudent = async (id_ziak) => {
    if (!window.confirm("Naozaj chceš odstrániť tohto študenta?")) return;

    try {
      // Find the student to get their room ID before deletion
      const studentToDelete = students.find(student => student.id_ziak === id_ziak);
      const roomId = studentToDelete?.id_izba;
      
      const res = await fetch(`${API_URL}/ziak/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_ziak })
      });
      
      if (!res.ok){
        const errorData = await res.json();
        throw new Error(errorData.message || 'Chyba pri odstraňovaní študenta');
      }
        
      // Update local state to remove the student
      setStudents(prevStudents => prevStudents.filter(student => student.id_ziak !== id_ziak));
      
      // Update room occupancy if we have the room ID
      if (roomId) {
        setRooms(prevRooms => prevRooms.map(room => 
          room.id_izba === roomId
            ? { ...room, pocet_ubytovanych: Math.max(0, room.pocet_ubytovanych - 1) }
            : room
        ));
      }
      
      setToastMessage('Študent úspešne odstránený.');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage(err.message || 'Nepodarilo sa odstrániť študenta.');
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

  const handleRoomChangeSuccess = async (student, oldRoomId, newRoomId) => {
    try {
      // Update the student's room in the local state
      setStudents(prevStudents => 
        prevStudents.map(s => 
          s.id_ziak === student.id_ziak 
            ? { ...s, id_izba: newRoomId } 
            : s
        )
      );
      
      // Update room occupancy for both rooms
      setRooms(prevRooms => 
        prevRooms.map(room => {
          if (room.id_izba === parseInt(oldRoomId)) {
            return { ...room, pocet_ubytovanych: Math.max(0, room.pocet_ubytovanych - 1) };
          }
          if (room.id_izba === parseInt(newRoomId)) {
            return { ...room, pocet_ubytovanych: room.pocet_ubytovanych + 1 };
          }
          return room;
        })
      );
      
      setShowEditModal(false);
      setToastMessage('Izba študenta bola úspešne zmenená.');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error("Error updating room change:", err);
      setShowEditModal(false);
      setToastMessage('Chyba pri zmene izby študenta.');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h1 className="mb-3 text-center">Zoznam študentov</h1>
        <div className="d-flex justify-content-end gap-2">
          {!isMobile && (
            <Button
              variant={viewMode === 'table' ? 'outline-primary' : 'outline-secondary'}
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            >
              {viewMode === 'table' ? 'Zobraziť ako karty' : 'Zobraziť ako tabuľku'}
            </Button>
          )}
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
        viewMode === 'cards' ? (
          <StudentsCards students={students} rooms={rooms} onDelete={handleDeleteStudent} onMove={handleStartMoveStudent} />
          ) : (
          <StudentsTable students={students} rooms={rooms} onDelete={handleDeleteStudent} onMove={handleStartMoveStudent} />
        )     
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pridať študenta</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            meno: '',
            priezvisko: '',
            datum_narodenia: '',
            email: '',
            ulica: '',
            mesto: '',
            PSC: '',
            id_izba: ''
          }}
          validationSchema={StudentSchema}
          onSubmit={handleAddStudent}
        >
          {({ handleSubmit, handleChange, values, touched, errors, isSubmitting, isValid }) => (
            <>
              <Modal.Body>
                <Form noValidate onSubmit={handleSubmit}>
                  <Form.Group className="mb-2">
                    <Form.Label>Meno</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="meno"
                      value={values.meno}
                      onChange={handleChange}
                      isInvalid={touched.meno && !!errors.meno}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.meno}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Priezvisko</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="priezvisko"
                      value={values.priezvisko}
                      onChange={handleChange}
                      isInvalid={touched.priezvisko && !!errors.priezvisko}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.priezvisko}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Dátum narodenia</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="datum_narodenia"
                      value={values.datum_narodenia}
                      onChange={handleChange}
                      isInvalid={touched.datum_narodenia && !!errors.datum_narodenia}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.datum_narodenia}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      isInvalid={touched.email && !!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Ulica</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="ulica"
                      value={values.ulica}
                      onChange={handleChange}
                      isInvalid={touched.ulica && !!errors.ulica}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.ulica}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>Mesto</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="mesto"
                      value={values.mesto}
                      onChange={handleChange}
                      isInvalid={touched.mesto && !!errors.mesto}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.mesto}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label>PSČ</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="PSC"
                      value={values.PSC}
                      onChange={handleChange}
                      isInvalid={touched.PSC && !!errors.PSC}
                      placeholder="Formát: 123 45"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.PSC}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group>
                    <Form.Label>Izba</Form.Label>
                    <Form.Select 
                      name="id_izba"
                      value={values.id_izba}
                      onChange={handleChange}
                      isInvalid={touched.id_izba && !!errors.id_izba}
                    >
                      <option value="">Vyber izbu</option>
                      {rooms.map(room => (
                        <option 
                          key={room.id_izba} 
                          value={room.id_izba}
                          disabled={room.pocet_ubytovanych >= room.kapacita}
                        >
                          Izba {room.cislo} ({room.pocet_ubytovanych}/{room.kapacita})
                          {room.pocet_ubytovanych >= room.kapacita ? ' - Plná' : ''}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.id_izba}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Zrušiť</Button>
                <Button 
                  variant="primary" 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Pridávam...' : 'Pridať'}
                </Button>
              </Modal.Footer>
            </>
          )}
        </Formik>
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
