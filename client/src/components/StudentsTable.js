import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaTrashAlt, FaExchangeAlt } from 'react-icons/fa';

function StudentTable({ students, rooms, onDelete, onMove }) {
  return (
    <div className="table-responsive overflow-hidden">
      <Table striped bordered hover className="mb-0" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <thead className="table-light">
          <tr>
            <th>Meno</th>
            <th>Priezvisko</th>
            <th>Dátum narodenia</th>
            <th>Email</th>
            <th>Adresa</th>
            <th>Izba</th>
            <th>Odstrániť</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id_ziak}>
              <td>{s.meno}</td>
              <td>{s.priezvisko}</td>
              <td>{new Date(s.datum_narodenia).toLocaleDateString('sk-SK')}</td>
              <td>{s.email}</td>
              <td>{s.ulica}, {s.mesto} {s.PSC}</td>
              <td>
                {rooms.find(room => room.id_izba === s.id_izba)?.cislo || 'Neznáma'}
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="ms-2"
                  onClick={() => onMove(s)}
                >
                  <FaExchangeAlt style={{ fontSize: '1.5rem' }} />
                </Button>
              </td>
              <td className="d-flex justify-content-center">
                <Button variant="danger" size="sm" onClick={() => onDelete(s.id_ziak)}>
                  <FaTrashAlt style={{ fontSize: '1.5rem' }} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default StudentTable;
