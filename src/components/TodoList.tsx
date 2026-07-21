import React, { useState, useMemo } from 'react';
import { Todo, FilterStatus, SortBy } from '../types';
import { TodoItem } from './TodoItem';
import { AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowUpDown, CheckCircle2, Trash2, ListChecks } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onClearCompleted: () => void;
  categories: string[];
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggle,
  onUpdate,
  onDelete,
  onClearCompleted,
  categories,
}) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');

  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => {
        // Status Filter
        if (filter === 'active' && t.completed) return false;
        if (filter === 'completed' && !t.completed) return false;

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

  return (
    <div className="space-y-4">
      {/* Search & Main Filter Controls Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-todos-input"
              type="text"
              placeholder="Search tasks or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200/90 text-xs font-semibold text-slate-700 rounded-xl px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="createdAt">Newest First</option>
              <option value="priority">Highest Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs & Category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/70 w-full sm:w-auto">
            {(['all', 'active', 'completed'] as FilterStatus[]).map((f) => (
              <button
                key={f}
                id={`filter-tab-${f}`}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
            <button
              id="category-pill-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`category-pill-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Completed Action Header */}
      {completedCount > 0 && filter !== 'active' && (
        <div className="flex justify-end px-1">
          <button
            id="clear-completed-btn"
            onClick={onClearCompleted}
            className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear {completedCount} completed task{completedCount > 1 ? 's' : ''}</span>
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
              className="bg-white rounded-2xl p-8 border border-stone-200/80 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ListChecks className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">No tasks found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? 'No tasks match your search filter. Try clearing the search bar.'
                    : filter === 'completed'
                    ? 'You have not completed any tasks yet.'
                    : 'Add a new task above to get started!'}
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
