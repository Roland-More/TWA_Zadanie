import React, { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  const addStudent = async (studentData) => {
    try {  
      const res = await fetch(`${API_URL}/ziak/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
  
      const data = await res.json();
      if (!res.ok) {
        const errorMessage = data.message || data.error || "Nepodarilo sa pridať študenta.";
        
        if (data.validationErrors) {
          const error = new Error("Oprav chyby vo formulári");
          error.validationErrors = data.validationErrors;
          throw error;
        }
              
        
        throw new Error(errorMessage);
      }
      
      const newStudentData = {
        ...studentData,
        id_ziak: data.id_ziak
      };
      
      // Ensure id_izba is a number
      newStudentData.id_izba = parseInt(newStudentData.id_izba || studentData.id_izba);
      
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
      
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.message || 'Študenta sa nepodarilo pridať.',
        validationErrors: err.validationErrors
      };
    }
  };

  const deleteStudent = async (id_ziak) => {
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
      
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message || 'Nepodarilo sa odstrániť študenta.' };
    }
  };

  const changeStudentRoom = async (student, oldRoomId, newRoomId) => {
    try {
      const res = await fetch(`${API_URL}/ziak/update-room`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_ziak: student.id_ziak,
          id_izba: newRoomId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Chyba pri zmene izby');
      }

      // Update the student's room in the local state
      setStudents(prevStudents => 
        prevStudents.map(s => 
          s.id_ziak === student.id_ziak 
            ? { ...s, id_izba: parseInt(newRoomId) } 
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
      
      return { success: true };
    } catch (err) {
      console.error("Error updating room change:", err);
      return { success: false, message: err.message || 'Chyba pri zmene izby študenta.' };
    }
  };

  const updateStudent = async (student, oldRoomId, newRoomId) => {
    try {
      const res = await fetch(`${API_URL}/ziak/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_ziak: student.id_ziak,
          meno: student.meno,
          priezvisko: student.priezvisko,
          datum_narodenia: new Date(student.datum_narodenia).toISOString().split('T')[0],
          email: student.email,
          ulica: student.ulica,
          mesto: student.mesto,
          PSC: student.PSC,
          id_izba: newRoomId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Chyba pri uprave študenta.');
      }

      // Update the student's room in the local state
      setStudents(prevStudents =>
        prevStudents.map(s =>
          s.id_ziak === student.id_ziak
            ? {
                ...s,
                meno: student.meno,
                priezvisko: student.priezvisko,
                datum_narodenia: student.datum_narodenia,
                email: student.email,
                ulica: student.ulica,
                mesto: student.mesto,
                PSC: student.PSC,
                id_izba: parseInt(newRoomId)
              }
            : s
        )
      );
      
      
      // Update room occupancy for both rooms
      if (oldRoomId!== newRoomId) {
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
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error updating student:", err);
      return { success: false, message: err.message || 'Chyba pri zmene študenta.' };
    }
  };

  const addRoom = async (roomData) => {
    try {
      const res = await fetch(`${API_URL}/izba/insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cislo: parseInt(roomData.cislo),
          kapacita: parseInt(roomData.kapacita)
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Extract the specific error message from the response
        const errorMessage = data.message || data.error || 'Nepodarilo sa pridať izbu';
        throw new Error(errorMessage);
      }

      // Add the new room to the local state with all required properties
      const newRoom = {
        id_izba: data.id_izba,
        cislo: parseInt(roomData.cislo),
        kapacita: parseInt(roomData.kapacita),
        pocet_ubytovanych: 0
      };
      
      setRooms(prevRooms => [...prevRooms, newRoom]);
      
      return { success: true };
    } catch (err) {
      console.error('Error adding room:', err);
      return { success: false, message: err.message || 'Nepodarilo sa pridať izbu.' };
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      const res = await fetch(`${API_URL}/izba/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_izba: roomId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Extract the specific error message from the response
        const errorMessage = data.message || data.error || "Chyba pri odstraňovaní izby";
        throw new Error(errorMessage);
      }

      // Remove the room from local state
      setRooms(prevRooms => prevRooms.filter(room => room.id_izba !== roomId));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting room:', err);
      return { success: false, message: err.message || 'Nepodarilo sa odstrániť izbu.' };
    }
  };

  return (
    <DataContext.Provider value={{ 
      students, 
      rooms, 
      loading, 
      error, 
      addStudent, 
      deleteStudent, 
      changeStudentRoom,
      updateStudent,
      addRoom,
      deleteRoom
    }}>
      {children}
    </DataContext.Provider>
  );
};
