import React, { useState, useRef } from 'react';
import { User, UserRole, SECTIONS } from '../types';
import { Upload, ChevronDown } from 'lucide-react';
import { studentsData } from '../students';
import { FingerprintUploadModal } from '../components/FingerprintUploadModal';
import { connectWS, getWS, addMessageListener, removeMessageListener } from '../ws';

interface AttendanceProps {
  user: User;
}

const STUDENT_VIEW_COURSES = [
    { name: 'Database', absences: [3] },
    { name: 'Operating System', absences: [] },
    { name: 'System Analysis', absences: [14] },
    { name: 'Engineering Communications', absences: [] },
    { name: 'Computer Algorithm', absences: [] },
    { name: 'History 2', absences: [] },
    { name: 'Academic English', absences: [] },
];

const WEEKS = Array.from({ length: 15 }, (_, i) => i + 1);

const SESSIONS = WEEKS.flatMap(week => [
    { id: `${week}-1`, label: `${week}.1` },
    { id: `${week}-2`, label: `${week}.2` }
]);

const ProfessorAttendanceView: React.FC = () => {
    const [markingMode, setMarkingMode] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    // Load attendance data from localStorage on mount (but can be cleared)
    const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('professorAttendanceData');
        return saved ? JSON.parse(saved) : {};
    });
    const [showScanner, setShowScanner] = useState(false);
    const [showFingerprintUpload, setShowFingerprintUpload] = useState(false);

    const [currentCourse, setCurrentCourse] = useState(STUDENT_VIEW_COURSES[0].name);
    const [isCourseMenuOpen, setIsCourseMenuOpen] = useState(false);

    const [currentSection, setCurrentSection] = useState('CSE-23-01');
    const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);

    const [profViewStudents, setProfViewStudents] = React.useState<Array<{id:string;name:string;absences:number;email?:string}>>([]);

    // Clear old localStorage cache on first mount
    React.useEffect(() => {
        console.log('Professor view mounted - clearing old localStorage cache');
        localStorage.removeItem('professorAttendanceData');
        setAttendanceData({});
    }, []);

    // Request students list from server when section changes
    React.useEffect(() => {
        // ensure WS is connected (App should call connectWS on mount but double-check)
        connectWS('127.0.0.1');

        const listener = (ev: MessageEvent) => {
            try {
                const msg = JSON.parse(ev.data);
                console.log('Frontend received message:', msg);
                
                if (msg && msg.type === 'students_list') {
                    console.log('Current section:', currentSection, 'Response section:', msg.section);
                    
                    if (msg.section === currentSection) {
                        console.log('Section matches, setting students:', msg.students?.length || 0);
                        const students = (msg.students || [])
                            .map((s: any) => ({
                                id: s.id,
                                name: s.name,
                                absences: 0,
                                email: s.email
                            }))
                            .sort((a: any, b: any) => a.id.localeCompare(b.id));
                        setProfViewStudents(students);
                    }
                }
            } catch (e) {
                console.error('Invalid WS message', e);
            }
        };

        addMessageListener(listener);

        // send request, retry until socket is open (max attempts)
        const payload = { type: 'get_students_by_section', section: currentSection };
        let attempts = 0;
        const maxAttempts = 40; // ~10s if interval 250ms
        const interval = setInterval(() => {
            const ws = getWS();
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    console.log('Sending request for section:', currentSection);
                    ws.send(JSON.stringify(payload));
                } catch (e) {
                    console.error('Failed to send students request', e);
                }
                clearInterval(interval);
            } else {
                attempts += 1;
                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    console.error('WebSocket not available to request students');
                }
            }
        }, 250);

        return () => {
            removeMessageListener(listener);
            clearInterval(interval);
        };
    }, [currentSection]);

    // Load attendance from localStorage on mount (instant display, no server wait)
    React.useEffect(() => {
        const saved = localStorage.getItem('professorAttendanceData');
        if (saved) {
            try {
                setAttendanceData(JSON.parse(saved));
                console.log('Loaded attendance from localStorage on mount');
            } catch (e) {
                console.error('Failed to parse localStorage attendance data', e);
            }
        }
    }, []);

    // Fetch attendance for currently selected week/course ONLY (on-demand, not all weeks)
    React.useEffect(() => {
        console.log('Fetching attendance for current week:', currentCourse, currentSection, selectedSession);
        
        if (!selectedSession) return; // Don't fetch if no session selected
        
        connectWS('127.0.0.1');

        const requestId = `${Date.now()}-${Math.floor(Math.random()*10000)}`;
        let listener: ((ev: MessageEvent) => void) | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        listener = (ev: MessageEvent) => {
            try {
                const msg = JSON.parse(ev.data) as any;
                if (msg && msg.type === 'attendance_data') {
                    console.log('Attendance data received for week:', selectedSession, msg);
                    
                    if (msg.attendance && Array.isArray(msg.attendance)) {
                        setAttendanceData(prev => {
                            const newData = { ...prev };
                            msg.attendance.forEach((record: any) => {
                                const key = `${record.student_id}-${record.session_label}-${record.course_name || currentCourse}`;
                                newData[key] = record.attendance === 0;
                                console.log(`Updated: ${key} = ${record.attendance === 0}`);
                            });
                            localStorage.setItem('professorAttendanceData', JSON.stringify(newData));
                            return newData;
                        });
                    }
                    
                    if (listener && timeoutId) {
                        removeMessageListener(listener);
                        clearTimeout(timeoutId);
                    }
                }
            } catch (e) {
                console.error('Invalid WS message', e);
            }
        };

        addMessageListener(listener);

        // Get the session label for the selected session ID
        const sessionLabel = SESSIONS.find(s => s.id === selectedSession)?.label;
        if (!sessionLabel) return;

        const payload = {
            type: 'get_attendance_data',
            section: currentSection,
            course: currentCourse,
            week: sessionLabel,
            request_id: requestId
        };

        let attempts = 0;
        const interval = setInterval(() => {
            const ws = getWS();
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    console.log('Fetching attendance for selected week:', sessionLabel);
                    ws.send(JSON.stringify(payload));
                    clearInterval(interval);
                } catch (e) {
                    console.error('Failed to send request', e);
                    clearInterval(interval);
                }
            } else {
                attempts += 1;
                if (attempts >= 20) {
                    clearInterval(interval);
                    console.error('WebSocket unavailable');
                }
            }
        }, 100);

        timeoutId = setTimeout(() => {
            console.warn('Attendance fetch timeout');
            if (listener) removeMessageListener(listener);
        }, 10000);

        return () => {
            if (listener) removeMessageListener(listener);
            if (timeoutId) clearTimeout(timeoutId);
            clearInterval(interval);
        };
    }, [currentCourse, currentSection, selectedSession]);

    const allowedSections = ['CSE-23-01', 'CSE-23-02', 'CSE-23-03'];

    const toggleAttendance = (studentId: string, sessionLabel: string) => {
        // Disable manual toggling - attendance should only be set by fingerprint upload
        return;
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
        // Auto-select first session if none selected
        if (!selectedSession) {
            setSelectedSession(SESSIONS[0].id);
        }
        // Show fingerprint upload modal
        setShowFingerprintUpload(true);
    };

    const handleFingerprintUploadSuccess = (uploadedWeek: string) => {
        // Close modal 
        setShowFingerprintUpload(false);
        
        // Use the week that was selected in the modal for the upload
        const sessionLabel = uploadedWeek;
        
        console.log('handleFingerprintUploadSuccess called with uploadedWeek:', sessionLabel, 'section:', currentSection, 'course:', currentCourse);
        
        if (!sessionLabel) {
            console.error('No session label found');
            return;
        }

        // Update selectedSession to match the uploaded week
        const matchingSession = SESSIONS.find(s => s.label === sessionLabel);
        if (matchingSession) {
            setSelectedSession(matchingSession.id);
        }

        // Small delay to ensure modal is fully closed before fetching
        setTimeout(() => {
            // Fetch attendance data from DB for this week/course/section
            connectWS('127.0.0.1');
            
            const requestId = `${Date.now()}-${Math.floor(Math.random()*10000)}`;

            const listener = (ev: MessageEvent) => {
                try {
                    const msg = JSON.parse(ev.data) as any;
                    console.log('Message received:', msg.type, msg);
                    
                    if (msg && msg.type === 'attendance_data') {
                        console.log('Attendance data received, checking request_id match. Expected:', requestId, 'Got:', msg.request_id);
                        
                        // Only process if request_id matches (or if msg has no request_id for backward compat)
                        if (msg.request_id === requestId || msg.request_id === undefined) {
                            console.log('Request ID matched! Processing attendance data...');
                            
                            // Populate attendanceData from DB - MERGE with existing data
                            if (msg.attendance && Array.isArray(msg.attendance)) {
                                const newAttendanceData: Record<string, boolean> = { ...attendanceData };
                                msg.attendance.forEach((record: any) => {
                                    // Include course name in key to prevent cross-course data collision
                                    const key = `${record.student_id}-${record.session_label}-${record.course_name || currentCourse}`;
                                    // 0 = absent (true in our UI), 1 = present (false in our UI)
                                    newAttendanceData[key] = record.attendance === 0;
                                    console.log(`Set ${key} = ${record.attendance === 0} (attendance: ${record.attendance})`);
                                });
                                setAttendanceData(newAttendanceData);
                                // Persist to localStorage
                                localStorage.setItem('professorAttendanceData', JSON.stringify(newAttendanceData));
                                console.log('Final attendance data state:', newAttendanceData);
                            } else {
                                console.log('No attendance array in response');
                            }
                            
                            clearTimeout(timeoutId);
                            removeMessageListener(listener);
                        } else {
                            console.log('Request ID mismatch, ignoring this message');
                        }
                    }
                } catch (e) {
                    console.error('Invalid WS message', e);
                    removeMessageListener(listener);
                }
            };

            addMessageListener(listener);

            const payload = {
            type: 'get_attendance_data',
            section: currentSection,
            course: currentCourse,
            week: sessionLabel,
            request_id: requestId
            };

            let attempts = 0;
            const maxAttempts = 40;
            let messageSent = false;
            const interval = setInterval(() => {
                const ws = getWS();
                if (ws && ws.readyState === WebSocket.OPEN) {
                    try {
                        if (!messageSent) {
                            console.log('Fetching attendance data for:', payload);
                            ws.send(JSON.stringify(payload));
                            messageSent = true;
                            console.log('Attendance fetch request sent, waiting for response with requestId:', requestId);
                        }
                        clearInterval(interval);
                    } catch (e) {
                        console.error('Failed to send request', e);
                        clearInterval(interval);
                        removeMessageListener(listener);
                    }
                } else {
                    attempts += 1;
                    if (attempts >= maxAttempts) {
                        clearInterval(interval);
                        console.error('WebSocket not available after 40 attempts (10s)');
                        removeMessageListener(listener);
                    }
                }
            }, 250);

            // Timeout fallback: if no response after 15s, log and cleanup
            const timeoutId = setTimeout(() => {
                console.warn('Attendance fetch timeout (15s) - no response received');
                removeMessageListener(listener);
            }, 15000);
        }, 500);
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {showFingerprintUpload && (
                <FingerprintUploadModal
                    section={currentSection}
                    course={currentCourse}
                    onClose={() => setShowFingerprintUpload(false)}
                    onSuccess={handleFingerprintUploadSuccess}
                />
            )}
            <div className="flex border-b-4 border-black shrink-0 z-[80] relative bg-white">
                {/* Course Selection */}
                <div className="w-1/4 p-4 border-r-4 border-black relative">
                    <div
                        className="cursor-pointer flex items-center justify-between group h-full"
                        onClick={() => {
                            setIsCourseMenuOpen(!isCourseMenuOpen);
                            setIsSectionMenuOpen(false);
                        }}>
                        <div>
                            <h1 className="text-sm font-black uppercase text-gray-400 tracking-widest">Select Course</h1>
                            <h2 className="text-2xl font-bold text-black group-hover:text-blue-600 transition-colors leading-tight">{currentCourse}</h2>
                        </div>
                        <ChevronDown className={`transition-transform flex-shrink-0 ml-2 ${isCourseMenuOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isCourseMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-x-4 border-b-4 border-black z-[100] shadow-2xl max-h-80 overflow-y-auto">
                            {STUDENT_VIEW_COURSES.map(course => (
                                <div
                                    key={course.name}
                                    onClick={() => {
                                        setCurrentCourse(course.name);
                                        setIsCourseMenuOpen(false);
                                    }}
                                    className={`p-4 hover:bg-slate-100 font-bold cursor-pointer border-b border-gray-100 last:border-0 ${currentCourse === course.name ? 'bg-slate-100 text-[#0066cc]' : ''}`}>
                                    {course.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Section Selection */}
                <div className="w-1/4 p-4 border-r-4 border-black relative bg-slate-50">
                    <div
                        className="cursor-pointer flex items-center justify-between group h-full"
                        onClick={() => {
                            setIsSectionMenuOpen(!isSectionMenuOpen);
                            setIsCourseMenuOpen(false);
                        }}>
                        <div>
                            <h1 className="text-sm font-black uppercase text-gray-400 tracking-widest">Select Section</h1>
                            <h2 className="text-2xl font-bold text-gray-700 group-hover:text-black transition-colors">{currentSection}</h2>
                        </div>
                        <ChevronDown className={`transition-transform flex-shrink-0 ml-2 ${isSectionMenuOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isSectionMenuOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border-x-4 border-b-4 border-black z-[100] shadow-2xl">
                            {allowedSections.map(section => (
                                <div
                                    key={section}
                                    onClick={() => {
                                        setCurrentSection(section);
                                        setIsSectionMenuOpen(false);
                                    }}
                                    className={`p-4 hover:bg-slate-100 font-bold cursor-pointer border-b border-gray-100 last:border-0 ${currentSection === section ? 'bg-slate-100 text-black' : ''}`}>
                                    {section}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 p-4 flex justify-between items-center bg-white">
                    <h1 className="text-3xl font-bold text-gray-800">Inha University in Tashkent</h1>
                    <button
                        onClick={handleStartMarking}
                        className={`font-bold py-3 px-8 rounded shadow-md transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none bg-[#10b981] hover:bg-[#059669] text-white`}>
                        Start marking attendance
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
                                </div>))}
                        </div>

                        <div className="sticky right-0 w-32 shrink-0 p-3 font-bold text-sm text-center flex items-center justify-center border-l-2 border-black bg-gray-50 z-50">
                            Total Absences
                        </div>
                    </div>

                    <div className="bg-white">
                        {profViewStudents.map((student) => (
                            <div key={student.id} className="flex border-b border-black h-12 hover:bg-slate-50 group">
                                <div className="sticky left-0 w-64 flex shrink-0 border-r-2 border-black bg-white z-30 group-hover:bg-slate-50 h-full">
                                    <div className="w-1/2 p-2 text-xs font-bold border-r border-gray-300 flex items-center justify-center text-center leading-tight">
                                        {student.name}
                                    </div>
                                    <div className="w-1/2 p-2 text-xs font-semibold flex items-center justify-center">{student.id}</div>
                                </div>

                                <div className="flex h-full">
                                    {SESSIONS.map(session => {
                                        const key = `${student.id}-${session.label}-${currentCourse}`;
                                        const attendanceValue = attendanceData[key]; // true = absent (0), false = present (1), undefined = not set
                                        const isActiveColumn = selectedSession === session.id;
                                        const hasAttendanceData = key in attendanceData;
                                        
                                        return (
                                        <div
                                            key={session.id}
                                            onClick={() => toggleAttendance(student.id, session.label)}
                                            className={`w-[50px] shrink-0 border-r border-gray-300 flex items-center justify-center transition-colors h-full text-sm font-bold
                                                ${isActiveColumn 
                                                    ? (markingMode ? 'bg-white cursor-pointer hover:bg-red-50' : 'bg-blue-50 cursor-default') 
                                                    : 'bg-gray-50 opacity-50'}
                                                ${hasAttendanceData && attendanceValue ? 'bg-red-200 !opacity-100' : ''}
                                                ${hasAttendanceData && !attendanceValue ? 'bg-green-100 !opacity-100' : ''}`}>
                                            {hasAttendanceData && (attendanceValue ? <span className="text-red-600">0</span> : <span className="text-green-600">1</span>)}
                                        </div>
                                    )})}
                                </div>

                                <div className="sticky right-0 w-32 shrink-0 flex items-center justify-center font-bold text-lg border-l-2 border-black bg-white z-30 group-hover:bg-slate-50 h-full">
                                        {Object.keys(attendanceData).filter(k => k.startsWith(student.id + '-') && k.endsWith('-' + currentCourse) && attendanceData[k]).length}
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
    const [studentAttendance, setStudentAttendance] = useState<Record<string, number>>({});
    const [studentCourses, setStudentCourses] = useState<Array<{course: string, absences: number}>>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch student's attendance data on mount and when explicitly refreshed
    React.useEffect(() => {
        setIsLoading(true);
        connectWS('127.0.0.1');

        const listener = (ev: MessageEvent) => {
            try {
                const msg = JSON.parse(ev.data);
                console.log('Student view - raw message received:', msg);
                
                if (msg && msg.type === 'student_attendance_data') {
                    console.log('✓ Matched student_attendance_data message');
                    console.log('Full student attendance response:', msg);
                    
                    // Build attendance map: key = "course-week", value = attendance (0 or 1)
                    const attendanceMap: Record<string, number> = {};
                    const courseAbsences: Record<string, number> = {};
                    
                    if (msg.attendance && Array.isArray(msg.attendance)) {
                        console.log(`Processing ${msg.attendance.length} attendance records`);
                        msg.attendance.forEach((record: any) => {
                            const key = `${record.course_name}-${record.session_label}`;
                            attendanceMap[key] = record.attendance;
                            
                            console.log(`✓ Record added: key="${key}", attendance=${record.attendance}`);
                            
                            // Count absences by course
                            if (record.attendance === 0) {
                                courseAbsences[record.course_name] = (courseAbsences[record.course_name] || 0) + 1;
                            }
                        });
                    } else {
                        console.warn('No attendance array in response');
                    }
                    
                    console.log('Final attendanceMap:', attendanceMap);
                    setStudentAttendance(attendanceMap);
                    
                    // Build course list with absence counts (show all courses, even if no attendance data)
                    const courses = STUDENT_VIEW_COURSES.map(c => ({
                        course: c.name,
                        absences: courseAbsences[c.name] || 0
                    }));
                    setStudentCourses(courses);
                    setIsLoading(false);
                    console.log('✓ Student courses state updated:', courses);
                }
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };

        addMessageListener(listener);

        // Request student's attendance data with retry logic
        const payload = {
            type: 'get_student_attendance',
            student_id: user.id,
            section: user.section
        };

        console.log('📤 Sending attendance request:', payload);

        let attempts = 0;
        const maxAttempts = 50;
        const sendRequest = () => {
            const ws = getWS();
            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    console.log(`📡 WebSocket OPEN - sending request (attempt ${attempts + 1})`);
                    ws.send(JSON.stringify(payload));
                } catch (e) {
                    console.error('❌ Failed to send student attendance request', e);
                }
            } else {
                attempts += 1;
                console.log(`⏳ WebSocket not ready (state: ${ws?.readyState}), retry ${attempts}/${maxAttempts}`);
                if (attempts >= maxAttempts) {
                    console.error('❌ WebSocket not available after 50 attempts for student attendance');
                    setIsLoading(false);
                    return;
                }
                setTimeout(sendRequest, 200);
            }
        };

        sendRequest();

        return () => {
            removeMessageListener(listener);
        };
    }, [user.id, user.section]);

    // Initialize studentCourses with all courses on mount if no data yet
    React.useEffect(() => {
        if (studentCourses.length === 0) {
            const initialCourses = STUDENT_VIEW_COURSES.map(c => ({
                course: c.name,
                absences: 0
            }));
            setStudentCourses(initialCourses);
            console.log('Initialized empty student courses:', initialCourses);
        }
    }, []);

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="flex border-b-4 border-black bg-white shrink-0">
                <div className="w-96 flex-shrink-0 p-4 border-r-4 border-black flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-sm font-black uppercase text-gray-400 tracking-widest">Student</h1>
                        <h2 className="text-xl font-bold text-black">{user.name}</h2>
                        <p className="text-xs text-gray-500">{user.id}</p>
                    </div>
                </div>
                <div className="flex-1 p-4 flex items-center justify-center gap-4">
                    <h1 className="text-3xl font-bold">My Attendance</h1>
                    {isLoading && <span className="text-sm text-gray-500 animate-pulse">Loading...</span>}
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
                        {studentCourses.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                {isLoading ? 'Loading attendance data...' : 'No attendance records yet'}
                            </div>
                        ) : (
                            studentCourses.map((courseData, idx) => (
                                <div key={idx} className="flex border-b border-black h-14 hover:bg-slate-50 group">
                                    <div className="sticky left-0 z-30 bg-white w-96 shrink-0 border-r-4 border-black p-3 font-bold text-sm flex items-center justify-center text-center group-hover:bg-slate-50 h-full">
                                        {courseData.course}
                                    </div>

                                    <div className="flex h-full">
                                        {SESSIONS.map((session) => {
                                            const key = `${courseData.course}-${session.label}`;
                                            const attendance = studentAttendance[key];
                                            const hasData = key in studentAttendance;
                                            
                                            return (
                                                <div
                                                    key={session.id}
                                                    className={`w-[50px] shrink-0 border-r border-gray-300 flex items-center justify-center h-full text-sm font-bold transition-colors
                                                        ${hasData && attendance === 1 ? 'bg-green-200 text-green-700 border-green-400' : ''}
                                                        ${hasData && attendance === 0 ? 'bg-red-300 text-red-700 border-red-400' : ''}
                                                        ${!hasData ? 'bg-gray-100' : ''}`}
                                                    title={hasData ? (attendance === 1 ? 'Present' : 'Absent') : 'No data'}>
                                                    {hasData ? (attendance === 1 ? <span>✓</span> : <span>✕</span>) : <span className="text-gray-400">—</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="sticky right-0 z-30 bg-white w-32 shrink-0 flex items-center justify-center font-bold text-lg border-l-4 border-black group-hover:bg-slate-50 h-full">
                                        {courseData.absences}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export const Attendance: React.FC<AttendanceProps> = ({ user }) => {
    if (user.role === UserRole.STUDENT) {
        return <StudentAttendanceView user={user} />;
    }
    return <ProfessorAttendanceView />;
};
