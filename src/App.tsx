import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Timetable } from './pages/Timetable';
import { Inbox } from './pages/Inbox';
import { ProfessorList } from './pages/ProfessorList';
import { StudentListAdmin } from './pages/StudentListAdmin';
import { SysAdmin } from './pages/SysAdmin';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { User, UserRole } from './types';

const AppContent: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const handleLogin = (newUser: User) => {
        setUser(newUser);
        navigate('/');
    };

    const handleLogout = () => {
        setUser(null);
        navigate('/login');
    };

    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black font-sans flex flex-col">
            <NavBar user={user} onLogout={handleLogout} />
            <div className="flex-1 overflow-hidden relative flex flex-col">
                <Routes>
                    <Route path="/" element={
                        user.role === UserRole.ACADEMIC_AFFAIRS ? <Navigate to="/professor-list" /> : 
                        user.role === UserRole.SYS_ADMIN ? <Navigate to="/sysadmin" /> :
                        <Dashboard />
                    } />
                    <Route path="/inbox" element={<Inbox />} />
                    
                    {/* Timetable is now dynamic based on user role for editing */}
                    <Route path="/timetable" element={<Timetable user={user} />} />

                    <Route path="/attendance" element={<Attendance user={user} />} />
                    <Route path="/professor-list" element={<ProfessorList />} />
                    <Route path="/student-list" element={<StudentListAdmin />} />
                    <Route path="/sysadmin" element={<SysAdmin />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
        <AppContent />
    </HashRouter>
  );
};

export default App;