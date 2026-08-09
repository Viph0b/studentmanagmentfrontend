export interface Student {
  id?: string;
  studentId: number;
  studentName: string;
  gender: string;
  dateOfBirth: string; // ISO date string
  phoneNumber: string;
  email: string;
  majorId: number;
  groupId: number;
  majorName?: string;
  groupName?: string;
}

export type StudentInput = Omit<Student, 'id' | 'studentId'>;