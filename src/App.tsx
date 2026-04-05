import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OAuthCallback from './pages/OAuthCallback';
import PatientProfile from './pages/patient/PatientProfile';
import AdminLayout from './pages/admin/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProfile from './pages/admin/AdminProfile';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminReceptionists from './pages/admin/AdminReceptionists';
import AdminSpecializations from './pages/admin/AdminSpecializations';
import AdminMedicalService from './pages/admin/AdminMedicalService';
import AdminDoctorDetail from './pages/admin/AdminDoctorDetail';
import PatientLayout from './pages/patient/PatientLayout';
import PatientAppointments from './pages/patient/PatientAppointment';
import PaymentVerify from './pages/patient/PaymentVerify';
import PaymentSuccess from './pages/patient/PaymentSuccess';
import PaymentFailed from './pages/patient/PaymentFailed';
import BookAppointment from './pages/patient/BookAppointment';
import ReceptionistBookAppointment from './pages/receptionist/ReceptionistBookAppointment';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';
import ReceptionistLayout from './pages/receptionist/ReceptionistLayout';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/oauth2/callback" element={<OAuthCallback />} />
        <Route path="/payment/verify" element={<PaymentVerify />} /> {/* ← move here */}

        {/* Patient */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_PATIENT']} />}>
          <Route path="/patient" element={<PatientLayout />}>
            <Route index element={<Navigate to="/patient/profile" replace />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="book" element={<BookAppointment />} />
          </Route>
        </Route>

        {/* Receptionist */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_RECEPTIONIST']} />}>
          <Route index element={<Navigate to="/receptionist/book" replace />} />
          <Route path="book" element={<ReceptionistBookAppointment />} />
          <Route path="appointments" element={<ReceptionistAppointments />} />
        </Route>

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="doctors/:id" element={<AdminDoctorDetail />} />
            <Route path="receptionists" element={<AdminReceptionists />} />
            <Route path="specializations" element={<AdminSpecializations />} />
            <Route path="services" element={<AdminMedicalService />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;