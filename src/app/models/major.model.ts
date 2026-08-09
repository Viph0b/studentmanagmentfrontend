export interface Major {
  id?: string;
  majorId: number;
  majorName: string;
  pricePerSemester: number;
  subjectIds: number[];
  subjectNames?: string[];
  groupNames?: string[];
}

export type MajorInput = Omit<Major, 'id' | 'majorId'>;