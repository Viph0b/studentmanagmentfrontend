export interface StudentFeePayment {
  id?: string;
  paymentId: number;
  studentId: number;
  studentName?: string;
  semester: number;
  amountPaid: number;
  paymentDate: string; // ISO date string
  paymentMethod: string;
}

export type StudentFeePaymentInput = Omit<
  StudentFeePayment,
  'id' | 'paymentId'
>;