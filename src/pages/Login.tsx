import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { connectWS, getWS, addMessageListener, removeMessageListener } from '../ws';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // quick local admin shortcut: admin/admin -> SYS_ADMIN
    if (id === 'admin' && password === 'admin') {
      const mapped: User = {
        id: 'admin',
        name: 'Administrator',
        role: UserRole.SYS_ADMIN
      };

      onLogin(mapped);
      return;
    }

    // quick local staff shortcut: staff/staff -> ACADEMIC_AFFAIRS
    if (id === 'staff' && password === 'staff') {
      const mapped: User = {
        id: 'staff',
        name: 'Staff',
        role: UserRole.ACADEMIC_AFFAIRS
      };

      onLogin(mapped);
      return;
    }

    let user: User;
    const ws = getWS();

    if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = {
          type: "login",
          user:UserRole,
          id: id,
          password: password
        };

        ws.send(JSON.stringify(payload));
    } else {
        console.error("WebSocket not connected.");
    }
    // wait for server response
    if (ws) {
      const listener = (ev: MessageEvent) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg && msg.type === 'login_response') {
            removeMessageListener(listener);
            if (msg.success && msg.user) {
              const u = msg.user;
              let mapped: User;
              if (u.role === 'student') {
                mapped = {
                  id: u.id,
                  name: u.name,
                  role: UserRole.STUDENT,
                  group: u.section || undefined
                };
              } else if (u.role === 'professor') {
                mapped = {
                  id: u.id,
                  name: u.name,
                  role: UserRole.PROFESSOR
                };
              } else {
                mapped = {
                  id: u.id,
                  name: u.name,
                  role: UserRole.STUDENT
                };
              }

              onLogin(mapped);
            } else {
              // show error
              alert(msg.error || 'Login failed');
            }
          }
        } catch (err) {
          console.error('Invalid message', err);
        }
      };

      addMessageListener(listener);

      // safety timeout: remove listener after 6s
      setTimeout(() => removeMessageListener(listener), 6000);
    }
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