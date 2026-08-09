export interface Group {
  id?: string;
  groupId: number;
  groupName: string;
  majorId: number;
  majorName?: string;
  studentCount?: number;
  currentSemester: number;
  academicYear: string;
  shift: string;
  status: string;
}

export type GroupInput = Omit<Group, 'id' | 'groupId'>;