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
      className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-3"
    >
      <div className="flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-stone-700" />
          <span className="font-semibold text-stone-900">Progress Overview</span>
        </div>
        <span className="font-bold text-stone-900">{percentage}% Done</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/50">
        <div
          className="bg-stone-900 h-full transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
        <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Remaining</p>
          <p className="text-sm font-bold text-stone-900 mt-0.5">{active}</p>
        </div>

        <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Completed</p>
          <p className="text-sm font-bold text-emerald-700 mt-0.5">{completed}</p>
        </div>

        <div className="bg-stone-50 p-2 rounded-xl border border-stone-200/60">
          <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Urgent</p>
          <p className="text-sm font-bold text-red-600 mt-0.5">{highPriority}</p>
        </div>
      </div>
    </div>
  );
};
