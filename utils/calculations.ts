
import { IncomeState, TimeFrame, CalculatedResults, Expense } from '../types';
import { TAX_BRACKETS, STATE_TAX_RATES } from '../constants';

export const calculateFederalTax = (annualGross: number): number => {
  let tax = 0;
  let remainingIncome = annualGross;
  let previousLimit = 0;

  for (const bracket of TAX_BRACKETS) {
    const taxableInThisBracket = Math.min(remainingIncome, bracket.limit - previousLimit);
    if (taxableInThisBracket <= 0) break;
    
    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
    previousLimit = bracket.limit;
    
    if (bracket.limit === Infinity) break;
  }
  return tax;
};

export const convertToAnnual = (amount: number, timeFrame: TimeFrame, hoursPerDay = 8, daysPerWeek = 5): number => {
  if (!amount) return 0;
  switch (timeFrame) {
    case TimeFrame.HOURLY: return amount * hoursPerDay * daysPerWeek * 52;
    case TimeFrame.DAILY: return amount * daysPerWeek * 52;
    case TimeFrame.WEEKLY: return amount * 52;
    case TimeFrame.BIWEEKLY: return amount * 26;
    case TimeFrame.MONTHLY: return amount * 12;
    case TimeFrame.YEARLY: return amount;
    default: return 0;
  }
};

/**
 * Recursively calculates the annual value of an expense, 
 * summing the item itself and all its sub-items.
 */
export const getExpenseAnnualValue = (exp: Expense): number => {
  const baseAnnual = convertToAnnual(exp.amount, exp.frequency);
  const subItemsAnnual = (exp.subItems || []).reduce((acc, sub) => acc + getExpenseAnnualValue(sub), 0);
  return baseAnnual + subItemsAnnual;
};

/**
 * Flattens expenses for the pie chart. 
 * Only returns top-level categories, with their values including all sub-items.
 */
export const flattenExpenses = (expenses: Expense[]): { name: string, value: number, color: string }[] => {
  return expenses
    .map(exp => ({
      name: exp.label,
      value: getExpenseAnnualValue(exp),
      color: exp.color
    }))
    .filter(item => item.value > 0);
};

export const getResults = (income: IncomeState, expenses: Expense[]): CalculatedResults => {
  const annualGross = convertToAnnual(income.amount, income.timeFrame, income.hoursPerDay, income.daysPerWeek);
  
  let federalTaxAnnual = 0;
  let stateTaxAnnual = 0;
  let netAnnual = 0;

  if (income.isGross) {
    federalTaxAnnual = calculateFederalTax(annualGross);
    stateTaxAnnual = annualGross * (STATE_TAX_RATES[income.stateCode] || 0);
    netAnnual = annualGross - federalTaxAnnual - stateTaxAnnual;
  } else {
    netAnnual = annualGross;
    // For net input, we treat it as post-tax
    federalTaxAnnual = 0;
    stateTaxAnnual = 0;
  }

  const expenseDetails = flattenExpenses(expenses);
  const expensesAnnual = expenseDetails.reduce((acc, curr) => acc + curr.value, 0);
  
  // Take home is what is left after taxes and expenses. 
  // Minimum 0 to avoid negative math in charts.
  const takeHomeAnnual = Math.max(0, netAnnual - expensesAnnual);

  return {
    grossAnnual: annualGross,
    netAnnual,
    federalTaxAnnual,
    stateTaxAnnual,
    taxAnnual: federalTaxAnnual + stateTaxAnnual,
    expensesAnnual,
    takeHomeAnnual,
    expenseDetails,
    breakdown: {
      monthly: takeHomeAnnual / 12,
      weekly: takeHomeAnnual / 52,
      daily: takeHomeAnnual / (income.daysPerWeek * 52),
      hourly: takeHomeAnnual / (income.hoursPerDay * income.daysPerWeek * 52)
    }
  };
};
