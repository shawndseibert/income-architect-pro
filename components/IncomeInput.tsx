
import React from 'react';
import { IncomeState, TimeFrame } from '../types';
import { FREQUENCY_OPTIONS, US_STATES } from '../constants';

interface Props {
  income: IncomeState;
  setIncome: (income: IncomeState) => void;
}

export const IncomeInput: React.FC<Props> = ({ income, setIncome }) => {
  const update = (fields: Partial<IncomeState>) => setIncome({ ...income, ...fields });

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-emerald-500 mb-3 font-black opacity-80">
          Revenue Architect & Jurisdiction
        </label>
        
        {/* Enforced vertical flow as per user preference */}
        <div className="flex flex-col gap-3">
          {/* Main Amount Input - Always full width on its own row */}
          <div className="relative w-full">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-emerald-500 font-black opacity-40">$</span>
            <input
              type="number"
              value={income.amount || ''}
              spellCheck="false"
              onChange={(e) => update({ amount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-neutral-900 border-2 border-neutral-800 focus:border-emerald-500/50 outline-none rounded-2xl py-5 pl-12 pr-4 text-3xl retro-mono text-white transition-all placeholder:text-neutral-800 shadow-inner"
              placeholder="0.00"
            />
          </div>

          {/* Configuration Cluster - A horizontal row of controls below the input */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Gross/Net Toggle */}
            <div className="flex bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 shrink-0 h-[72px] items-center">
              <button
                onClick={() => update({ isGross: true })}
                className={`px-5 h-full rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${income.isGross ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400'}`}
              >
                Gross
              </button>
              <button
                onClick={() => update({ isGross: false })}
                className={`px-5 h-full rounded-xl text-[11px] font-black transition-all uppercase tracking-widest ${!income.isGross ? 'bg-blue-600 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400'}`}
              >
                Net
              </button>
            </div>

            {/* Frequency Selector */}
            <div className="relative flex-grow sm:flex-grow-0">
              <select
                value={income.timeFrame}
                onChange={(e) => update({ timeFrame: e.target.value as TimeFrame })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl h-[72px] px-6 text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer focus:border-emerald-500/50 appearance-none text-neutral-300 min-w-[140px]"
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {/* Jurisdiction Selector */}
            <div className="relative flex-grow">
              <select
                value={income.stateCode}
                onChange={(e) => update({ stateCode: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl h-[72px] px-6 text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer focus:border-emerald-500/50 appearance-none text-neutral-300 min-w-[160px]"
              >
                {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code === 'NONE' ? 'Fed Only' : s.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Sliders - Logic remains same but visual consistent with new padding */}
      {(income.timeFrame === TimeFrame.HOURLY || income.timeFrame === TimeFrame.DAILY) && (
        <div className="glass p-6 rounded-[2rem] flex flex-col justify-center space-y-5 border-white/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Base Schedule Architect</span>
            <div className="flex items-center space-x-3">
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] retro-mono font-bold border border-emerald-500/20">{income.hoursPerDay}h/day</span>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] retro-mono font-bold border border-emerald-500/20">{income.daysPerWeek}d/week</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="24"
                value={income.hoursPerDay}
                onChange={(e) => update({ hoursPerDay: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="7"
                value={income.daysPerWeek}
                onChange={(e) => update({ daysPerWeek: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
