import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { DataProvider } from './context/DataContext';
import { BrowserRouter } from 'react-router-dom';
import AppNavbar from './components/Navbar';
import AppRoutes from './routes/Routes';

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <AppNavbar />
        <AppRoutes />
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
