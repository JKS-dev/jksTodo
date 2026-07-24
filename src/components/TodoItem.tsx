import React, { useState } from 'react';
import { Todo, Priority } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileText
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

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = todo.dueDate && !todo.completed && todo.dueDate < today;
  const isDueToday = todo.dueDate && !todo.completed && todo.dueDate === today;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      id={`todo-item-${todo.id}`}
      className={`group bg-white rounded-2xl p-4 border transition-all shadow-2xs hover:border-slate-300 ${
        todo.completed
          ? 'border-slate-200 bg-slate-50/60 text-slate-400'
          : isOverdue
          ? 'border-rose-200 bg-rose-50/30 text-slate-900'
          : isDueToday
          ? 'border-amber-200 bg-amber-50/20 text-slate-900'
          : 'border-slate-200/80 text-slate-900'
      }`}
    >
      {isEditing ? (
        /* Edit Mode Inline Form */
        <div className="space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Editing Task</span>
            <button
              onClick={() => setIsEditing(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            id={`edit-title-input-${todo.id}`}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-sm font-bold p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 font-bold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-800 font-bold"
              />
            </div>
          </div>

          <textarea
            rows={2}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Add notes, context, or checklist details..."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200/90 rounded-xl resize-none text-slate-800 font-medium"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              id={`cancel-edit-btn-${todo.id}`}
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              id={`save-edit-btn-${todo.id}`}
              onClick={handleSaveEdit}
              className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold cursor-pointer shadow-2xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        /* Normal Card View */
        <div>
          <div className="flex items-start justify-between gap-3">
            {/* Custom Checkbox */}
            <button
              id={`toggle-checkbox-${todo.id}`}
              onClick={() => onToggle(todo.id)}
              className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all cursor-pointer shadow-2xs ${
                todo.completed
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/50'
              }`}
              title={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {todo.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            {/* Todo Info & Tags */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => onToggle(todo.id)}
                  className={`text-sm sm:text-base font-semibold cursor-pointer leading-snug transition-all ${
                    todo.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-900'
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              {/* Tags Line */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                {/* Priority Badge */}
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(todo.priority)}`}>
                  {todo.priority}
                </span>

                {/* Category Tag */}
                {todo.category && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {todo.category}
                  </span>
                )}

                {/* Due Date Tag */}
                {todo.dueDate && (
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium border ${
                      isOverdue
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isDueToday
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200/80'
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    {todo.dueDate}
                    {isOverdue && <span className="font-bold text-[10px] text-rose-700 ml-0.5">(Overdue)</span>}
                    {isDueToday && <span className="font-bold text-[10px] text-amber-800 ml-0.5">(Today)</span>}
                  </span>
                )}

                {/* Toggle Notes Button */}
                {todo.description && (
                  <button
                    id={`toggle-notes-btn-${todo.id}`}
                    onClick={() => setShowNotes(!showNotes)}
                    className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 ml-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-200/80"
                  >
                    <FileText className="w-3 h-3 text-slate-400" />
                    <span>{showNotes ? 'Hide notes' : 'Notes'}</span>
                    {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* Notes Drawer */}
              <AnimatePresence initial={false}>
                {showNotes && todo.description && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border-l-2 border-l-indigo-500 border border-slate-200/80 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-normal">
                      {todo.description}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                id={`edit-todo-btn-${todo.id}`}
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                id={`delete-todo-btn-${todo.id}`}
                onClick={() => onDelete(todo.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

