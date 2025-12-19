export interface StudentRecord {
  id: string;
  name: string;
  role: string;
  group: string;
  email: string;
  absences: number;
}

export interface ClassEvent {
    id: number;
    name: string;
    day: string;
    start: string;
    end: string;
    type: string;
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIMES = [
    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const studentsData: StudentRecord[] = [
  { "id": "U2310002", "name": "ABBOSOV MUXAMMADYOSIN", "role": "STUDENT", "group": "CSE-23-01", "email": "a.muxammadyosin@student.inha.uz", "absences": 0 },
  { "id": "U2310003", "name": "ABDUGANIYEV ABDUVORIS", "role": "STUDENT", "group": "CSE-23-01", "email": "a.abduvoris@student.inha.uz", "absences": 1 },
  { "id": "U2310004", "name": "ABDUKARIMOV XASAN", "role": "STUDENT", "group": "CSE-23-01", "email": "a.xasan@student.inha.uz", "absences": 2 },
  { "id": "U2310005", "name": "ABDUKARIMOV XUSAN", "role": "STUDENT", "group": "CSE-23-01", "email": "a.xusan@student.inha.uz", "absences": 0 },
  { "id": "U2310006", "name": "ABDULAZIZOVA NILUFARBONU", "role": "STUDENT", "group": "CSE-23-01", "email": "a.nilufarbonu@student.inha.uz", "absences": 1 },
  { "id": "U2310007", "name": "ABDULLAYEV SAYID SARDARXAN", "role": "STUDENT", "group": "CSE-23-01", "email": "a.sayid@student.inha.uz", "absences": 0 },
  { "id": "U2310008", "name": "ABDULLOYEV SOLEH", "role": "STUDENT", "group": "CSE-23-01", "email": "a.soleh@student.inha.uz", "absences": 3 },
  { "id": "U2310009", "name": "ABDUMANNONOV ADHAMBEK", "role": "STUDENT", "group": "CSE-23-01", "email": "a.adhambek@student.inha.uz", "absences": 0 },
  { "id": "U2310010", "name": "ABDUMANNONOV ASLIDDIN", "role": "STUDENT", "group": "CSE-23-01", "email": "a.asliddin@student.inha.uz", "absences": 0 },
  { "id": "U2310011", "name": "ABDUQAHHOROV OYBEK", "role": "STUDENT", "group": "CSE-23-01", "email": "a.oybek@student.inha.uz", "absences": 1 },

  // CSE-23-02 students
  { "id": "U2310101", "name": "ALIMOV BOBUR", "role": "STUDENT", "group": "CSE-23-02", "email": "a.bobur@student.inha.uz", "absences": 0 },
  { "id": "U2310102", "name": "BEKMURODOV TEMUR", "role": "STUDENT", "group": "CSE-23-02", "email": "b.temur@student.inha.uz", "absences": 1 },
  { "id": "U2310103", "name": "CHORIEV JALOLIDDIN", "role": "STUDENT", "group": "CSE-23-02", "email": "c.jaloliddin@student.inha.uz", "absences": 0 },
  { "id": "U2310104", "name": "DAVRONOV AZIZBEK", "role": "STUDENT", "group": "CSE-23-02", "email": "d.azizbek@student.inha.uz", "absences": 2 },
  { "id": "U2310105", "name": "ESHONKULOV NODIR", "role": "STUDENT", "group": "CSE-23-02", "email": "e.nodir@student.inha.uz", "absences": 0 },
  { "id": "U2310106", "name": "FAYZULLAYEV ISLOM", "role": "STUDENT", "group": "CSE-23-02", "email": "f.islom@student.inha.uz", "absences": 0 },
  { "id": "U2310107", "name": "GULOMOV SARDOR", "role": "STUDENT", "group": "CSE-23-02", "email": "g.sardor@student.inha.uz", "absences": 1 },
  { "id": "U2310108", "name": "HASANOV JAXONGIR", "role": "STUDENT", "group": "CSE-23-02", "email": "h.jaxongir@student.inha.uz", "absences": 0 },
  { "id": "U2310109", "name": "IBRAGIMOV SHOKHRUKH", "role": "STUDENT", "group": "CSE-23-02", "email": "i.shokhrukh@student.inha.uz", "absences": 3 },
  { "id": "U2310110", "name": "JUMAYEV FARHOD", "role": "STUDENT", "group": "CSE-23-02", "email": "j.farhod@student.inha.uz", "absences": 0 },

  // CSE-23-03 students
  { "id": "U2310201", "name": "KAMOLOV ANVAR", "role": "STUDENT", "group": "CSE-23-03", "email": "k.anvar@student.inha.uz", "absences": 0 },
  { "id": "U2310202", "name": "LATIPOV SHERZOD", "role": "STUDENT", "group": "CSE-23-03", "email": "l.sherzod@student.inha.uz", "absences": 1 },
  { "id": "U2310203", "name": "MIRZAYEV OTABEK", "role": "STUDENT", "group": "CSE-23-03", "email": "m.otabek@student.inha.uz", "absences": 0 },
  { "id": "U2310204", "name": "NABIYEV JASUR", "role": "STUDENT", "group": "CSE-23-03", "email": "n.jasur@student.inha.uz", "absences": 2 },
  { "id": "U2310205", "name": "ORIPOV BEHZOD", "role": "STUDENT", "group": "CSE-23-03", "email": "o.behzod@student.inha.uz", "absences": 0 },
  { "id": "U2310206", "name": "PULATOV AKMAL", "role": "STUDENT", "group": "CSE-23-03", "email": "p.akmal@student.inha.uz", "absences": 0 },
  { "id": "U2310207", "name": "QODIROV MANSOUR", "role": "STUDENT", "group": "CSE-23-03", "email": "q.mansour@student.inha.uz", "absences": 1 },
  { "id": "U2310208", "name": "RAHIMOV ELDOR", "role": "STUDENT", "group": "CSE-23-03", "email": "r.eldor@student.inha.uz", "absences": 0 },
  { "id": "U2310209", "name": "SULTONOV AZIZ", "role": "STUDENT", "group": "CSE-23-03", "email": "s.aziz@student.inha.uz", "absences": 3 },
  { "id": "U2310210", "name": "TURDIYEV UMID", "role": "STUDENT", "group": "CSE-23-03", "email": "t.umid@student.inha.uz", "absences": 0 }
];

export const SECTION_EVENTS: Record<string, ClassEvent[]> = {
  'ICE-23-01': [
    { id: 1, name: 'Operating System', day: 'Monday', start: '13:00', end: '14:30', type: 'lecture' },
    { id: 2, name: 'Database Systems', day: 'Thursday', start: '11:00', end: '12:30', type: 'lecture' },
    { id: 3, name: 'Computer Algorithm', day: 'Tuesday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 4, name: 'Operating System', day: 'Tuesday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 5, name: 'Engineering Communications', day: 'Wednesday', start: '11:00', end: '12:30', type: 'lecture' },
    { id: 6, name: 'Signal and Systems', day: 'Friday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 7, name: 'History 2', day: 'Wednesday', start: '09:30', end: '11:00', type: 'lecture' },
  ],
  'ICE-23-02': [
    { id: 1, name: 'Operating System', day: 'Monday', start: '15:30', end: '17:00', type: 'lecture' },
    { id: 2, name: 'Database Systems', day: 'Wednesday', start: '11:00', end: '12:30', type: 'lecture' },
    { id: 3, name: 'Computer Algorithm', day: 'Tuesday', start: '12:30', end: '14:00', type: 'lecture' },
    { id: 4, name: 'Operating System', day: 'Wednesday', start: '15:30', end: '17:00', type: 'lecture' },
    { id: 5, name: 'Engineering Communications', day: 'Thursday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 6, name: 'Signal and Systems', day: 'Friday', start: '11:00', end: '12:30', type: 'lecture' },
    { id: 7, name: 'History 2', day: 'Tuesday', start: '09:30', end: '11:00', type: 'lecture' },
  ],
  'CSE-23-01': [
    { id: 1, name: 'Operating System', day: 'Monday', start: '11:00', end: '12:30', type: 'lecture' },
    { id: 2, name: 'Database Systems', day: 'Tuesday', start: '12:30', end: '14:00', type: 'lecture' },
    { id: 3, name: 'Computer Algorithm', day: 'Tuesday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 4, name: 'Operating System', day: 'Wednesday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 5, name: 'Engineering Communications', day: 'Thursday', start: '15:30', end: '17:00', type: 'lecture' },
    { id: 6, name: 'System Analysis', day: 'Friday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 7, name: 'History 2', day: 'Wednesday', start: '15:30', end: '17:00', type: 'lecture' },
  ],
  'CSE-23-02': [
    { id: 1, name: 'Operating System', day: 'Tuesday', start: '15:30', end: '17:00', type: 'lecture' },
    { id: 2, name: 'Database Systems', day: 'Wednesday', start: '12:30', end: '14:00', type: 'lecture' },
    { id: 3, name: 'Computer Algorithm', day: 'Monday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 4, name: 'Operating System', day: 'Thursday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 5, name: 'Engineering Communications', day: 'Friday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 6, name: 'System Analysis', day: 'Monday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 7, name: 'History 2', day: 'Thursday', start: '12:30', end: '14:00', type: 'lecture' }
  ],
  'CSE-23-03': [
    { id: 1, name: 'Operating System', day: 'Monday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 2, name: 'Database Systems', day: 'Tuesday', start: '10:00', end: '11:30', type: 'lecture' },
    { id: 3, name: 'Computer Algorithm', day: 'Wednesday', start: '09:00', end: '10:30', type: 'lecture' },
    { id: 4, name: 'Operating System', day: 'Thursday', start: '11:00', end: '12:30', type: 'lecture' },
    { id: 5, name: 'Engineering Communications', day: 'Friday', start: '15:30', end: '17:00', type: 'lecture' },
    { id: 6, name: 'System Analysis', day: 'Monday', start: '15:30', end: '17:00', type: 'lecture' },
    { id: 7, name: 'History 2', day: 'Tuesday', start: '15:30', end: '17:00', type: 'lecture' }
  ],
  'LOG-23-01': [
    { id: 301, name: 'Logistics Mgmt', day: 'Tuesday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 302, name: 'Supply Chain Lab', day: 'Thursday', start: '10:00', end: '11:30', type: 'lab' },
    { id: 303, name: 'Business Stats', day: 'Monday', start: '11:30', end: '13:00', type: 'lecture' },
    { id: 304, name: 'Global Logistics', day: 'Wednesday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 305, name: 'Principles of Accounting', day: 'Friday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 306, name: 'Business Comm.', day: 'Saturday', start: '10:00', end: '11:30', type: 'lecture' },
  ],
  'LOG-23-02': [
    { id: 311, name: 'Logistics Mgmt', day: 'Monday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 312, name: 'Business Stats', day: 'Tuesday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 313, name: 'Supply Chain Lab', day: 'Wednesday', start: '10:00', end: '11:30', type: 'lab' },
    { id: 314, name: 'Global Logistics', day: 'Thursday', start: '11:30', end: '13:00', type: 'lecture' },
    { id: 315, name: 'Principles of Accounting', day: 'Friday', start: '14:00', end: '15:30', type: 'lecture' },
  ],
  'BUS-23-01': [
    { id: 401, name: 'Business Ethics', day: 'Monday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 402, name: 'Macroeconomics', day: 'Friday', start: '10:00', end: '11:30', type: 'lecture' },
    { id: 403, name: 'Principles of Management', day: 'Tuesday', start: '11:30', end: '13:00', type: 'lecture' },
    { id: 404, name: 'Marketing Management', day: 'Wednesday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 405, name: 'Financial Accounting', day: 'Thursday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 406, name: 'Microeconomics', day: 'Saturday', start: '11:30', end: '13:00', type: 'lecture' },
  ],
  'BUS-23-02': [
    { id: 411, name: 'Business Ethics', day: 'Tuesday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 412, name: 'Principles of Management', day: 'Monday', start: '11:30', end: '13:00', type: 'lecture' },
    { id: 413, name: 'Marketing Management', day: 'Wednesday', start: '11:30', end: '13:00', type: 'lecture' },
    { id: 414, name: 'Financial Accounting', day: 'Thursday', start: '09:30', end: '11:00', type: 'lecture' },
    { id: 415, name: 'Macroeconomics', day: 'Friday', start: '14:00', end: '15:30', type: 'lecture' },
    { id: 416, name: 'Microeconomics', day: 'Monday', start: '15:30', end: '17:00', type: 'lecture' },
  ]
};
