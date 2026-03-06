import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InverterDetails from './pages/InverterDetails';
import InputPage from './pages/InputPage';
import AuthLayout from './components/AuthLayout';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated routes with shared sidebar/navbar layout */}
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inverter/:inverterId" element={<InverterDetails />} />
            <Route path="/input" element={<InputPage />} />
          </Route>

          {/* Catch-all: redirect to dashboard if logged in, else login */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
