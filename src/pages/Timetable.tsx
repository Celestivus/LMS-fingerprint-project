
import React, { useState } from 'react';
import { User } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMES = [
    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

interface ClassEvent {
    id: number;
    name: string;
    day: string;
    start: string;
    end: string;
    type: string;
}

const INITIAL_EVENTS: ClassEvent[] = [
    { id: 1, name: 'Operating System', day: 'Monday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 2, name: 'Database Systems', day: 'Tuesday', start: '11:30', end: '13:00', type: 'lecture' },
    { id: 3, name: 'Web Engineering', day: 'Tuesday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 4, name: 'Operating System', day: 'Wednesday', start: '09:30', end: '11:00', type: 'lab' },
    { id: 5, name: 'Calculus I', day: 'Thursday', start: '13:00', end: '14:30', type: 'lecture' },
    { id: 6, name: 'Physics', day: 'Friday', start: '14:00', end: '17:00', type: 'lab' },
    { id: 7, name: 'History', day: 'Saturday', start: '11:30', end: '13:00', type: 'lecture' },
];

interface TimetableProps {
    user?: User;
}

export const Timetable: React.FC<TimetableProps> = ({ user }) => {
  const [events] = useState<ClassEvent[]>(INITIAL_EVENTS);

  return (
    <div className="flex flex-col h-full bg-white p-4 overflow-auto">
        <div className="flex justify-between items-center mb-6 px-4">
             <h1 className="text-4xl font-bold underline decoration-4 decoration-black underline-offset-8">Timetable</h1>
             <h1 className="text-4xl font-bold underline decoration-4 decoration-black underline-offset-8">SOCIE</h1>
             <div className="text-right">
                <div className="text-3xl font-bold text-gray-800">Inha University in Tashkent</div>
             </div>
        </div>

        <div className="relative border border-gray-200 shadow-xl rounded-xl overflow-hidden bg-white">
            {/* Header Row (Times) */}
            <div className="flex border-b border-gray-200">
                <div className="w-32 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div>
                {TIMES.map(time => (
                    <div key={time} className="flex-1 text-center text-xs text-gray-400 py-2 border-r border-gray-100 last:border-0">
                        {time}
                    </div>
                ))}
            </div>

            {/* Day Rows */}
            {DAYS.map((day, dayIdx) => (
                <div
                    key={day}
                    className={`flex border-b border-gray-200 h-24 relative ${dayIdx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                >
                    <div className="w-32 flex-shrink-0 flex items-center justify-center font-medium text-gray-500 border-r border-gray-200">
                        {day}
                    </div>

                    <div className="flex-1 flex relative">
                        {TIMES.map(time => (
                            <div key={time} className="flex-1 border-r border-gray-100 last:border-0 h-full"></div>
                        ))}

                        {events.filter(e => e.day === day).map((event) => {
                            const startIndex = TIMES.indexOf(event.start);
                            const endIndex = TIMES.indexOf(event.end);
                            if (startIndex === -1) return null;

                            const widthPercent = ((endIndex - startIndex) / TIMES.length) * 100;
                            const leftPercent = (startIndex / TIMES.length) * 100;

                            return (
                                <div
                                    key={event.id}
                                    className={`absolute top-2 bottom-2 rounded-lg text-white shadow-md flex flex-col items-center justify-center p-2 text-center hover:scale-[1.02] transition-transform z-10 cursor-default
                                        ${event.type === 'lecture' ? 'bg-[#5aaeb1]' : 'bg-[#eab308]'}`}
                                    style={{
                                        left: `${leftPercent}%`,
                                        width: `${widthPercent}%`
                                    }}
                                >
                                    <span className="font-bold text-sm leading-tight">{event.name}</span>
                                    <span className="text-[10px] opacity-90 mt-1">{event.type}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
