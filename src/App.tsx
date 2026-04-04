import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import PatientDashboard from './pages/PatientDashboard';
import AdminLayout from './pages/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />

        {/* Patient */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_PATIENT']} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<div>Overview coming soon</div>} />
            <Route path="doctors" element={<div>Doctors coming soon</div>} />
            <Route path="receptionists" element={<div>Receptionists coming soon</div>} />
            <Route path="profile" element={<div>Profile coming soon</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;