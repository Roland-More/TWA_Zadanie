import { Routes, Route } from 'react-router-dom';
import RoomsPage from '../pages/RoomsPage';
import StudentsPage from '../pages/StudentsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoomsPage />} />
      <Route path="/students" element={<StudentsPage />} />
    </Routes>
  );
}

export default AppRoutes;
