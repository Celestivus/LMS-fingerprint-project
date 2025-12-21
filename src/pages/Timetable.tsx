import React, { useState } from 'react';
import { User, UserRole, SECTIONS } from '../types';
import { SECTION_EVENTS, DAYS, TIMES } from '../students';

interface TimetableProps {
    user: User;
}

export const Timetable: React.FC<TimetableProps> = ({ user }) => {
  const [selectedSection, setSelectedSection] = useState<string>(
      user.role === UserRole.ACADEMIC_AFFAIRS ? SECTIONS[0] : 'CSE-23-01'
  );

  const events = SECTION_EVENTS[selectedSection] || [];

  return (
    <div className="flex flex-col h-full bg-white relative">
        <div className="flex-1 overflow-auto p-4 pb-28">
            <div className="flex justify-between items-center mb-6 px-4">
                 <div className="flex items-center gap-4">
                     <h1 className="text-4xl font-bold underline decoration-4 decoration-black underline-offset-8">
                         Timetable - {selectedSection}
                     </h1>
                 </div>
                 <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">Inha University in Tashkent</div>
                 </div>
            </div>

            <div className="relative border border-gray-200 shadow-xl rounded-xl overflow-hidden bg-white min-w-[1000px]">
                {/* Header Row (Times) */}
                <div className="flex border-b border-gray-200">
                    <div className="w-32 flex-shrink-0 bg-gray-50 border-r border-gray-200"></div>
                    {TIMES.map(time => (
                        <div key={time} className="flex-1 text-center text-xs text-gray-400 py-2 border-r border-gray-100 last:border-0">
                            {time}
                        </div>
                    ))}
                </div>


                {DAYS.map((day, dayIdx) => (
                    <div
                        key={day}
                        className={`flex border-b border-gray-200 h-24 relative ${dayIdx % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
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
                                        }}>
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

        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-50">
            <div className="bg-white border border-gray-200 shadow-lg rounded-full p-2 flex gap-3 overflow-x-auto max-w-[90%] scrollbar-hide">
                {SECTIONS.map(section => (
                    <button
                        key={section}
                        onClick={() => setSelectedSection(section)}
                        className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap
                            ${selectedSection === section
                                ? 'bg-black text-white border-black shadow-inner' 
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'}`}>
                        {section}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};
