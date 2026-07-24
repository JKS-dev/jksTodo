import React, { useState, useMemo } from 'react';
import { Todo, FilterStatus, SortBy } from '../types';
import { TodoItem } from './TodoItem';
import { AnimatePresence } from 'motion/react';
import { Search, ArrowUpDown, Trash2, ListChecks, X, Layers, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  categories: string[];
  filter?: FilterStatus;
  setFilter?: (f: FilterStatus) => void;
  sortBy?: SortBy;
  setSortBy?: (s: SortBy) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onUpdate,
  onDelete,
  onClearCompleted,
  categories,
  filter: controlledFilter,
  setFilter: controlledSetFilter,
  sortBy: controlledSortBy,
  setSortBy: controlledSetSortBy,
}) => {
  const [internalFilter, setInternalFilter] = useState<FilterStatus>('all');
  const [internalSortBy, setInternalSortBy] = useState<SortBy>('createdAt');

  const filter = controlledFilter ?? internalFilter;
  const setFilter = controlledSetFilter ?? setInternalFilter;
  const sortBy = controlledSortBy ?? internalSortBy;
  const setSortBy = controlledSetSortBy ?? setInternalSortBy;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute category counts for pills
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    todos.forEach((t) => {
      if (t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    return counts;
  }, [todos]);

  // Compute overdue count
  const overdueCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return todos.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
  }, [todos]);

  const filteredTodos = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    return todos
      .filter((t) => {
        // Status Filter
        if (filter === 'active' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;
        if (filter === 'urgent' && (t.completed || t.priority !== 'high')) return false;
        if (filter === 'overdue' && (t.completed || !t.dueDate || t.dueDate >= today)) return false;

        // Category Filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q);
          const matchCat = t.category?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'priority') {
          const order = { high: 3, medium: 2, low: 1 };
          return order[b.priority] - order[a.priority];
        }
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [todos, filter, selectedCategory, searchQuery, sortBy]);

  const completedCount = todos.filter((t) => t.completed).length;

  const handleClearCompleted = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 45,
      spread: 60,
      startVelocity: 22,
      origin: { x, y },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      disableForReducedMotion: true,
      scalar: 0.75,
    });

    onClearCompleted();
  };

  return (
    <div className="space-y-4">
      {/* Unified Search & Views Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5 transition-all">
        {/* Row 1: Search & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-todos-input"
              type="text"
              placeholder="Search tasks, categories, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="priority">Highest Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Row 2: Status View Tabs & Category Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* View Filter Segmented Control */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/70 w-full sm:w-auto overflow-x-auto no-scrollbar touch-pan-x gap-1 snap-x scroll-smooth">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'To Do' },
              { id: 'completed', label: 'Completed' },
              { id: 'urgent', label: 'Urgent' },
              ...(overdueCount > 0 ? [{ id: 'overdue', label: `Overdue (${overdueCount})` }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                id={`filter-tab-${tab.id}`}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 sm:flex-none shrink-0 min-w-[64px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap text-center snap-start ${
                  filter === tab.id
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x max-w-full pb-1 sm:pb-0 scroll-smooth">
            <button
              id="category-pill-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              return (
                <button
                  key={cat}
                  id={`category-pill-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-xl border transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                      selectedCategory === cat ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clear Completed Action Header */}
      {completedCount > 0 && filter !== 'active' && (
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <strong>{filteredTodos.length}</strong> of {todos.length} task{todos.length !== 1 ? 's' : ''}
          </span>
          <button
            id="clear-completed-btn"
            onClick={handleClearCompleted}
            className="font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-lg"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear {completedCount} completed</span>
          </button>
        </div>
      )}

      {/* Todo Items List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filteredTodos.length > 0 ? (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div 
              id="empty-todos-state"
              className="bg-white rounded-2xl p-8 border border-slate-200/80 text-center space-y-3 animate-fade-in"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center shadow-2xs">
                <ListChecks className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">No tasks found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? 'No tasks match your search query. Try resetting your search or filter options.'
                    : filter === 'completed'
                    ? 'You have no completed tasks yet.'
                    : filter === 'overdue'
                    ? 'Great news! You have no overdue tasks.'
                    : 'Add a new task using the input form above!'}
                </p>
              </div>
              {(searchQuery || selectedCategory !== 'all' || filter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setFilter('all');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer border border-indigo-200/60 inline-flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Clear Filters
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

