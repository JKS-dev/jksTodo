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
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-stone-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              id="search-todos-input"
              type="text"
              placeholder="Search tasks or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-200/80 rounded-xl focus:outline-none focus:border-stone-400 text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              <option value="createdAt">Sort: Newest First</option>
              <option value="priority">Sort: Highest Priority</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="alphabetical">Sort: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs & Category Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
          {/* Status Tabs */}
          <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/60">
            {(['all', 'active', 'completed'] as FilterStatus[]).map((f) => (
              <button
                key={f}
                id={`filter-tab-${f}`}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  filter === f
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
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
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-600 border-stone-200/80 hover:bg-stone-100'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                id={`category-pill-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-600 border-stone-200/80 hover:bg-stone-100'
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
            className="text-xs font-medium text-stone-500 hover:text-red-600 flex items-center gap-1 transition-colors"
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
