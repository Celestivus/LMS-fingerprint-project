import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock Login Logic
    let user: User;
    
    if (id.startsWith('U')) {
        // Student pattern
        user = {
            id: id,
            name: 'Dubayskiy Indus',
            role: UserRole.STUDENT,
            group: 'CSE 23-01',
            avatarUrl: 'https://picsum.photos/id/64/200/200'
        };
    } else if (id.startsWith('P')) {
        // Professor pattern
        user = {
            id: id,
            name: 'Salih Abdulloyev',
            role: UserRole.PROFESSOR,
            avatarUrl: 'https://picsum.photos/id/65/200/200'
        };
    } else if (id.startsWith('S')) {
        // Staff pattern
        user = {
            id: id,
            name: 'Staff Member',
            role: UserRole.ACADEMIC_AFFAIRS,
        };
    } else if (id === 'admin') {
        user = {
            id: 'ROOT',
            name: 'System Administrator',
            role: UserRole.SYS_ADMIN,
        };
    } else {
        // Default fallback for demo
        user = {
            id: id || 'U2310008',
            name: 'Demo User',
            role: UserRole.STUDENT,
            group: 'CSE 23-01'
        };
    }

    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#0066cc] flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md p-6">
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white">
              <UserIcon size={20} strokeWidth={1.5} />
            </div>
            <input 
              type="text" 
              placeholder="ID" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full bg-transparent border border-white text-white placeholder-gray-300 py-3 pl-10 pr-4 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white">
              <Lock size={20} strokeWidth={1.5} />
            </div>
            <input 
              type="password" 
              placeholder="PASSWORD" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white text-white placeholder-gray-300 py-3 pl-10 pr-4 rounded focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          <button 
            type="submit" 
            className="bg-white text-[#0066cc] font-bold py-3 rounded mt-4 hover:bg-gray-100 transition-colors uppercase tracking-wider"
          >
            Sign In
          </button>

          <div className="text-center mt-4">
            <span className="text-white cursor-pointer hover:underline" onClick={() => navigate('/register')}>Registration</span>
          </div>

          <div className="text-center mt-8 text-white/50 text-xs">
             <p>Demo Credentials:</p>
             <p>Student: U231... | Prof: P001... | Staff: S999... | Admin: admin</p>
          </div>
        </form>
      </div>
    </div>
  );
};