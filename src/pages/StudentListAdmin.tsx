import React, { useEffect, useRef, useState } from 'react';
import { SECTIONS } from '../types';
import { ChevronDown } from 'lucide-react';

type StudentRow = {
  id: string;
  name: string;
  section: string;
  email: string;
};

export const StudentListAdmin: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('CSE-23-01');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for StudentListAdmin');
      ws.send(JSON.stringify({
        type: 'get_students_by_section',
        section: currentSection
      }));
      setLoading(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'students_list') {
          setStudents(
            msg.students.map((s: any) => ({
              id: s.id,
              name: s.name,
              section: s.section,
              email: s.email
            }))
          );
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing student message:', err);
        setLoading(false);
      }
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (!wsRef.current) return;

    setLoading(true);

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'get_students_by_section',
        section: currentSection
      }));
    } else {
      const reconnect = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'get_students_by_section',
            section: currentSection
          }));
        }
      };
      setTimeout(reconnect, 500);
    }
  }, [currentSection]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black">
        <div className="flex items-center gap-4 relative">
          <h1
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-4xl font-bold flex items-center gap-2 cursor-pointer select-none hover:text-blue-700 transition-colors">
            Student list –{' '}
            <span className="text-gray-600">{currentSection}</span>
            <ChevronDown
              size={32}
              className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}/></h1>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 p-2">
                <p className="text-[10px] font-black text-gray-400 mb-2 px-2 uppercase tracking-widest">
                  Sections
                </p>
                <div className="grid grid-cols-1 gap-1 max-h-60 overflow-y-auto">
                  {SECTIONS.map(section => (
                    <div key={section} onClick={() => {
                        setCurrentSection(section);
                        setIsMenuOpen(false);
                      }}
                      className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-black hover:text-white transition-colors rounded ${
                        currentSection === section ? 'bg-slate-200' : ''}`}>
                      {section}
                    </div>))}
                </div>
              </div>
            </>)}
        </div>
      </div>


      <div className="p-8">
        <div className="border-4 border-black min-h-[600px] bg-white flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex border-b-2 border-black mt-8 mx-8 pb-4">
            <div className="w-1/3 text-center text-2xl font-bold underline">Name</div>
            <div className="w-1/4 text-center text-2xl font-bold underline">ID</div>
            <div className="w-1/6 text-center text-2xl font-bold underline">Section</div>
            <div className="w-1/4 text-center text-2xl font-bold underline">Email</div>
          </div>

          <div className="p-8 space-y-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center text-gray-600 text-2xl mt-20">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="text-center text-gray-400 font-bold text-2xl">
                No students found in this section
              </div>
            ) : (
              students.map((s, idx) => (
                <div
                  key={idx}
                  className="flex text-lg font-bold border-b border-gray-100 pb-2 hover:bg-slate-50 transition-colors">
                  <div className="w-1/3 pl-4">{s.name}</div>
                  <div className="w-1/4 text-center">{s.id}</div>
                  <div className="w-1/6 text-center text-gray-400">{s.section}</div>
                  <div className="w-1/4 text-center underline text-blue-800 text-sm italic">
                    {s.email}
                  </div>
                </div>)))}
          </div>
        </div>
      </div>
    </div>
  );
};