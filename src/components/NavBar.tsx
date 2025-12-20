import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavBarProps {
  user: User;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getTabClass = (path: string, isSpecialButton: boolean = false) => {
    const isActive = location.pathname === path;
    

    if (isSpecialButton) {
        return `flex-1 py-3 text-center cursor-pointer font-bold border-r-2 border-black last:border-r-0 transition-all flex items-center justify-center
          ${isActive 
            ? 'bg-[#9ca3af] text-black shadow-inner' 
            : 'bg-white hover:bg-gray-100 text-black'}`;
    }

    const baseClass = "flex-1 py-3 text-center cursor-pointer font-bold border-r-2 border-black last:border-r-0 transition-colors flex items-center justify-center";
    return isActive 
      ? `${baseClass} bg-slate-200 text-black shadow-inner` 
      : `${baseClass} bg-white hover:bg-slate-50 text-black`;
  };


  if (user.role === UserRole.STUDENT || user.role === UserRole.PROFESSOR) {
    return (
      <div className="w-full border-b-2 border-black bg-white">
        {/* Header Info Section */}
        <div className="p-6 flex items-center gap-6 border-b-2 border-black">
          <div className="h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
               <img src={user.avatarUrl || "https://picsum.photos/200"} alt="Profile" className="h-full w-full object-cover" />
          </div>
          <div>
              <h1 className="text-2xl font-bold">Name: &nbsp; {user.name}</h1>
              <h2 className="text-xl font-semibold mt-1">ID: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {user.id}</h2>
              {user.role === UserRole.STUDENT && (
                  <h2 className="text-xl font-semibold mt-1">Group: &nbsp; {user.group}</h2>
              )}
              <h2 className="text-md text-gray-500 mt-2 uppercase tracking-wide">{user.role} VIEW</h2>
          </div>
        </div>
  
        {/* Navigation Tabs */}
        <div className="flex divide-x divide-black">
          <div onClick={() => navigate('/')} className={getTabClass('/')}>
            Subjects
          </div>
          <div onClick={() => navigate('/timetable')} className={getTabClass('/timetable')}>
            Timetable
          </div>
          <div onClick={() => navigate('/attendance')} className={getTabClass('/attendance')}>
            Attendance
          </div>
          <div onClick={() => navigate('/inbox')} className={getTabClass('/inbox')}>
            Inbox
          </div>
          <div onClick={onLogout} className="flex-1 py-3 text-center cursor-pointer font-bold bg-white hover:bg-red-50 text-red-600 transition-colors border-l-2 border-black flex items-center justify-center">
            Log out
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Layout 2: Academic Affairs (University Name Header + Tabs)
  // ---------------------------------------------------------------------------
  if (user.role === UserRole.ACADEMIC_AFFAIRS) {
    return (
        <div className="w-full bg-white">
            {/* Top Header */}
            <div className="p-6 border-b-2 border-black flex justify-between items-center">
                <h1 className="text-3xl font-bold">Inha University in Tashkent</h1>
                <div className="text-sm font-bold text-gray-500">Welcome, {user.name}</div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b-2 border-black divide-x-2 divide-black">
                 <div onClick={() => navigate('/timetable')} className={getTabClass('/timetable')}>
                    Timetable
                </div>
                <div onClick={() => navigate('/professor-list')} className={getTabClass('/professor-list', true) + (location.pathname === '/professor-list' ? ' !bg-[#9ca3af]' : '')}>
                    Professor list
                </div>
                <div onClick={() => navigate('/student-list')} className={getTabClass('/student-list', true) + (location.pathname === '/student-list' ? ' !bg-[#9ca3af]' : '')}>
                    Student list
                </div>
                <div onClick={() => navigate('/inbox')} className={getTabClass('/inbox', true) + (location.pathname === '/inbox' ? ' !bg-[#9ca3af]' : '')}>
                    Inbox
                </div>
                <div onClick={onLogout} className="flex-1 py-3 text-center cursor-pointer font-bold bg-white hover:bg-red-50 text-red-600 transition-colors flex items-center justify-center">
                    Log out
                </div>
            </div>
        </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Layout 3: SysAdmin (Simple Header)
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full border-b-2 border-black bg-gray-900 text-white">
        <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-mono font-bold text-green-400">&gt; SYS_ADMIN_CONSOLE</h1>
                <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded">CONNECTED</span>
            </div>
            <div className="flex gap-4">
                <button onClick={() => navigate('/sysadmin')} className="hover:text-green-400 font-mono">[DATABASE]</button>
                <button onClick={() => navigate('/inbox')} className="hover:text-green-400 font-mono">[INBOX]</button>
                <button onClick={onLogout} className="text-red-400 hover:text-red-300 font-mono">[LOG OUT]</button>
            </div>
        </div>
    </div>
  );
};