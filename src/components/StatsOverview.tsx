import React from 'react';
import { Todo } from '../types';
import { CheckCircle2, ListTodo, AlertTriangle, Sparkles } from 'lucide-react';

interface StatsOverviewProps {
  todos: Todo[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ todos }) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const highPriority = todos.filter((t) => !t.completed && t.priority === 'high').length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div 
      id="stats-overview-card"
      className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-slate-900">Task Overview</span>
        </div>
        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full text-[11px] border border-indigo-200/70">
          {percentage}% Done ({completed}/{total})
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1 text-center text-xs">
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">To Do</p>
          <p className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{active}</p>
        </div>

        <div className="bg-emerald-50 p-2 sm:p-2.5 rounded-xl border border-emerald-200">
          <p className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold">Done</p>
          <p className="text-sm sm:text-base font-bold text-emerald-700 mt-0.5">{completed}</p>
        </div>

        <div className="bg-rose-50 p-2 sm:p-2.5 rounded-xl border border-rose-200">
          <p className="text-[10px] text-rose-800 uppercase tracking-wider font-semibold">Urgent</p>
          <p className="text-sm sm:text-base font-bold text-rose-700 mt-0.5">{highPriority}</p>
        </div>
      </div>
    </div>
  );
};
