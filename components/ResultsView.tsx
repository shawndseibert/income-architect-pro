
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalculatedResults, TimeFrame, IncomeState } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, 
  Treemap, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  RadialBarChart, RadialBar
} from 'recharts';

interface Props {
  results: CalculatedResults;
  income: IncomeState;
}

type DisplayPeriod = 'Year' | 'Month' | 'Week' | 'Day';
type ChartType = 'PIE' | 'BAR' | 'TREEMAP' | 'RADAR' | 'RADIAL';

const CHART_TYPES: { type: ChartType; label: string }[] = [
  { type: 'PIE', label: 'Allocation Donut' },
  { type: 'RADIAL', label: 'Impact Concentrics' },
  { type: 'BAR', label: 'Relative Weight' },
  { type: 'TREEMAP', label: 'Volume Occupancy' },
  { type: 'RADAR', label: 'Balance Profile' },
];

const PREFS_STORAGE_KEY = 'income-architect-prefs-v2';

const getSpectralColor = (ratio: number) => {
  const hue = 240 * (1 - Math.min(1, Math.max(0, ratio)));
  return `hsl(${hue}, 75%, 50%)`;
};

/**
 * Custom Tooltip component optimized for the dark architect aesthetic.
 * Robustly handles name extraction for all Recharts data structures.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // RadialBar often nests data or uses 'name' on the payload itself
    const itemName = data.name || payload[0].name || label || 'Item';
    const itemValue = payload[0].value || data.value || 0;
    
    return (
      <div className="bg-[#121212] border border-neutral-800 p-3 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1 border-b border-white/5 pb-1">
          {itemName}
        </p>
        <p className="text-sm font-bold text-white retro-mono mt-1">
          ${Math.round(itemValue).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const ResultsView: React.FC<Props> = ({ results, income }) => {
  const [period, setPeriod] = useState<DisplayPeriod>('Month');
  const [chartIndex, setChartIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const touchStart = useRef<number | null>(null);

  // Load Preferences
  useEffect(() => {
    const saved = localStorage.getItem(PREFS_STORAGE_KEY);
    if (saved) {
      try {
        const { period: savedPeriod, chartIndex: savedIndex } = JSON.parse(saved);
        if (savedPeriod) setPeriod(savedPeriod);
        if (typeof savedIndex === 'number') setChartIndex(savedIndex);
      } catch (e) {
        console.error("Failed to load preferences", e);
      }
    }
    setIsReady(true);
  }, []);

  // Save Preferences
  useEffect(() => {
    if (isReady) {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({ period, chartIndex }));
    }
  }, [period, chartIndex, isReady]);

  const factor = useMemo(() => {
    switch (period) {
      case 'Year': return 1;
      case 'Month': return 1 / 12;
      case 'Week': return 1 / 52;
      case 'Day': return 1 / (income.daysPerWeek * 52 || 260);
      default: return 1;
    }
  }, [period, income.daysPerWeek]);

  const displayData = useMemo(() => ({
    takeHome: results.takeHomeAnnual * factor,
    fedTax: results.federalTaxAnnual * factor,
    stateTax: results.stateTaxAnnual * factor,
    expenses: results.expensesAnnual * factor,
    gross: results.grossAnnual * factor,
    expenseDetails: results.expenseDetails.map(d => ({ ...d, value: d.value * factor }))
  }), [results, factor]);

  const chartData = useMemo(() => {
    const base = [
      { name: 'Take Home', value: displayData.takeHome, color: '#10b981', fill: '#10b981' },
      { name: 'Federal Tax', value: displayData.fedTax, color: '#ef4444', fill: '#ef4444' },
      { name: 'State Tax', value: displayData.stateTax, color: '#b91c1c', fill: '#b91c1c' },
    ].filter(d => d.value > 0);

    const maxExpValue = Math.max(...displayData.expenseDetails.map(e => e.value), 1);
    const expenses = displayData.expenseDetails
      .sort((a, b) => b.value - a.value)
      .map((exp) => {
        const ratio = exp.value / maxExpValue;
        const isDefaultColor = exp.color.startsWith('hsl(150') || 
                              exp.color.startsWith('hsl(161') || 
                              exp.color.includes('hsl(');
        const finalColor = isDefaultColor ? getSpectralColor(ratio) : exp.color;
        return { ...exp, color: finalColor, fill: finalColor };
      });

    return [...base, ...expenses];
  }, [displayData]);

  const nextChart = () => setChartIndex((prev) => (prev + 1) % CHART_TYPES.length);
  const prevChart = () => setChartIndex((prev) => (prev - 1 + CHART_TYPES.length) % CHART_TYPES.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    if (diff > 50) nextChart();
    if (diff < -50) prevChart();
    touchStart.current = null;
  };

  const activeChart = CHART_TYPES[chartIndex];

  const StatBox = ({ label, value, subLabel, colorClass }: { label: string, value: number, subLabel: string, colorClass: string }) => (
    <div className="glass p-4 rounded-2xl border-emerald-500/10 transition-transform active:scale-95">
      <span className="text-[9px] uppercase tracking-widest font-black text-neutral-500 block mb-1">{label}</span>
      <div className={`text-lg md:text-xl font-bold retro-mono ${colorClass}`}>
        ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <span className="text-[9px] text-neutral-600 uppercase font-bold">{subLabel}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500">Analysis Console</h3>
        <div className="flex bg-neutral-900/80 p-1 rounded-lg border border-white/5">
          {(['Year', 'Month', 'Week', 'Day'] as DisplayPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${period === p ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden glass p-6 md:p-8 rounded-3xl border-emerald-500/20 bg-gradient-to-br from-neutral-900 to-black">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-500">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        
        <span className="text-xs uppercase tracking-[0.2em] font-black text-emerald-500/70 mb-2 block">Take-Home ({period})</span>
        <div className="flex flex-col">
          <h2 className="text-4xl md:text-6xl font-black text-white glow-text-green retro-mono mb-4 break-all">
            ${displayData.takeHome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h2>
          <div className="flex items-center space-x-2 -mt-2 mb-4">
             <span className="text-[10px] uppercase font-black text-emerald-500/50 tracking-tighter">Liquid Capital Remaining</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-bold text-neutral-400 uppercase">Gross: ${displayData.gross.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[9px] font-bold text-neutral-400 uppercase">Tax: ${(displayData.fedTax + displayData.stateTax).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-[9px] font-bold text-neutral-400 uppercase">Expenses: ${displayData.expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Yearly" value={results.takeHomeAnnual} subLabel="Net Profit" colorClass="text-emerald-400" />
        <StatBox label="Monthly" value={results.breakdown.monthly} subLabel="Post-Tax" colorClass="text-emerald-400/80" />
        <StatBox label="Weekly" value={results.breakdown.weekly} subLabel="Disposable" colorClass="text-emerald-400/60" />
        <StatBox label="Hourly" value={results.breakdown.hourly} subLabel="Production" colorClass="text-emerald-400/40" />
      </div>

      <div 
        className="glass p-6 rounded-3xl border-emerald-500/5 min-h-[400px] relative group overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-col space-y-2">
              <h4 className="text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">{activeChart.label}</h4>
              <div className="flex space-x-1.5">
                {CHART_TYPES.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setChartIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === chartIndex ? 'bg-emerald-500 w-4' : 'bg-neutral-800 hover:bg-neutral-700'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-[8px] font-black uppercase tracking-tighter text-neutral-700">
               <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>High Impact</span>
               </div>
               <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Low Impact</span>
               </div>
            </div>
         </div>

         <button onClick={prevChart} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-black/40 text-neutral-600 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6" /></svg>
         </button>
         <button onClick={nextChart} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-black/40 text-neutral-600 hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
         </button>
         
         <div className="h-[280px] w-full animate-in fade-in zoom-in-95 duration-500">
            <ResponsiveContainer width="100%" height="100%">
               {activeChart.type === 'PIE' ? (
                 <PieChart>
                   <Pie
                     data={chartData}
                     innerRadius={75}
                     outerRadius={105}
                     paddingAngle={4}
                     dataKey="value"
                     nameKey="name"
                     stroke="none"
                   >
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               ) : activeChart.type === 'RADIAL' ? (
                 <RadialBarChart 
                   cx="50%" 
                   cy="50%" 
                   innerRadius="15%" 
                   outerRadius="100%" 
                   barSize={12} 
                   data={chartData}
                 >
                   <RadialBar
                     background={{ fill: '#171717' }}
                     dataKey="value"
                     nameKey="name"
                     cornerRadius={10}
                   />
                   <Tooltip content={<CustomTooltip />} />
                 </RadialBarChart>
               ) : activeChart.type === 'BAR' ? (
                 <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar dataKey="value" nameKey="name" radius={[0, 10, 10, 0]}>
                       {chartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
               ) : activeChart.type === 'TREEMAP' ? (
                  <Treemap
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    aspectRatio={16 / 9}
                    stroke="#000"
                    fill="#10b981"
                  >
                    <Tooltip content={<CustomTooltip />} />
                  </Treemap>
               ) : (
                 <RadarChart outerRadius={90} data={chartData}>
                    <PolarGrid stroke="#262626" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#525252', fontSize: 8, fontWeight: 700 }} />
                    <Radar
                      name="Allocation"
                      dataKey="value"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                 </RadarChart>
               )}
            </ResponsiveContainer>
         </div>

         <div className="mt-8 flex flex-wrap justify-center gap-y-2 gap-x-4">
            {chartData.slice(0, 8).map((item, i) => (
               <div key={i} className="flex items-center space-x-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[9px] uppercase font-bold text-neutral-500 truncate">{item.name}</span>
               </div>
            ))}
            {chartData.length > 8 && <span className="text-[9px] uppercase font-bold text-neutral-700">+{chartData.length - 8} Additional Layers</span>}
         </div>

         <div className="mt-10 flex justify-center text-[8px] uppercase tracking-[0.4em] font-black text-neutral-800 animate-pulse">
            Swipe lateral to rotate viewports
         </div>
      </div>
    </div>
  );
};
