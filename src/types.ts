export type UserRole = 'SUPER_ADMIN' | 'HEADMASTER' | 'HOD' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN'; // Added ADMIN for backward compatibility if used

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  avatar?: string;
}

export interface Revision {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  section: string;
  hodComment: string;
  timestamp: string;
  oldValue: number;
  status: 'PENDING' | 'RESOLVED';
}

export interface HistoricalTerm {
  year: string;
  term: string;
  finalGrade: number;
  behaviorRating: number;
  department: string;
  hodComment?: string;
}

export interface HistoricalObservation {
  id: string;
  date: string;
  type: string;
  comment: string;
  teacherName: string;
}

export interface ArchiveStudent {
  id: string;
  name: string;
  index: string;
  currentClass: string;
  department: string;
  history: HistoricalTerm[];
  observations: HistoricalObservation[];
}

export interface MissingObservation {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  missingType: 'Lab Safety' | 'Behavioral' | 'Resource Economy' | 'Hygienic Practices';
  department: 'Science' | 'Home Economics' | 'General';
}

export type AuditStatus = 'MISSING' | 'COMPLETE';

export interface Student {
  id: string;
  indexNumber: string;
  name: string;
  departmentId: string;
  currentClass: string;
  atRisk?: boolean;
  medicalNotes?: string;
  behavioralNotes?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'CORE' | 'ELECTIVE' | 'TECHNICAL';
  departmentId: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectId: string;
  term: string;
  year: string;
  theoryScore: number;
  practicalScore?: number;
  totalScore: number;
  status: 'DRAFT' | 'SUBMITTED' | 'LOCKED';
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLog {
  id: string;
  recordId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK';
  oldValue?: any;
  newValue?: any;
  justification: string;
  timestamp: string;
}

export interface UserSettings {
  mfaEnabled: boolean;
  notifications: {
    system: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  timestamp: string;
  lastUpdate: string;
}

export interface SystemStatus {
  localServer: 'HEALTHY' | 'UNSTABLE' | 'DOWN';
  internet: 'HEALTHY' | 'UNSTABLE' | 'DOWN';
}

export interface ResourceMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'LINK' | 'DOCUMENT';
  url: string;
  addedAt: string;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subjectName: string;
  className: string;
  venue: string;
  type: 'REGULAR' | 'SUBSTITUTION' | 'LAB';
  missingObservations?: number;
  isClash?: boolean;
  tasks?: string[];
  materials?: ResourceMaterial[];
}

export interface InterventionAlert {
  id: string;
  studentId: string;
  subjectId: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  resolved: boolean;
}

export interface ClassProgress {
  id: string;
  subjectName: string;
  className: string;
  studentCount: number;
  progress: number; // 0-100
  status: string;
}
