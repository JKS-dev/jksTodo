import React, { useState } from 'react';
import { Priority, Todo } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Tag, Calendar, ChevronDown, ChevronUp, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface TodoInputProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  categories: string[];
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAddTodo, categories }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('Personal');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    onAddTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      category: finalCategory,
      dueDate: dueDate || null,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setDueDate('');
    setShowDetails(false);
  };

  const handleQuickDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const today = new Date();
    if (type === 'today') {
      setDueDate(today.toISOString().split('T')[0]);
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    } else if (type === 'nextWeek') {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDueDate(nextWeek.toISOString().split('T')[0]);
    }
  };

  return (
    <form 
      id="add-todo-form"
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50/80 hover:border-slate-300"
    >
      {/* Main Input Field Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </div>

        <input
          id="todo-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task (e.g. Finish project proposal, Buy groceries)..."
          className="flex-1 min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium focus:outline-none"
        />

        <button
          id="toggle-details-btn"
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            showDetails || description || dueDate || priority !== 'medium'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
          }`}
          title="Toggle details (Priority, Category, Due Date)"
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Options</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          id="add-todo-submit-btn"
          type="submit"
          disabled={!title.trim()}
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Expanded Quick Options Drawer */}
      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-3.5">
              {/* Priority & Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Priority Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                    {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                      <button
                        key={p}
                        id={`priority-btn-${p}`}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : p === 'medium'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    id="category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category...</option>
                  </select>
                </div>

                {/* Custom Category Input if Custom Selected */}
                {category === 'Custom' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Custom Category
                    </label>
                    <input
                      id="custom-category-input"
                      type="text"
                      placeholder="e.g. Fitness, Travel"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  /* Due Date Input & Quick Presets */
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Due Date
                      </label>
                      <div className="flex gap-1 text-[10px] font-semibold text-indigo-600">
                        <button type="button" onClick={() => handleQuickDate('today')} className="hover:underline cursor-pointer">Today</button>
                        <span>•</span>
                        <button type="button" onClick={() => handleQuickDate('tomorrow')} className="hover:underline cursor-pointer">Tomorrow</button>
                      </div>
                    </div>
                    <input
                      id="due-date-input"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Optional Notes / Description */}
              <div>
                <textarea
                  id="todo-description-input"
                  rows={2}
                  placeholder="Add optional notes, links or checklist items..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none font-medium"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

