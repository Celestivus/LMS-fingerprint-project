import React, { useState } from 'react';
import { User, UserRole } from '../types';

// Mock Data
const DEPARTMENTS = ['LOG/BUS', 'SOCIE', 'BM', 'MBA', 'IT', 'EMBA'];

const MOCK_PROFESSORS: User[] = [
    { id: 'U140001', name: 'Angelina Saydasheva', role: UserRole.PROFESSOR, email: 'a.saydasheva@student.inha.uz', department: 'SOCIE' },
    { id: 'U2310777', name: 'Gandon Ebanniy', role: UserRole.PROFESSOR, email: 's.shluxi@student.inha.uz', department: 'SOCIE' },
    { id: 'U2310090', name: 'Pizda Niso', role: UserRole.PROFESSOR, email: 's.shluxi@student.inha.uz', department: 'SOCIE' },
    { id: 'U2310008', name: 'Chlen Solekha', role: UserRole.PROFESSOR, email: 's.shluxi@student.inha.uz', department: 'SOCIE' },
    { id: 'U2310792', name: 'Pizda Sevinch', role: UserRole.PROFESSOR, email: 's.shluxi@student.inha.uz', department: 'BM' },
    { id: 'U2310777', name: 'Gandon Ebanniy', role: UserRole.PROFESSOR, email: 's.shluxi@student.inha.uz', department: 'IT' },
];

export const ProfessorList: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  if (!selectedDept) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] p-10 bg-white">
              <h1 className="text-4xl font-bold mb-16 text-center">Select the department of the professor.</h1>
              
              <div className="grid grid-cols-3 gap-12 w-full max-w-4xl">
                  {DEPARTMENTS.map(dept => (
                      <button 
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className="bg-[#2d2d2d] text-white py-12 text-xl font-medium rounded-lg shadow-xl hover:bg-black hover:scale-105 transition-all"
                      >
                          {dept}
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  const filteredProfs = MOCK_PROFESSORS.filter(p => p.department === selectedDept || !p.department); // Fallback to show some if dept missing

  return (
    <div className="flex flex-col h-full bg-white">
         {/* Header Title for the list view */}
         <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black">
            <h1 className="text-4xl font-bold flex items-center gap-4">
                Professors' list - <span className="text-gray-600">{selectedDept}</span>
            </h1>
            <button 
                onClick={() => setSelectedDept(null)}
                className="bg-[#2d2d2d] text-white px-6 py-2 rounded font-bold hover:bg-black"
            >
                Back to Departments
            </button>
         </div>

         {/* Table Container with border */}
         <div className="p-8">
             <div className="border-4 border-black min-h-[600px] relative">
                 {/* Table Header */}
                 <div className="flex border-b-2 border-black mt-8 mx-8 pb-4">
                     <div className="w-1/3 text-center text-3xl font-bold underline decoration-4 underline-offset-8">Name</div>
                     <div className="w-1/3 text-center text-3xl font-bold underline decoration-4 underline-offset-8">ID</div>
                     <div className="w-1/3 text-center text-3xl font-bold underline decoration-4 underline-offset-8">Email</div>
                 </div>

                 {/* List */}
                 <div className="p-8 space-y-8">
                     {filteredProfs.length > 0 ? filteredProfs.map((prof, idx) => (
                         <div key={idx} className="flex text-xl font-bold">
                             <div className="w-1/3 text-center">{prof.name}</div>
                             <div className="w-1/3 text-center">{prof.id}</div>
                             <div className="w-1/3 text-center underline">{prof.email}</div>
                         </div>
                     )) : (
                        <div className="text-center text-gray-400 text-2xl mt-20">No professors found in this department.</div>
                     )}
                 </div>
             </div>
         </div>
    </div>
  );
};