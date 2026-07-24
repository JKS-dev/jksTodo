import React from 'react';
import { Todo, FilterStatus, SortBy } from '../types';
import { CheckCircle2, ListTodo, AlertTriangle, Sparkles, Check, ArrowDownAZ } from 'lucide-react';

interface StatsOverviewProps {
  todos: Todo[];
  activeFilter?: FilterStatus;
  activeSortBy?: SortBy;
  onSelectFilterAndSort?: (filter: FilterStatus, sortBy: SortBy) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  todos,
  activeFilter = 'all',
  activeSortBy = 'createdAt',
  onSelectFilterAndSort,
}) => {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const highPriority = todos.filter((t) => !t.completed && t.priority === 'high').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <div 
      id="stats-overview-card"
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4 transition-all hover:border-slate-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Progress Ring Visual */}
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600 transition-all duration-500 ease-out"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-900">
              {percentage}%
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Productivity Overview</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {completed === total ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> All caught up! Perfect score today.
                </span>
              ) : (
                <span>
                  <strong>{completed}</strong> of <strong>{total}</strong> tasks completed ({active} remaining)
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
            {active === 0 ? '🎉 All Complete' : `${active} Pending`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60 p-0.5">
        <div
          className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Interactive Quick Filter & Sort Buttons */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Quick Sort & Filter</span>
          {activeFilter !== 'all' && (
            <button
              onClick={() => onSelectFilterAndSort?.('all', 'createdAt')}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Reset view
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-xs">
          {/* To Do Button */}
          <button
            type="button"
            id="stats-tile-todo"
            onClick={() => onSelectFilterAndSort?.('active', 'alphabetical')}
            className={`px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'active'
                ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-200 shadow-2xs'
                : 'bg-slate-50/80 border-slate-200/80 hover:bg-indigo-50/40 hover:border-indigo-300'
            }`}
            title="Show To Do tasks sorted alphabetically by name"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeFilter === 'active' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}>
                <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 group-hover:text-slate-900 whitespace-nowrap">To Do</span>
                  {activeFilter === 'active' && activeSortBy === 'alphabetical' && (
                    <ArrowDownAZ className="w-3 h-3 text-indigo-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{active}</p>
              </div>
            </div>
          </button>

          {/* Completed Button */}
          <button
            type="button"
            id="stats-tile-completed"
            onClick={() => onSelectFilterAndSort?.('completed', 'alphabetical')}
            className={`px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'completed'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 shadow-2xs'
                : 'bg-emerald-50/60 border-emerald-200/80 hover:bg-emerald-100/60 hover:border-emerald-300'
            }`}
            title="Show Completed tasks sorted alphabetically by name"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeFilter === 'completed' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-800 whitespace-nowrap">Completed</span>
                  {activeFilter === 'completed' && activeSortBy === 'alphabetical' && (
                    <ArrowDownAZ className="w-3 h-3 text-emerald-700 shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-900 leading-tight">{completed}</p>
              </div>
            </div>
          </button>

          {/* Urgent Button */}
          <button
            type="button"
            id="stats-tile-urgent"
            onClick={() => onSelectFilterAndSort?.('urgent', 'alphabetical')}
            className={`px-2 py-2 sm:px-3 sm:py-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
              activeFilter === 'urgent'
                ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-200 shadow-2xs'
                : 'bg-rose-50/60 border-rose-200/80 hover:bg-rose-100/60 hover:border-rose-300'
            }`}
            title="Show Urgent tasks sorted alphabetically by name"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${
                activeFilter === 'urgent' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <span className="text-[10px] sm:text-xs font-bold text-rose-800 whitespace-nowrap">Urgent</span>
                  {activeFilter === 'urgent' && activeSortBy === 'alphabetical' && (
                    <ArrowDownAZ className="w-3 h-3 text-rose-700 shrink-0" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-rose-900 leading-tight">{highPriority}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

