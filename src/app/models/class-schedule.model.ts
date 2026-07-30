export interface ClassSchedule {
  id?: string;
  scheduleId: number;
  groupName: string;
  major: string;
  teacherId: number;
  teacherName: string;
  subject: string;
  semester: number;
  academicYear: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  shift: string;
}

export type ClassScheduleInput = Omit<ClassSchedule, 'id' | 'scheduleId'>;
