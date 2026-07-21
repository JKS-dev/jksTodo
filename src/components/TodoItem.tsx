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
        return 'bg-red-50 text-red-700 border-red-200/80';
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
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      id={`todo-item-${todo.id}`}
      className={`group bg-white rounded-2xl p-4 border transition-all shadow-2xs ${
        todo.completed
          ? 'border-stone-200/60 bg-stone-50/60 text-stone-400'
          : isOverdue
          ? 'border-red-200 bg-red-50/20 text-stone-900 hover:border-red-300'
          : 'border-stone-200/80 hover:border-stone-300 text-stone-900'
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
            className="w-full text-sm font-semibold p-2 border border-stone-300 rounded-xl focus:outline-none focus:border-stone-800"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="w-full text-xs p-1.5 bg-stone-50 border border-stone-200 rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full text-xs p-1.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-stone-500 mb-0.5">Due Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full text-xs p-1.5 bg-stone-50 border border-stone-200 rounded-lg"
              />
            </div>
          </div>

          <textarea
            rows={2}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Notes or details..."
            className="w-full text-xs p-2 bg-stone-50 border border-stone-200 rounded-lg resize-none"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              id={`cancel-edit-btn-${todo.id}`}
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              id={`save-edit-btn-${todo.id}`}
              onClick={handleSaveEdit}
              className="px-3 py-1 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded-lg font-semibold"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Normal View Mode */
        <div>
          <div className="flex items-start justify-between gap-3">
            {/* Custom Checkbox Toggle */}
            <button
              id={`toggle-checkbox-${todo.id}`}
              onClick={() => onToggle(todo.id)}
              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                todo.completed
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'border-stone-300 hover:border-stone-600 bg-white'
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
                    todo.completed ? 'line-through text-stone-400' : 'text-stone-900'
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              {/* Tags & Metadata */}
              <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                {/* Priority Badge */}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(todo.priority)}`}>
                  {todo.priority}
                </span>

                {/* Category Tag */}
                {todo.category && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200/60">
                    <Tag className="w-3 h-3 text-stone-400" />
                    {todo.category}
                  </span>
                )}

                {/* Due Date Tag */}
                {todo.dueDate && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                      isOverdue
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-stone-100 text-stone-600 border-stone-200/60'
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
                    className="text-[11px] text-stone-500 hover:text-stone-800 underline underline-offset-2 flex items-center gap-0.5 ml-1"
                  >
                    <span>{showNotes ? 'Hide notes' : 'View notes'}</span>
                    {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Expanded Description Notes */}
              {showNotes && todo.description && (
                <div className="mt-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-700 whitespace-pre-wrap leading-relaxed animate-fadeIn">
                  {todo.description}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                id={`edit-todo-btn-${todo.id}`}
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                id={`delete-todo-btn-${todo.id}`}
                onClick={() => onDelete(todo.id)}
                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
