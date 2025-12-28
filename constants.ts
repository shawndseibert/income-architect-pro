
import { TimeFrame, IncomeState } from './types';

export const INITIAL_INCOME_STATE: IncomeState = {
  amount: 0,
  timeFrame: TimeFrame.HOURLY,
  isGross: true,
  hoursPerDay: 8,
  daysPerWeek: 5,
  stateCode: 'NONE'
};

export const TAX_BRACKETS = [
  { limit: 11600, rate: 0.10 },
  { limit: 47150, rate: 0.12 },
  { limit: 100525, rate: 0.22 },
  { limit: 191950, rate: 0.24 },
  { limit: 243725, rate: 0.32 },
  { limit: 609350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 }
];

// Simplified Flat State Tax Estimates (for demonstration)
export const STATE_TAX_RATES: Record<string, number> = {
  'NONE': 0,
  'AL': 0.05, 'AK': 0, 'AZ': 0.025, 'AR': 0.049, 'CA': 0.08, 'CO': 0.044, 'CT': 0.05, 'DE': 0.06, 'FL': 0,
  'GA': 0.057, 'HI': 0.08, 'ID': 0.058, 'IL': 0.049, 'IN': 0.032, 'IA': 0.06, 'KS': 0.057, 'KY': 0.05, 'LA': 0.04,
  'ME': 0.07, 'MD': 0.05, 'MA': 0.05, 'MI': 0.04, 'MN': 0.07, 'MS': 0.05, 'MO': 0.05, 'MT': 0.06, 'NE': 0.06,
  'NV': 0, 'NH': 0, 'NJ': 0.06, 'NM': 0.05, 'NY': 0.06, 'NC': 0.047, 'ND': 0.02, 'OH': 0.03, 'OK': 0.04, 'OR': 0.09,
  'PA': 0.03, 'RI': 0.05, 'SC': 0.07, 'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0.048, 'VT': 0.06, 'VA': 0.05, 'WA': 0,
  'WV': 0.06, 'WI': 0.05, 'WY': 0
};

export const US_STATES = [
  { code: 'NONE', name: 'No State Tax / Federal Only' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

export const FREQUENCY_OPTIONS = Object.values(TimeFrame);
