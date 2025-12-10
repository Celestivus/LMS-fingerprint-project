import React from 'react';
import { Course } from '../types';

const MOCK_COURSES: Course[] = [
  { id: '1', code: 'SOC3010', name: 'Operating System', section: '001' },
  { id: '2', code: 'CSE3020', name: 'Database Systems', section: '002' },
  { id: '3', code: 'ICE2010', name: 'Computer Architecture', section: '001' },
  { id: '4', code: 'MAT1010', name: 'Calculus I', section: '003' },
  { id: '5', code: 'PHY1010', name: 'General Physics', section: '001' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        {MOCK_COURSES.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-6 group cursor-pointer">
            <div className="border-4 border-black px-6 py-8 font-bold text-3xl bg-white group-hover:bg-slate-50 min-w-[220px] text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none">
              {course.code}
            </div>
            <div className="flex-1 border-4 border-black px-10 py-8 font-bold text-3xl bg-white group-hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:shadow-none">
              <span>{course.name} - [Section {course.section}]</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};