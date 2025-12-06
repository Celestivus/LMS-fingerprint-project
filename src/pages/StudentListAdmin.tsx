
import React from 'react';
import { User, UserRole } from '../types';
import { studentsData } from '../students';

const MOCK_STUDENTS_FULL: User[] = studentsData.map(s => ({
    id: s.id,
    name: s.name,
    role: UserRole.STUDENT, 
    group: s.group,
    email: s.email
}));

export const StudentListAdmin: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white">
         {/* Header */}
         <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black">
            <h1 className="text-4xl font-bold">Student list - CSE 23-01</h1>
         </div>
         <div className="p-8">
             <div className="border-4 border-black min-h-[600px] relative bg-white overflow-hidden flex flex-col">
                 {/* Table Header */}
                 <div className="flex border-b-2 border-black mt-8 mx-8 pb-4 shrink-0">
                     <div className="w-1/3 text-center text-2xl font-bold underline decoration-4 underline-offset-8">Name</div>
                     <div className="w-1/4 text-center text-2xl font-bold underline decoration-4 underline-offset-8">ID</div>
                     <div className="w-1/6 text-center text-2xl font-bold underline decoration-4 underline-offset-8">Group</div>
                     <div className="w-1/4 text-center text-2xl font-bold underline decoration-4 underline-offset-8">Email</div>
                 </div>

                 <div className="p-8 space-y-4 overflow-y-auto flex-1">
                     {MOCK_STUDENTS_FULL.map((student, idx) => (
                         <div key={idx} className="flex text-lg font-bold border-b border-gray-100 pb-2 hover:bg-gray-50 transition-colors cursor-pointer">
                             <div className="w-1/3 pl-4">{student.name}</div>
                             <div className="w-1/4 text-center">{student.id}</div>
                             <div className="w-1/6 text-center text-gray-600">{student.group}</div>
                             <div className="w-1/4 text-center underline text-blue-800 text-sm">{student.email}</div>
                         </div>
                     ))}
                 </div>
             </div>
         </div>
    </div>
  );
};
    