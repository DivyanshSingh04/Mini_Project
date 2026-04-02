import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewGrievance from './pages/NewGrievance';
import MyGrievances from './pages/MyGrievances';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes Wrapper */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/grievances/new" element={<NewGrievance />} />
        <Route path="/grievances/my" element={<MyGrievances />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 flex-col">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <a href="/dashboard" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-medium">Go Home</a>
        </div>
      } />
    </Routes>
  );
}

export default App;
