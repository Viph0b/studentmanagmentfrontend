export interface Subject {
  id?: string;
  subjectId: number;
  subjectName: string;
}

export type SubjectInput = Omit<Subject, 'id' | 'subjectId'>;
