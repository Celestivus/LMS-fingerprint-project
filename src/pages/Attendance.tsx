
import React, { useState, useRef } from 'react';
import { User, UserRole, SECTIONS } from '../types';
import { Upload, ChevronDown } from 'lucide-react';
import { studentsData } from '../students';
import { FingerprintScanner } from './FingerprintScanner';
import { getWS } from '../ws';

interface AttendanceProps {
  user: User;
}
const WEEKS = Array.from({ length: 15 }, (_, i) => i + 1);

const SESSIONS = WEEKS.flatMap(week => [
    { id: `${week}-1`, label: `${week}.1` },
    { id: `${week}-2`, label: `${week}.2` }
]);

const ProfessorAttendanceView: React.FC = () => {
    const [markingMode, setMarkingMode] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
    const [showScanner, setShowScanner] = useState(false);
    const [currentSection, setCurrentSection] = useState('CSE-23-01');
    const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);

    const PROF_VIEW_STUDENTS = studentsData
        .filter(s => s.group === currentSection)
        .map(s => ({
            id: s.id,
            name: s.name,
            absences: s.absences
        }));

    const allowedSections = ['CSE-23-01', 'CSE-23-02', 'CSE-23-03'];

    const toggleAttendance = (studentId: string, sessionLabel: string) => {
        if (!markingMode) return;
        const targetSessionId = SESSIONS.find(s => s.label === sessionLabel)?.id;
        if (targetSessionId !== selectedSession) return;

        const key = `${studentId}-${sessionLabel}`;
        setAttendanceData(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSessionClick = (sessionId: string) => {
        if (markingMode) {
            if (confirm("Stop marking current session and switch?")) {
                setMarkingMode(false);
                setSelectedSession(sessionId);
            }
        } else {
            setSelectedSession(sessionId);
        }
    };

    const handleStartMarking = () => {
        if (!selectedSession) return;

        if (!markingMode) {
            setShowScanner(true);
        } else {
            setMarkingMode(false);
            setSelectedSession(null);
        }
    };

    const handleScanComplete = () => {
        setShowScanner(false);
        setMarkingMode(true);
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {showScanner && <FingerprintScanner onComplete={handleScanComplete} />}
            <div className="flex border-b-4 border-black shrink-0 z-[80] relative bg-white">
                <div className="w-1/4 p-4 border-r-4 border-black relative">
                    <div
                        className="cursor-pointer flex items-center justify-between group"
                        onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)}
                    >
                        <div>
                            <h1 className="text-3xl font-bold">Course name</h1>
                            <h2 className="text-2xl font-bold text-gray-700">{currentSection}</h2>
                        </div>
                        <ChevronDown className={`transition-transform ${isSectionMenuOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isSectionMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-x-4 border-b-4 border-black z-[90] shadow-xl">
                            {allowedSections.map(section => (
                                <div
                                    key={section}
                                    onClick={() => {
                                        setCurrentSection(section);
                                        setIsSectionMenuOpen(false);
                                    }}
                                    className={`p-4 hover:bg-slate-100 font-bold cursor-pointer border-b border-gray-200 last:border-0 ${currentSection === section ? 'bg-slate-100' : ''}`}>
                                    {section}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-1 p-4 flex justify-between items-center bg-white">
                     <h1 className="text-3xl font-bold">Inha University in Tashkent</h1>
                        <button
                            onClick={handleStartMarking}
                            disabled={!selectedSession}
                            className={`font-bold py-3 px-8 rounded shadow-md transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none
                                ${markingMode 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : !selectedSession 
                                        ? 'bg-gray-200 text-gray-400 border-gray-300 shadow-none cursor-not-allowed' 
                                        : 'bg-[#10b981] hover:bg-[#059669] text-white'}`}>
                            {markingMode ? 'Finish marking attendance' : 'Start marking attendance'}
                        </button>
                     </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50/30">
                <div className="min-w-max">
                    <div className="flex sticky top-0 z-40 bg-gray-50 shadow-sm border-b-2 border-black h-16">
                        <div className="sticky left-0 w-64 flex shrink-0 border-r-2 border-black bg-gray-50 z-50">
                            <div className="w-1/2 p-3 font-bold text-xl border-r-2 border-black flex items-center justify-center">Name</div>
                            <div className="w-1/2 p-3 font-bold text-xl flex items-center justify-center">ID</div>
                        </div>

                        <div className="flex">
                            {SESSIONS.map(session => (
                                <div
                                    key={session.id}
                                    onClick={() => handleSessionClick(session.id)}
                                    className={`w-[50px] shrink-0 border-r border-black flex items-center justify-center text-sm font-bold cursor-pointer transition-all relative group h-full
                                        ${selectedSession === session.id 
                                            ? 'bg-[#2a4580] text-white' 
                                            : 'hover:bg-gray-200 bg-white'}`} >
                                    {session.label}
                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                        Select
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="sticky right-0 w-32 shrink-0 p-3 font-bold text-sm text-center flex items-center justify-center border-l-2 border-black bg-gray-50 z-50">
                            Total Absences
                        </div>
                    </div>

                    <div className="bg-white">
                        {PROF_VIEW_STUDENTS.map((student) => (
                            <div key={student.id} className="flex border-b border-black h-12 hover:bg-slate-50 group">
                                <div className="sticky left-0 w-64 flex shrink-0 border-r-2 border-black bg-white z-30 group-hover:bg-slate-50 h-full">
                                    <div className="w-1/2 p-2 text-xs font-bold border-r border-gray-300 flex items-center justify-center text-center leading-tight">
                                        {student.name}
                                    </div>
                                    <div className="w-1/2 p-2 text-xs font-semibold flex items-center justify-center">{student.id}</div>
                                </div>

                                <div className="flex h-full">
                                    {SESSIONS.map(session => {
                                        const key = `${student.id}-${session.label}`;
                                        const isAbsent = attendanceData[key];
                                        const isActiveColumn = selectedSession === session.id;

                                        return (
                                        <div
                                            key={session.id}
                                            onClick={() => toggleAttendance(student.id, session.label)}
                                            className={`w-[50px] shrink-0 border-r border-gray-300 flex items-center justify-center transition-colors h-full
                                                ${isActiveColumn 
                                                    ? (markingMode ? 'bg-white cursor-pointer hover:bg-red-50' : 'bg-blue-50 cursor-default') 
                                                    : 'bg-gray-50 opacity-50'}
                                                ${isAbsent ? 'bg-red-200 !opacity-100' : ''}`}>
                                            {isAbsent && <span className="text-red-600 font-bold">A</span>}
                                        </div>
                                    )})}
                                </div>

                                <div className="sticky right-0 w-32 shrink-0 flex items-center justify-center font-bold text-lg border-l-2 border-black bg-white z-30 group-hover:bg-slate-50 h-full">
                                        {student.absences + Object.keys(attendanceData).filter(k => k.startsWith(student.id)).length}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const StudentAttendanceView: React.FC<{ user: User }> = ({ user }) => {
    const [popupSlot, setPopupSlot] = useState<{course: string, weekIdx: number, top: number, left: number} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleCellClick = (e: React.MouseEvent, courseName: string, weekIdx: number, isAbsent: boolean) => {
        if (!isAbsent) return;
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setPopupSlot({
            course: courseName,
            weekIdx: weekIdx,
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX - 100
        });
        setFileName(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleSubmit = () => {
        if (!fileName) {
            alert("Please select a file first.");
            return;
        }

        const ws = getWS();
        if (ws && ws.readyState === WebSocket.OPEN) {
            const payload = {
                file: "submit_med_cert",
            };
            ws.send(JSON.stringify(payload));
        }

        alert(`Medical certificate '${fileName}' submitted to Professor and Academic Affairs.`);
        setPopupSlot(null);
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {popupSlot && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setPopupSlot(null)}></div>
                    <div
                        className="absolute z-50 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 rounded-lg w-80 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-200"
                        style={{ top: popupSlot.top + 10, left: Math.max(10, popupSlot.left) }}>
                        <div className="text-sm font-bold text-center">
                            Upload your medical certificate
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden" />

                        <div
                            onClick={handleUploadClick}
                            className="w-full h-32 border-2 border-dashed border-gray-400 rounded bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                            <Upload size={32} className="text-gray-400 mb-2"/>
                            <span className="text-xs text-gray-500 font-bold">
                                {fileName ? fileName : 'Click to browse'}
                            </span>
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="bg-[#10b981] hover:bg-[#059669] text-white w-full py-2 rounded font-bold shadow-md active:translate-y-1 active:shadow-none transition-all">
                            Submit
                        </button>

                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-black transform rotate-45"></div>
                    </div>
                </>
            )}

            <div className="flex border-b-4 border-black bg-white shrink-0">
                <div className="w-96 flex-shrink-0 p-4 border-r-4 border-black flex items-center justify-center">
                    <h1 className="text-3xl font-bold">Subjects</h1>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center">
                    <h1 className="text-3xl font-bold">Weeks & Lecture</h1>
                </div>
                <div className="w-32 flex-shrink-0 p-4 border-l-4 border-black flex items-center justify-center">
                     <h1 className="text-sm font-bold text-center">Total absences</h1>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50/30">
                <div className="min-w-max">
                     <div className="flex sticky top-0 z-40 bg-white border-b-2 border-black h-12">
                         <div className="sticky left-0 z-50 bg-white w-96 border-r-4 border-black flex items-center justify-center font-bold text-xl shrink-0 h-full">
                            Courses
                         </div>
                         <div className="flex h-full">
                            {SESSIONS.map(session => (
                                <div key={session.id} className="w-[50px] shrink-0 border-r border-black flex items-center justify-center text-[10px] font-bold bg-gray-100 h-full">
                                    {session.label}
                                </div>
                            ))}
                         </div>
                         <div className="sticky right-0 z-50 bg-white w-32 border-l-4 border-black shrink-0 h-full"></div>
                    </div>

                    <div className="bg-white pb-10">
                        {STUDENT_VIEW_COURSES.map((course, idx) => (
                            <div key={idx} className="flex border-b border-black h-14 hover:bg-slate-50 group">
                                <div className="sticky left-0 z-30 bg-white w-96 shrink-0 border-r-4 border-black p-3 font-bold text-sm flex items-center justify-center text-center group-hover:bg-slate-50 h-full">
                                    {course.name}
                                </div>

                                <div className="flex h-full">
                                    {SESSIONS.map((session, sIdx) => {
                                        const isAbsent = course.absences.includes(sIdx);

                                        return (
                                        <div
                                            key={session.id}
                                            onClick={(e) => handleCellClick(e, course.name, sIdx, isAbsent)}
                                            className={`w-[50px] shrink-0 border-r border-gray-300 flex items-center justify-center text-xs font-bold transition-colors h-full
                                                ${isAbsent ? 'bg-red-50 cursor-pointer hover:bg-red-100 text-red-600' : ''}`}>
                                            {isAbsent ? '0' : ''}
                                        </div>
                                    )})}
                                </div>
                                <div className="sticky right-0 z-30 bg-white w-32 shrink-0 border-l-4 border-black flex items-center justify-center font-bold text-lg group-hover:bg-slate-50 h-full">
                                    {course.absences.length > 0 ? course.absences.length : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const STUDENT_VIEW_COURSES = [
    { name: 'Database', absences: [3] },
    { name: 'Operating System', absences: [] },
    { name: 'System Analysis', absences: [14] },
    { name: 'Engineering Communications', absences: [] },
    { name: 'Computer Algorithm', absences: [] },
    { name: 'History', absences: [] },
    { name: 'Academic English', absences: [] },
    { name: 'Java Programming', absences: [] },
];

export const Attendance: React.FC<AttendanceProps> = ({ user }) => {
    if (user.role === UserRole.STUDENT) {
        return <StudentAttendanceView user={user} />;
    }
    return <ProfessorAttendanceView />;
};
