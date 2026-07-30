export interface Teacher {
  id?: string;
  teacherId: number;
  teacherName: string;
  gender: string;
  dateOfBirth: string; // ISO date string
  phoneNumber: string;
  subjects: string[];
  salary: number;
}

export type TeacherInput = Omit<Teacher, 'id' | 'teacherId'>;
