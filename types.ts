
export enum TimeFrame {
  HOURLY = 'Hourly',
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
  BIWEEKLY = 'Bi-Weekly',
  MONTHLY = 'Monthly',
  YEARLY = 'Yearly'
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  frequency: TimeFrame;
  color: string;
  subItems?: Expense[];
}

export interface IncomeState {
  amount: number;
  timeFrame: TimeFrame;
  isGross: boolean;
  hoursPerDay: number;
  daysPerWeek: number;
  stateCode: string;
}

export interface CalculatedResults {
  grossAnnual: number;
  netAnnual: number;
  taxAnnual: number;
  stateTaxAnnual: number;
  federalTaxAnnual: number;
  expensesAnnual: number;
  takeHomeAnnual: number;
  expenseDetails: { name: string; value: number; color: string }[];
  breakdown: {
    monthly: number;
    weekly: number;
    daily: number;
    hourly: number;
  };
}
