export interface StudentFeePayment {
  id?: string;
  paymentId: number;
  studentId: number;
  semester: number;
  amountPaid: number;
  paymentDate: string; // ISO date string
  paymentMethod: string;
  status: string;
}

export type StudentFeePaymentInput = Omit<
  StudentFeePayment,
  'id' | 'paymentId'
>;
