import React, { useState, useCallback, useEffect } from 'react';
import { Container, Spinner, Alert, Button, Modal, Form, Toast } from 'react-bootstrap';
import { FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import StudentsTable from '../components/StudentsTable';
import StudentsCards from '../components/StudentsCards';
import ChangeRoomModal from '../components/ChangeRoom';
import { useData } from '../context/DataContext';

// Yup Schema remains the same
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
  // --- Consume DataContext ---
  const {
    students,
    rooms,
    loading,
    error,
    addStudent,    // Function from context
    deleteStudent, // Function from context
    updateStudent
  } = useData();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentIdToDelete, setStudentIdToDelete] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Note: newRoomId might be better managed within ChangeRoomModal itself,
  // but keeping it here based on original code structure for now.
  const [newRoomId, setNewRoomId] = useState('');
  const [viewMode, setViewMode] = useState(window.innerWidth > 768 ? 'table' : 'cards');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  // Handle window resize (No change needed)
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    if (mobile) {
      setViewMode('cards');
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // --- Removed initial data fetching useEffect ---
  // Data (students, rooms, loading, error) now comes from DataContext


  // --- Handler Functions Adapted to Use Context ---

  const handleAddStudent = async (values, { resetForm, setSubmitting, setErrors }) => {
    setSubmitting(true); // Indicate submission start
    const result = await addStudent(values); // Call context function

    if (result.success) {
      setShowModal(false);
      resetForm();
      setToastMessage('Študent bol úspešne pridaný.');
      setToastVariant('success');
      setShowToast(true);
    } else {
      // Handle errors from context function
      if (result.validationErrors) {
         setErrors(result.validationErrors); // Set formik errors
         // Don't show toast for validation errors
      } else {
         setToastMessage(result.message || 'Študenta sa nepodarilo pridať.');
         setToastVariant('danger');
         setShowToast(true);
      }
    }
    setSubmitting(false); // Indicate submission end
  };

   const handleDeleteStudent = async (id_ziak) => {
    try {
      const result = await deleteStudent(id_ziak); // Call context function

      if (result.success) {
        setShowDeleteModal(false);
        setStudentIdToDelete(null);
        setToastMessage('Študent úspešne odstránený.');
        setToastVariant('success');
        setShowToast(true);
      } else {
        throw new Error(result.message || 'Nepodarilo sa odstrániť študenta.');
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      setShowDeleteModal(false);
      setStudentIdToDelete(null);
      setToastMessage(err.message || 'Nepodarilo sa odstrániť študenta.');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const openDeleteModal = (id_ziak) => {
    setStudentIdToDelete(id_ziak);
    setShowDeleteModal(true);
  };

  // Keep this to set state needed *before* showing the edit modal
  const handleStartMoveStudent = (student) => {
    setSelectedStudent(student);
    // Find available rooms (excluding the student's current room)
    const availableRooms = rooms.filter(
      room => room.pocet_ubytovanych < room.kapacita && room.id_izba !== student.id_izba
    );
    // Pre-select the first available room or none if no rooms are available/different
    setNewRoomId(availableRooms[0]?.id_izba || '');
    setShowEditModal(true);
  };

  const handleConfirmRoomChange = async (studentToMove, targetRoomId) => {
     const oldRoomId = studentToMove.id_izba;
     const result = await updateStudent(studentToMove, oldRoomId, targetRoomId); // Call context function

     if (result.success) {
       setShowEditModal(false); // Close modal on success
       setToastMessage('Izba študenta bola úspešne zmenená.');
       setToastVariant('success');
       setShowToast(true);
     } else {
       // Decide how to handle errors - show toast? Keep modal open?
       // For now, close modal and show toast.
       setShowEditModal(false);
       setToastMessage(result.message || 'Chyba pri zmene izby študenta.');
       setToastVariant('danger');
       setShowToast(true);
     }
     // You might want the modal to know if the operation succeeded/failed
     return result;
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

      {/* Use loading state from context */}
      {loading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      )}

      {/* Use error state from context */}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        viewMode === 'cards' ? (
          /* Pass context data and adapted handlers */
          <StudentsCards students={students} rooms={rooms} onDelete={openDeleteModal} onMove={handleStartMoveStudent} />
        ) : (
          /* Pass context data and adapted handlers */
          <StudentsTable students={students} rooms={rooms} onDelete={openDeleteModal} onMove={handleStartMoveStudent} />
        )
      )}

      {/* Add Student Modal - uses handleAddStudent */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Pridať študenta</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ /* Initial values remain the same */
            meno: '', priezvisko: '', datum_narodenia: '', email: '', ulica: '', mesto: '', PSC: '', id_izba: ''
          }}
          validationSchema={StudentSchema}
          onSubmit={handleAddStudent} // Use the adapted handler
        >
          {({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
            <>
              <Modal.Body>
                {/* Form structure remains the same, but uses rooms from context */}
                <Form noValidate onSubmit={handleSubmit}>
                  {/* Meno */}
                  <Form.Group className="mb-2">
                    <Form.Label>Meno</Form.Label>
                    <Form.Control type="text" name="meno" value={values.meno} onChange={handleChange} isInvalid={touched.meno && !!errors.meno} />
                    <Form.Control.Feedback type="invalid">{errors.meno}</Form.Control.Feedback>
                  </Form.Group>
                  {/* Priezvisko */}
                  <Form.Group className="mb-2">
                    <Form.Label>Priezvisko</Form.Label>
                    <Form.Control type="text" name="priezvisko" value={values.priezvisko} onChange={handleChange} isInvalid={touched.priezvisko && !!errors.priezvisko} />
                    <Form.Control.Feedback type="invalid">{errors.priezvisko}</Form.Control.Feedback>
                  </Form.Group>
                  {/* Dátum narodenia */}
                  <Form.Group className="mb-2">
                     <Form.Label>Dátum narodenia</Form.Label>
                     <Form.Control type="date" name="datum_narodenia" value={values.datum_narodenia} onChange={handleChange} isInvalid={touched.datum_narodenia && !!errors.datum_narodenia} />
                     <Form.Control.Feedback type="invalid">{errors.datum_narodenia}</Form.Control.Feedback>
                   </Form.Group>
                  {/* Email */}
                   <Form.Group className="mb-2">
                     <Form.Label>Email</Form.Label>
                     <Form.Control type="email" name="email" value={values.email} onChange={handleChange} isInvalid={touched.email && !!errors.email} />
                     <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                   </Form.Group>
                  {/* Ulica */}
                  <Form.Group className="mb-2">
                     <Form.Label>Ulica</Form.Label>
                     <Form.Control type="text" name="ulica" value={values.ulica} onChange={handleChange} isInvalid={touched.ulica && !!errors.ulica} />
                     <Form.Control.Feedback type="invalid">{errors.ulica}</Form.Control.Feedback>
                   </Form.Group>
                  {/* Mesto */}
                  <Form.Group className="mb-2">
                     <Form.Label>Mesto</Form.Label>
                     <Form.Control type="text" name="mesto" value={values.mesto} onChange={handleChange} isInvalid={touched.mesto && !!errors.mesto} />
                     <Form.Control.Feedback type="invalid">{errors.mesto}</Form.Control.Feedback>
                   </Form.Group>
                  {/* PSC */}
                   <Form.Group className="mb-2">
                     <Form.Label>PSČ</Form.Label>
                     <Form.Control type="text" name="PSC" value={values.PSC} onChange={handleChange} isInvalid={touched.PSC && !!errors.PSC} placeholder="Formát: 123 45"/>
                     <Form.Control.Feedback type="invalid">{errors.PSC}</Form.Control.Feedback>
                   </Form.Group>
                  {/* Izba */}
                  <Form.Group>
                    <Form.Label>Izba</Form.Label>
                    <Form.Select name="id_izba" value={values.id_izba} onChange={handleChange} isInvalid={touched.id_izba && !!errors.id_izba}>
                      <option value="">Vyber izbu</option>
                      {/* Use rooms from context */}
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
                    <Form.Control.Feedback type="invalid">{errors.id_izba}</Form.Control.Feedback>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Zrušiť</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Pridávam...' : 'Pridať'}
                </Button>
              </Modal.Footer>
            </>
          )}
        </Formik>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Potvrdiť odstránenie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {studentIdToDelete && (
            <p>
              Naozaj chcete odstrániť študenta <strong>{studentIdToDelete.meno} {studentIdToDelete.priezvisko}</strong>?
              Táto akcia je nevratná.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Zrušiť
          </Button>
          <Button 
            variant="danger"
            onClick={() => studentIdToDelete && handleDeleteStudent(studentIdToDelete)}
          >
            Odstrániť
          </Button>
        </Modal.Footer>
      </Modal>

      <ChangeRoomModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        student={selectedStudent}
        rooms={rooms} // Pass rooms from context
        onConfirm={handleConfirmRoomChange}
        selectedRoomId={newRoomId}
        setSelectedRoomId={setNewRoomId}
      />

      <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          className={"position-fixed bottom-0 end-0 m-3"}
          delay={2000}
          autohide
          style={{ /* style */ minWidth: '300px', backgroundColor: 'white', minHeight: '90px', borderRadius: '16px' }}
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
