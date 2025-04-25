import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export function ChangeRoomModal({ 
  show, 
  onHide, 
  student, 
  rooms, 
  selectedRoomId, 
  setSelectedRoomId, 
  onSuccess 
}) {
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChangeRoom = async () => {
    try {
      const res = await fetch(`${API_URL}/ziak/update-room`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_ziak: student.id_ziak,
          id_izba: selectedRoomId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Chyba pri zmene izby');
      }

      onSuccess();
      onHide();
    } catch (err) {
      alert(`Nepodarilo sa zmeniť izbu: ${err.message}`);
    }
  };

  if (!student) return null;

  const availableRooms = rooms.filter(
    room => room.pocet_ubytovanych < room.kapacita && room.id_izba !== student.id_izba
  );

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Zmeniť izbu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="roomSelect">
            <Form.Label>Vyber novú izbu</Form.Label>
            <Form.Select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(Number(e.target.value))}
            >
              {availableRooms.length > 0 ? (
                availableRooms.map((room) => (
                  <option key={room.id_izba} value={room.id_izba}>
                    {room.cislo} ({room.pocet_ubytovanych}/{room.kapacita})
                  </option>
                ))
              ) : (
                <option value="">Žiadne dostupné izby</option>
              )}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Zrušiť
        </Button>
        <Button
          variant="primary"
          onClick={handleChangeRoom}
          disabled={!selectedRoomId || availableRooms.length === 0}
        >
          Potvrdiť
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChangeRoomModal;
