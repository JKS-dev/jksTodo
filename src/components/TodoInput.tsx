import React, { useState } from 'react';
import { Priority, Todo } from '../types';
import { Plus, Tag, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

  return (
    <form 
      id="add-todo-form"
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-2xs transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100"
    >
      {/* Primary Input Line */}
      <div className="flex items-center gap-2 sm:gap-3">
        <input
          id="todo-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-normal focus:outline-none"
        />

        <button
          id="toggle-details-btn"
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
            showDetails || description || dueDate || priority !== 'medium'
              ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/70'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
          }`}
          title="More options (Priority, Category, Due Date)"
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Options</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          id="add-todo-submit-btn"
          type="submit"
          disabled={!title.trim()}
          className="h-10 px-3.5 sm:px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Add Task</span>
        </button>
      </div>

      {/* Expanded Options */}
      {showDetails && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
          {/* Priority & Category selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    id={`priority-btn-${p}`}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
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

            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
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
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">New Category Name</label>
                <input
                  id="custom-category-input"
                  type="text"
                  placeholder="e.g. Fitness"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ) : (
              /* Due Date Input */
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Due Date</label>
                <input
                  id="due-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Description / Notes */}
          <div>
            <textarea
              id="todo-description-input"
              rows={2}
              placeholder="Add optional notes or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
      )}
    </form>
  );
};
