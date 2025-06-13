import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPortal from './pages/Admin/AdminPortal';
import StudentPortal from './pages/Student/StudentPortal';
import InstructorPortal from './pages/Instructor/InstructorPortal';
import './App.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} aria-label="Notifications" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPortal />} />
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/instructor/*" element={<InstructorPortal />} />
      </Routes>
    </Router>
  );
}

export default App; 