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
      className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm transition-all focus-within:border-stone-400"
    >
      {/* Primary Input Line */}
      <div className="flex items-center gap-3">
        <input
          id="todo-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 bg-transparent text-stone-900 placeholder:text-stone-400 text-sm sm:text-base font-normal focus:outline-none"
        />

        <button
          id="toggle-details-btn"
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
            showDetails || description || dueDate || priority !== 'medium'
              ? 'bg-stone-100 text-stone-900 font-semibold'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
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
          className="h-10 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Expanded Options */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-fadeIn">
          {/* Priority & Category selects */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Priority Picker */}
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">Priority</label>
              <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/60">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    id={`priority-btn-${p}`}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-500 text-white shadow-xs'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-[11px] font-medium text-stone-500 mb-1">Category</label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:border-stone-400"
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
                <label className="block text-[11px] font-medium text-stone-500 mb-1">New Category Name</label>
                <input
                  id="custom-category-input"
                  type="text"
                  placeholder="e.g. Fitness"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                />
              </div>
            ) : (
              /* Due Date Input */
              <div>
                <label className="block text-[11px] font-medium text-stone-500 mb-1">Due Date</label>
                <input
                  id="due-date-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200/80 rounded-xl px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                />
              </div>
            )}
          </div>

          {/* Description / Notes */}
          <div>
            <textarea
              id="todo-description-input"
              rows={2}
              placeholder="Add optional notes or checklist details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>
        </div>
      )}
    </form>
  );
};
