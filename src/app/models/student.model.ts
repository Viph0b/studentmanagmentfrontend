export interface Score {
  subject: string;
  score: number | null;
}

export interface Test {
  scores: Score[];
}

export interface Exam {
  semester: number;
  midterm: Test;
  final: Test;
}

export interface Attendance {
  date: string;
  status: string;
}

export interface Student {
  id?: string;
  studentId: number;
  studentName: string;
  gender: string;
  dateOfBirth: string; // ISO date string
  phoneNumber: string;
  email: string;
  major: string;
  groupName: string;
  attendances: Attendance[];
  exams: Exam[];
}

export type StudentInput = Omit<Student, 'id' | 'studentId'>;
