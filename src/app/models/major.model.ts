export interface Major {
  id?: string;
  majorId: number;
  majorName: string;
  pricePerSemester: number;
  subjects: string[];
  group: string[];
}

export type MajorInput = Omit<Major, 'id' | 'majorId'>;
