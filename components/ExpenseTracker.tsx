
import React, { useState } from 'react';
import { Expense, TimeFrame } from '../types';
import { FREQUENCY_OPTIONS } from '../constants';
import { convertToAnnual } from '../utils/calculations';

interface Props {
  expenses: Expense[];
  onUpdate: (expenses: Expense[]) => void;
}

/**
 * Generates a spectral color: Red (High Impact) -> Blue (Low Impact)
 * ratio 1.0 (Most expensive) = Red (Hue 0)
 * ratio 0.0 (Least expensive) = Blue (Hue 240)
 */
const getSpectralColor = (amount: number, maxAmount: number) => {
  const safeMax = maxAmount || 1;
  const ratio = Math.min(1, amount / safeMax);
  // Invert ratio: 1.0 -> 0 hue (red), 0.0 -> 240 hue (blue)
  const hue = 240 * (1 - ratio);
  return `hsl(${hue}, 75%, 50%)`;
};

const getRowDisplayTotal = (exp: Expense): number => {
  const base = exp.amount; 
  const subItemsSum = (exp.subItems || []).reduce((acc, sub) => {
    const subAnnual = convertToAnnual(sub.amount, sub.frequency);
    switch (exp.frequency) {
      case TimeFrame.YEARLY: return acc + subAnnual;
      case TimeFrame.MONTHLY: return acc + (subAnnual / 12);
      case TimeFrame.BIWEEKLY: return acc + (subAnnual / 26);
      case TimeFrame.WEEKLY: return acc + (subAnnual / 52);
      case TimeFrame.DAILY: return acc + (subAnnual / 365);
      case TimeFrame.HOURLY: return acc + (subAnnual / (8 * 5 * 52));
      default: return acc + subAnnual;
    }
  }, 0);
  return base + subItemsSum;
};

