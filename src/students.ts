
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

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const TIMES = [
    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export const studentsData: StudentRecord[] = [
  { "id": "U2310002", "name": "ABBOSOV MUXAMMADYOSIN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.muxammadyosin@student.inha.uz", "absences": 0 },
  { "id": "U2310003", "name": "ABDUGANIYEV ABDUVORIS", "role": "STUDENT", "group": "CSE 23-01", "email": "a.abduvoris@student.inha.uz", "absences": 1 },
  { "id": "U2310004", "name": "ABDUKARIMOV XASAN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.xasan@student.inha.uz", "absences": 2 },
  { "id": "U2310005", "name": "ABDUKARIMOV XUSAN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.xusan@student.inha.uz", "absences": 0 },
  { "id": "U2310006", "name": "ABDULAZIZOVA NILUFARBONU", "role": "STUDENT", "group": "CSE 23-01", "email": "a.nilufarbonu@student.inha.uz", "absences": 1 },
  { "id": "U2310007", "name": "ABDULLAYEV SAYID SARDARXAN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sayid@student.inha.uz", "absences": 0 },
  { "id": "U2310008", "name": "ABDULLOYEV SOLEH", "role": "STUDENT", "group": "CSE 23-01", "email": "a.soleh@student.inha.uz", "absences": 3 },
  { "id": "U2310009", "name": "ABDUMANNONOV ADHAMBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.adhambek@student.inha.uz", "absences": 0 },
  { "id": "U2310010", "name": "ABDUMANNONOV ASLIDDIN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.asliddin@student.inha.uz", "absences": 0 },
  { "id": "U2310011", "name": "ABDUQAHHOROV OYBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.oybek@student.inha.uz", "absences": 1 },
  { "id": "U2310012", "name": "ABDURAHIMOV JAHONGIR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.jahongir@student.inha.uz", "absences": 0 },
  { "id": "U2310013", "name": "ABDURASULOV ABDUVORIS", "role": "STUDENT", "group": "CSE 23-01", "email": "a.abduvoris@student.inha.uz", "absences": 0 },
  { "id": "U2310014", "name": "ABDURAYIMOV JAVOXIR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.javoxir@student.inha.uz", "absences": 2 },
  { "id": "U2310015", "name": "ABDUSHUKUROV AKMAL", "role": "STUDENT", "group": "CSE 23-01", "email": "a.akmal@student.inha.uz", "absences": 0 },
  { "id": "U2310016", "name": "ABDUVOKHIDOV KHASANBOY", "role": "STUDENT", "group": "CSE 23-01", "email": "a.khasanboy@student.inha.uz", "absences": 0 },
  { "id": "U2310017", "name": "ABDUVOXIDOV SHUKURXO'JA", "role": "STUDENT", "group": "CSE 23-01", "email": "a.shukurxoja@student.inha.uz", "absences": 1 },
  { "id": "U2310018", "name": "ABDUXOSHIMOV SANJAR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sanjar@student.inha.uz", "absences": 0 },
  { "id": "U2310019", "name": "ABIROVA SARVINISO", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sarviniso@student.inha.uz", "absences": 0 },
  { "id": "U2310020", "name": "ADILOV RUSTAM", "role": "STUDENT", "group": "CSE 23-01", "email": "a.rustam@student.inha.uz", "absences": 4 },
  { "id": "U2310021", "name": "AITBAYEV ULUG'BEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.ulugbek@student.inha.uz", "absences": 0 },
  { "id": "U2310022", "name": "AKBAROV RAXMATULLOH", "role": "STUDENT", "group": "CSE 23-01", "email": "a.raxmatulloh@student.inha.uz", "absences": 0 },
  { "id": "U2310023", "name": "AKBAROV TEMUR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.temur@student.inha.uz", "absences": 0 },
  { "id": "U2310024", "name": "AKRAMOV TEMUR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.temur@student.inha.uz", "absences": 1 },
  { "id": "U2310025", "name": "AKROMOV ASROR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.asror@student.inha.uz", "absences": 0 },
  { "id": "U2310026", "name": "AKROMOV SAYIDAKROM", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sayidakrom@student.inha.uz", "absences": 0 },
  { "id": "U2310027", "name": "ALIQORIYEV ABDULLOH", "role": "STUDENT", "group": "CSE 23-01", "email": "a.abdulloh@student.inha.uz", "absences": 0 },
  { "id": "U2310028", "name": "ALISHEROV SAIDAKBAR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.saidakbar@student.inha.uz", "absences": 2 },
  { "id": "U2310029", "name": "ALMYASHEV DAMIR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.damir@student.inha.uz", "absences": 0 },
  { "id": "U2310030", "name": "AMETOV ABDIRASHIT", "role": "STUDENT", "group": "CSE 23-01", "email": "a.abdirashit@student.inha.uz", "absences": 0 },
  { "id": "U2310031", "name": "AMINBOYEV SIROJIDDIN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sirojiddin@student.inha.uz", "absences": 0 },
  { "id": "U2310032", "name": "AMIRKULOV AMIR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.amir@student.inha.uz", "absences": 0 },
  { "id": "U2310033", "name": "AN ARTUR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.artur@student.inha.uz", "absences": 1 },
  { "id": "U2310034", "name": "ARZUMANYANS VYACHESLAV", "role": "STUDENT", "group": "CSE 23-01", "email": "a.vyacheslav@student.inha.uz", "absences": 0 },
  { "id": "U2310035", "name": "ASHIROV AMIN", "role": "STUDENT", "group": "CSE 23-01", "email": "a.amin@student.inha.uz", "absences": 0 },
  { "id": "U2310037", "name": "ASHUROV AZAMAT", "role": "STUDENT", "group": "CSE 23-01", "email": "a.azamat@student.inha.uz", "absences": 3 },
  { "id": "U2310038", "name": "ASHUROV IZZATBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.izzatbek@student.inha.uz", "absences": 0 },
  { "id": "U2310039", "name": "ASLIDINOVA SABOXAT-BEGIM", "role": "STUDENT", "group": "CSE 23-01", "email": "a.saboxatbegim@student.inha.uz", "absences": 0 },
  { "id": "U2310040", "name": "ASQAROV JO'RABEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.jorabek@student.inha.uz", "absences": 0 },
  { "id": "U2310041", "name": "ATAYEV DMITRIY", "role": "STUDENT", "group": "CSE 23-01", "email": "a.dmitriy@student.inha.uz", "absences": 0 },
  { "id": "U2310042", "name": "ATXAMOV RASHSHODBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.rashshodbek@student.inha.uz", "absences": 2 },
  { "id": "U2310043", "name": "AUKHADEEV MATVEI", "role": "STUDENT", "group": "CSE 23-01", "email": "a.matvei@student.inha.uz", "absences": 0 },
  { "id": "U2310044", "name": "AXMADOV SUNNAT", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sunnat@student.inha.uz", "absences": 0 },
  { "id": "U2310045", "name": "AXMEDOV A'ZAMJON", "role": "STUDENT", "group": "CSE 23-01", "email": "a.azamjon@student.inha.uz", "absences": 1 },
  { "id": "U2310046", "name": "AXMEDOV JASURBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "a.jasurbek@student.inha.uz", "absences": 0 },
  { "id": "U2310047", "name": "AXMEDOVA MALIKA", "role": "STUDENT", "group": "CSE 23-01", "email": "a.malika@student.inha.uz", "absences": 0 },
  { "id": "U2310048", "name": "AXMEDOVA SEVINCH", "role": "STUDENT", "group": "CSE 23-01", "email": "a.sevinch@student.inha.uz", "absences": 0 },
  { "id": "U2310049", "name": "AZIMOV IBROXIM", "role": "STUDENT", "group": "CSE 23-01", "email": "a.ibroxim@student.inha.uz", "absences": 0 },
  { "id": "U2310050", "name": "AZIZOV TEMUR", "role": "STUDENT", "group": "CSE 23-01", "email": "a.temur@student.inha.uz", "absences": 0 },
  { "id": "U2310051", "name": "BAHRONOV SOJID", "role": "STUDENT", "group": "CSE 23-01", "email": "b.sojid@student.inha.uz", "absences": 0 },
  { "id": "U2310052", "name": "BAXODIROV AKMAL", "role": "STUDENT", "group": "CSE 23-01", "email": "b.akmal@student.inha.uz", "absences": 5 },
  { "id": "U2310053", "name": "BAXROMOV A'ZAM", "role": "STUDENT", "group": "CSE 23-01", "email": "b.azam@student.inha.uz", "absences": 0 },
  { "id": "U2310054", "name": "BAXTIYOROVA DIYORA", "role": "STUDENT", "group": "CSE 23-01", "email": "b.diyora@student.inha.uz", "absences": 0 },
  { "id": "U2310055", "name": "BAYBURIN EMIL", "role": "STUDENT", "group": "CSE 23-01", "email": "b.emil@student.inha.uz", "absences": 0 },
  { "id": "U2310056", "name": "BEGMATOVA GULBARA", "role": "STUDENT", "group": "CSE 23-01", "email": "b.gulbara@student.inha.uz", "absences": 0 },
  { "id": "U2310057", "name": "BESHIMOV ULUG'BEK", "role": "STUDENT", "group": "CSE 23-01", "email": "b.ulugbek@student.inha.uz", "absences": 0 },
  { "id": "U2310058", "name": "BIYNAZOVA MALIKA", "role": "STUDENT", "group": "CSE 23-01", "email": "b.malika@student.inha.uz", "absences": 1 },
  { "id": "U2310059", "name": "BOLTABAYEV AMIR", "role": "STUDENT", "group": "CSE 23-01", "email": "b.amir@student.inha.uz", "absences": 0 },
  { "id": "U2310060", "name": "BOTIROV BAXODIR", "role": "STUDENT", "group": "CSE 23-01", "email": "b.baxodir@student.inha.uz", "absences": 0 },
  { "id": "U2310061", "name": "BOZOROV ARSLONBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "b.arslonbek@student.inha.uz", "absences": 0 },
  { "id": "U2310062", "name": "BOZOROV ASADBEK", "role": "STUDENT", "group": "CSE 23-01", "email": "b.asadbek@student.inha.uz", "absences": 0 }
];

export const SECTION_EVENTS: Record<string, ClassEvent[]> = {
    'ICE-23-01': [
        { id: 101, name: 'Intro to ICE', day: 'Monday', start: '10:00', end: '11:30', type: 'lecture' },
        { id: 102, name: 'Electronics Lab', day: 'Wednesday', start: '13:00', end: '16:00', type: 'lab' },
    ],
    'ICE-23-02': [
        { id: 103, name: 'Digital Logic', day: 'Tuesday', start: '09:30', end: '11:00', type: 'lecture' },
        { id: 104, name: 'Physics II', day: 'Thursday', start: '14:30', end: '16:00', type: 'lecture' },
    ],
    'CSE-23-01': [
        { id: 1, name: 'Operating System', day: 'Monday', start: '09:30', end: '11:00', type: 'lecture' },
        { id: 2, name: 'Database Systems', day: 'Tuesday', start: '11:30', end: '13:00', type: 'lecture' },
        { id: 3, name: 'Computer Algorithm', day: 'Tuesday', start: '14:00', end: '15:30', type: 'lecture' },
        { id: 4, name: 'Operating System', day: 'Wednesday', start: '09:30', end: '11:00', type: 'lab' },
        { id: 5, name: 'Engineering Communications', day: 'Thursday', start: '13:00', end: '14:30', type: 'lecture' },
        { id: 6, name: 'System Analysis', day: 'Friday', start: '14:00', end: '17:00', type: 'lab' },
    ],
    'CSE-23-02': [
        { id: 201, name: 'Data Structures', day: 'Monday', start: '11:00', end: '12:30', type: 'lecture' },
        { id: 202, name: 'Discrete Math', day: 'Wednesday', start: '14:00', end: '15:30', type: 'lecture' },
    ],
    'LOG-23-01': [
        { id: 301, name: 'Logistics Mgmt', day: 'Tuesday', start: '09:30', end: '11:00', type: 'lecture' },
        { id: 302, name: 'Supply Chain Lab', day: 'Thursday', start: '10:00', end: '12:00', type: 'lab' },
    ],
    'BUS-23-01': [
        { id: 401, name: 'Business Ethics', day: 'Monday', start: '14:00', end: '15:30', type: 'lecture' },
        { id: 402, name: 'Macroeconomics', day: 'Friday', start: '10:00', end: '11:30', type: 'lecture' },
    ]
};
