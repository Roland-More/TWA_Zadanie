import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import AppRoutes from './routes/Routes';

function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