const SubItemForm: React.FC<{ 
  onAdd: (label: string, amount: number) => void;
  onCancel: () => void;
  parentLabel: string;
}> = ({ onAdd, onCancel, parentLabel }) => {
  const [l, setL] = useState('');
  const [a, setA] = useState<number | ''>('');
  
  const submit = () => {
    if (l) {
      onAdd(l, a === '' ? 0 : a);
      setL('');
      setA('');
    }
  };

  return (
    <div className="ml-6 glass p-5 rounded-2xl border-emerald-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl shadow-emerald-500/10">
      <div className="flex justify-between items-center">
        <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest">Architecting sub-item: {parentLabel}</p>
        <button onClick={onCancel} className="text-neutral-600 hover:text-white transition-colors text-lg">&times;</button>
      </div>
      <div className="flex flex-col space-y-3">
        <input
          type="text"
          placeholder="Sub-item name"
          value={l}
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          onChange={(e) => setL(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500/50 transition-all text-white placeholder:text-neutral-700"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="0.00"
            value={a}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            onChange={(e) => setA(parseFloat(e.target.value) || '')}
            className="flex-grow bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-emerald-500/50 text-white placeholder:text-neutral-700 retro-mono"
          />
          <button
            onClick={submit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

interface RowProps {
  exp: Expense;
  parentId: string | null;
  expenses: Expense[];
  onUpdate: (expenses: Expense[]) => void;
  maxExpense: number;
  triggerAdd?: () => void;
}

const ExpenseRow: React.FC<RowProps> = ({ exp, parentId, expenses, onUpdate, maxExpense, triggerAdd }) => {
  const [isAddingSub, setIsAddingSub] = useState(false);
  const displayTotal = getRowDisplayTotal(exp);
  const isContainer = exp.amount === 0;

  const handleAddSub = (label: string, amount: number) => {
    const color = getSpectralColor(amount, maxExpense);
    const newSub: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      label,
      amount,
      frequency: exp.frequency,
      color,
      subItems: []
    };
    const updated = expenses.map(e => {
      const findAndAdd = (item: Expense): Expense => {
        if (item.id === exp.id) return { ...item, subItems: [...(item.subItems || []), newSub] };
        if (item.subItems) return { ...item, subItems: item.subItems.map(findAndAdd) };
        return item;
      };
      return findAndAdd(e);
    });
    onUpdate(updated);
  };

  const removeExpense = () => {
    const findAndRemove = (list: Expense[]): Expense[] => {
      return list.filter(item => {
        if (item.id === exp.id) return false;
        if (item.subItems) item.subItems = findAndRemove(item.subItems);
        return true;
      });
    };
    onUpdate(findAndRemove([...expenses]));
  };

  const updateColor = (color: string) => {
    const updated = expenses.map(e => {
      const findAndUpdate = (item: Expense): Expense => {
        if (item.id === exp.id) return { ...item, color };
        if (item.subItems) return { ...item, subItems: item.subItems.map(findAndUpdate) };
        return item;
      };
      return findAndUpdate(e);
    });
    onUpdate(updated);
  };

  return (
    <div className={`space-y-1 ${parentId ? 'ml-6 border-l border-neutral-800 pl-4 mt-1' : ''}`}>
      <div className="glass group p-3 md:p-4 rounded-xl flex items-center justify-between border-transparent hover:border-emerald-500/20 transition-all">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Custom Styled Color Picker Swatch */}
          <div 
            className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-lg cursor-pointer ring-1 ring-white/5 transition-transform active:scale-95"
            style={{ backgroundColor: exp.color }}
          >
            <input 
              type="color" 
              value={exp.color} 
              onChange={(e) => updateColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-black truncate ${isContainer ? 'text-emerald-500' : 'text-neutral-200'}`}>{exp.label}</p>
            <p className="text-[9px] uppercase tracking-widest text-neutral-600 font-black">{exp.frequency}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="retro-mono text-xs md:text-sm text-neutral-400 font-bold mr-1">
            ${displayTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          
          {(isContainer || parentId) && (
            <button
              onClick={() => triggerAdd ? triggerAdd() : setIsAddingSub(!isAddingSub)}
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-emerald-600/5 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              title="Add Sibling/Sub-item"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          )}

          <button
            onClick={removeExpense}
            className="w-7 h-7 flex items-center justify-center rounded-xl text-neutral-700 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
      
      {isAddingSub && <SubItemForm onAdd={handleAddSub} onCancel={() => setIsAddingSub(false)} parentLabel={exp.label} />}

      {exp.subItems?.map(sub => (
        <ExpenseRow 
          key={sub.id} 
          exp={sub} 
          parentId={exp.id}
          expenses={expenses}
          onUpdate={onUpdate}
          maxExpense={maxExpense}
          triggerAdd={() => setIsAddingSub(true)}
        />
      ))}
    </div>
  );
};

export const ExpenseTracker: React.FC<Props> = ({ expenses, onUpdate }) => {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [frequency, setFrequency] = useState<TimeFrame>(TimeFrame.MONTHLY);
  const [isOpen, setIsOpen] = useState(false);

  // Use the total calculated value of top-level items for color scaling
  const maxExpenseValue = Math.max(...expenses.map(e => getRowDisplayTotal(e)), 100);

  const handleAddTopLevel = () => {
    if (label) {
      const numericAmount = amount === '' ? 0 : amount;
      const color = getSpectralColor(numericAmount, maxExpenseValue);
      const newExp: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        label,
        amount: numericAmount,
        frequency,
        color,
        subItems: []
      };
      onUpdate([...expenses, newExp]);
      setLabel('');
      setAmount('');
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-600 font-black">Expense Blueprint</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isOpen ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/5'}`}
        >
          {isOpen ? 'Close Architect' : '+ Deploy Category'}
        </button>
      </div>

      {isOpen && (
        <div className="glass p-6 rounded-3xl mb-8 space-y-6 border-emerald-500/20 animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl">
          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 ml-1">Asset/Bill Label</label>
              <input
                type="text"
                placeholder="e.g. Housing, Tech Stack"
                value={label}
                spellCheck="true"
                onChange={(e) => setLabel(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all text-white placeholder:text-neutral-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 ml-1">Cost Architect ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
                  className="bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all text-white placeholder:text-neutral-800 retro-mono"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70 ml-1">Cycle</label>
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as TimeFrame)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl px-5 py-4 text-[11px] font-black uppercase outline-none cursor-pointer focus:border-emerald-500/50 appearance-none text-neutral-300"
                  >
                    {FREQUENCY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddTopLevel}
            disabled={!label}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-black py-4 rounded-2xl transition-all uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
          >
            Finalize Deployment
          </button>
          <div className="flex items-center justify-center space-x-2 text-[9px] text-neutral-700 font-bold uppercase tracking-tighter">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            <span>Tip: 0 amount creates a parent container</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="glass p-16 rounded-[2.5rem] border-dashed border-neutral-800/50 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-3xl bg-neutral-900/50 flex items-center justify-center mb-6 text-neutral-700 border border-white/5">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            <p className="text-xs text-neutral-700 font-black uppercase tracking-[0.2em]">Blueprint Empty</p>
            <p className="text-[10px] text-neutral-800 mt-2 uppercase font-bold">Add assets or bills to start analysis</p>
          </div>
        ) : (
          expenses.map((exp) => (
            <ExpenseRow 
              key={exp.id} 
              exp={exp} 
              parentId={null}
              expenses={expenses}
              onUpdate={onUpdate}
              maxExpense={maxExpenseValue}
            />
          ))
        )}
      </div>
    </div>
  );
};
