
import React, { useState } from 'react';
import { User, UserRole, SECTIONS } from '../types';
import { studentsData } from '../students';
import { ChevronDown } from 'lucide-react';

const MOCK_STUDENTS_FULL: User[] = studentsData.map(s => ({
    id: s.id,
    name: s.name,
    role: UserRole.STUDENT,
    group: s.group,
    email: s.email
}));

export const StudentListAdmin: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('CSE-23-01');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white">
        {/* Header */}
         <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black">
            <div className="flex items-center gap-4 relative">
                <h1
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-4xl font-bold flex items-center gap-2 cursor-pointer select-none hover:text-blue-700 transition-colors">
                    Student list - <span className="text-gray-600">{currentSection}</span>
                    <ChevronDown size={32} className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </h1>

                {isMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsMenuOpen(false)}></div>

                        <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            <p className="text-[10px] font-black text-gray-400 mb-2 px-2 uppercase tracking-widest">Sections</p>
                            <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto scrollbar-hide">
                                {SECTIONS.map(section => (
                                    <div
                                        key={section}
                                        onClick={() => {
                                            setCurrentSection(section);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-black hover:text-white transition-colors rounded ${currentSection === section ? 'bg-slate-200' : ''}`}>
                                        {section}
                                    </div>))}
                            </div>
                        </div>
                    </>)}
            </div>
         </div>
         <div className="p-8">
             <div className="border-4 border-black min-h-[600px] relative bg-white overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                 <div className="flex border-b-2 border-black mt-8 mx-8 pb-4 shrink-0">
                     <div className="w-1/3 text-center text-2xl font-bold underline decoration-4 underline-offset-8">Name</div>
                     <div className="w-1/4 text-center text-2xl font-bold underline decoration-4 underline-offset-8">ID</div>
                     <div className="w-1/6 text-center text-2xl font-bold underline decoration-4 underline-offset-8">Group</div>
                     <div className="w-1/4 text-center text-2xl font-bold underline decoration-4 underline-offset-8">Email</div>
                 </div>

                 <div className="p-8 space-y-4 overflow-y-auto flex-1">
                     {MOCK_STUDENTS_FULL.map((student, idx) => (
                         <div key={idx} className="flex text-lg font-bold border-b border-gray-100 pb-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                             <div className="w-1/3 pl-4 group-hover:translate-x-1 transition-transform">{student.name}</div>
                             <div className="w-1/4 text-center">{student.id}</div>
                             <div className="w-1/6 text-center text-gray-400 group-hover:text-black transition-colors">{student.group}</div>
                             <div className="w-1/4 text-center underline text-blue-800 text-sm italic">{student.email}</div>
                         </div>
                     ))}
                 </div>
             </div>
         </div>
    </div>
  );
};
