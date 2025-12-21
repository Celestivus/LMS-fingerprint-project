import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getWS, addMessageListener, removeMessageListener } from '../ws';

const DEPARTMENTS = ['LOG', 'SOCIE', 'BUS'];

export const ProfessorList: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [professors, setProfessors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch professors when department is selected
  useEffect(() => {
    if (!selectedDept) return;

    setLoading(true);
    const handleProfessorsList = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === 'professors_list' && data.department === selectedDept) {
          const professorUsers = (data.professors || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            role: UserRole.PROFESSOR,
            email: p.email,
            department: p.department
          }));
          setProfessors(professorUsers);
          setLoading(false);
        }
      } catch (e) {
        console.error('Error parsing professors list:', e);
      }
    };

    const ws = getWS();
    if (ws) {
      addMessageListener(handleProfessorsList);
      ws.send(
        JSON.stringify({
          type: 'get_professors_by_department',
          department: selectedDept
        })
      );

      return () => {
        removeMessageListener(handleProfessorsList);
      };
    }
  }, [selectedDept]);

  if (!selectedDept) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] p-10 bg-white">
              <h1 className="text-4xl font-bold mb-16 text-center">Select the department of the professor.</h1>
              
              <div className="grid grid-cols-3 gap-12 w-full max-w-4xl">
                  {DEPARTMENTS.map(dept => (
                      <button 
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className="bg-[#2d2d2d] text-white py-12 text-xl font-medium rounded-lg shadow-xl hover:bg-black hover:scale-105 transition-all">
                          {dept}
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-white">
         {/* Header Title for the list view */}
         <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black">
            <h1 className="text-4xl font-bold flex items-center gap-4">
                Professors' list - <span className="text-gray-600">{selectedDept}</span>
            </h1>
            <button 
                onClick={() => setSelectedDept(null)}
                className="bg-[#2d2d2d] text-white px-6 py-2 rounded font-bold hover:bg-black">
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
                     {loading ? (
                       <div className="text-center text-gray-500 py-8">Loading professors...</div>
                     ) : professors.length > 0 ? (
                       professors.map((prof, idx) => (
                         <div key={idx} className="flex text-xl font-bold">
                             <div className="w-1/3 text-center">{prof.name}</div>
                             <div className="w-1/3 text-center">{prof.id}</div>
                             <div className="w-1/3 text-center underline">{prof.email}</div>
                         </div>
                       ))
                     ) : (
                        <div className="text-center text-gray-400 text-2xl mt-20">No professors found in this department.</div>
                     )}
                 </div>
             </div>
         </div>
    </div>
  );
};