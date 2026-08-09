export interface ClassSchedule {
  id?: string;
  scheduleId: number;
  groupId: number;
  groupName?: string;
  majorId: number;
  majorName?: string;
  teacherId: number;
  teacherName?: string;
  subjectId: number;
  subjectName?: string;
  semester: number;
  academicYear: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  shift: string;
}

export type ClassScheduleInput = Omit<ClassSchedule, 'id' | 'scheduleId'>;