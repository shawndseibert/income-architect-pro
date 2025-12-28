
import React, { useState, useMemo, useEffect } from 'react';
import { IncomeInput } from './components/IncomeInput.tsx';
import { ExpenseTracker } from './components/ExpenseTracker.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { IncomeState, Expense } from './types.ts';
import { INITIAL_INCOME_STATE } from './constants.ts';
import { getResults } from './utils/calculations.ts';

const STORAGE_KEY = 'income-architect-v1';

const App: React.FC = () => {
  const [income, setIncome] = useState<IncomeState>(INITIAL_INCOME_STATE);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.income) setIncome(parsed.income);
        if (parsed.expenses) setExpenses(parsed.expenses);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, expenses }));
    }
  }, [income, expenses, isLoaded]);

  const results = useMemo(() => getResults(income, expenses), [income, expenses]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-emerald-500/30 overflow-y-auto pb-20">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100"></div>
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h1 className="text-sm font-black text-white tracking-widest uppercase">
            Income <span className="text-emerald-500">Architect</span>
          </h1>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-24 lg:pt-28 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
            <section className="animate-in fade-in slide-in-from-left-4 duration-500">
              <IncomeInput income={income} setIncome={setIncome} />
            </section>

            <section className="animate-in fade-in slide-in-from-left-8 duration-700">
              <ExpenseTracker 
                expenses={expenses} 
                onUpdate={setExpenses}
              />
            </section>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-500">
            <ResultsView results={results} income={income} />
            
            <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
              <span>This is a rough estimate of income</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-20 border-t border-neutral-800 py-8 px-4 bg-black/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] font-black uppercase tracking-widest text-neutral-700">
          <div className="flex items-center space-x-6">
            <span className="bg-emerald-500/10 text-emerald-500/50 px-2 py-1 rounded">System V3.0-Precision</span>
            <span>Local Storage: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
