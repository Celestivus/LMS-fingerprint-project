import React, { useEffect, useRef, useState } from 'react';

const DEPARTMENTS = ['LOG', 'SOCIE', 'BUS'] as const;

type Professor = {
  id: string;
  name: string;
  email: string | null;
  department: string;
};

export const ProfessorList: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  // Establish WebSocket connection once
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected for ProfessorList');
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'professors_list') {
          setProfessors(
            msg.professors.map((p: any) => ({
              id: p.id,
              name: p.name,
              email: p.email || '—',
              department: p.department,
            }))
          );
          setLoading(false);
        }
      } catch (err) {
        console.error('Error parsing professor message:', err);
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
    if (!selectedDept) {
      setProfessors([]);
      return;
    }

    setLoading(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'get_professors_by_department',
          department: selectedDept,
        })
      );
    } else {
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'get_professors_by_department',
              department: selectedDept,
            })
          );
        }
      }, 500);
    }
  }, [selectedDept]);

  if (!selectedDept) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] p-10 bg-white">
        <h1 className="text-4xl font-bold mb-16 text-center">
          Select the department of the professor.
        </h1>

        <div className="grid grid-cols-3 gap-12 w-full max-w-4xl">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept} onClick={() => setSelectedDept(dept)}
              className="bg-[#2d2d2d] text-white py-12 text-xl font-medium rounded-lg shadow-xl hover:bg-black hover:scale-105 transition-all">
              {dept}
            </button>))}
        </div>
      </div>);
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-8 py-6 border-b-4 border-black">
        <h1 className="text-4xl font-bold flex items-center gap-4">
          Professors' list - <span className="text-gray-600">{selectedDept}</span>
        </h1>
        <button
          onClick={() => setSelectedDept(null)} className="bg-[#2d2d2d] text-white px-6 py-2 rounded font-bold hover:bg-black">
          Back to Departments
        </button>
      </div>

      <div className="p-8">
        <div className="border-4 border-black min-h-[600px] relative">
          <div className="flex border-b-2 border-black mt-8 mx-8 pb-4">
            <div className="w-1/3 text-center text-3xl font-bold underline decoration-4 underline-offset-8">
              Name
            </div>
            <div className="w-1/3 text-center text-3xl font-bold underline decoration-4 underline-offset-8">
              ID
            </div>
            <div className="w-1/3 text-center text-3xl font-bold underline decoration-4 underline-offset-8">
              Email
            </div>
          </div>

          <div className="p-8 space-y-8">
            {loading ? (
              <div className="text-center text-gray-600 text-2xl mt-20">
                Loading professors...
              </div>
            ) : professors.length > 0 ? (
              professors.map((prof, idx) => (
                <div key={idx} className="flex text-xl font-bold">
                  <div className="w-1/3 text-center">{prof.name}</div>
                  <div className="w-1/3 text-center">{prof.id}</div>
                  <div className="w-1/3 text-center underline">
                    {prof.email}
                  </div>
                </div>))) : (
              <div className="text-center text-gray-400 text-2xl mt-20">
                No professors found in this department.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};