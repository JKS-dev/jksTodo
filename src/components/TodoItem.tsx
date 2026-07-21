import React, { useState } from 'react';
import { Todo, Priority } from '../types';
import { motion } from 'motion/react';
import {
  Check,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  X,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editCategory, setEditCategory] = useState(todo.category);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
  const [showNotes, setShowNotes] = useState(false);

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      category: editCategory.trim() || 'General',
      dueDate: editDueDate || null,
    });
    setIsEditing(false);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    }
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      id={`todo-item-${todo.id}`}
      className={`group bg-white rounded-2xl p-3.5 sm:p-4 border transition-all shadow-2xs ${
        todo.completed
          ? 'border-slate-200 bg-slate-50 text-slate-400'
          : isOverdue
          ? 'border-rose-200 bg-rose-50 text-slate-900 hover:border-rose-300'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs text-slate-900'
      }`}
    >
      {isEditing ? (
        /* Edit Mode Form */
        <div className="space-y-3">
          <input
            id={`edit-title-input-${todo.id}`}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-sm font-semibold p-2 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-lg text-slate-800"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Due Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <textarea
            rows={2}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Notes or details..."
            className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-lg resize-none text-slate-800"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              id={`cancel-edit-btn-${todo.id}`}
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id={`save-edit-btn-${todo.id}`}
              onClick={handleSaveEdit}
              className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Normal View Mode */
        <div>
          <div className="flex items-start justify-between gap-2.5">
            {/* Custom Checkbox Toggle */}
            <button
              id={`toggle-checkbox-${todo.id}`}
              onClick={() => onToggle(todo.id)}
              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                todo.completed
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 hover:border-indigo-500 bg-white'
              }`}
            >
              {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            {/* Todo Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  onClick={() => onToggle(todo.id)}
                  className={`text-sm sm:text-base font-medium cursor-pointer leading-snug transition-all ${
                    todo.completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              {/* Tags & Metadata */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                {/* Priority Badge */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(todo.priority)}`}>
                  {todo.priority}
                </span>

                {/* Category Tag */}
                {todo.category && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/70">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {todo.category}
                  </span>
                )}

                {/* Due Date Tag */}
                {todo.dueDate && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200/70'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {todo.dueDate}
                    {isOverdue && <span className="font-bold text-[10px] ml-0.5">(Overdue)</span>}
                  </span>
                )}

                {/* Toggle Notes Expander */}
                {todo.description && (
                  <button
                    id={`toggle-notes-btn-${todo.id}`}
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 underline underline-offset-2 flex items-center gap-0.5 ml-1 cursor-pointer"
                  >
                    <span>{showNotes ? 'Hide notes' : 'Notes'}</span>
                    {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Expanded Description Notes */}
              {showNotes && todo.description && (
                <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed animate-fadeIn">
                  {todo.description}
                </div>
              )}
            </div>

            {/* Action Buttons - Always visible & easily accessible on mobile */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                id={`edit-todo-btn-${todo.id}`}
                onClick={() => setIsEditing(true)}
                className="p-2 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                id={`delete-todo-btn-${todo.id}`}
                onClick={() => onDelete(todo.id)}
                className="p-2 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
