export enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR',
  ACADEMIC_AFFAIRS = 'ACADEMIC_AFFAIRS',
  SYS_ADMIN = 'SYS_ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  group?: string;
  avatarUrl?: string;
  email?: string; // Added for lists
  department?: string; // Added for lists
}

export interface Course {
  id: string;
  code: string;
  name: string;
  section: string;
  schedule?: string;
}

export interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  content: string;
  date: string;
  time: string;
  isRead: boolean;
  folder: 'inbox' | 'drafts' | 'sent' | 'spam';
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  weeks: boolean[];
}