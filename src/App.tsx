import React, { useState, useMemo } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useTodos } from './hooks/useTodos';
import { Navbar } from './components/Navbar';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { StatsOverview } from './components/StatsOverview';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const isOnline = useNetworkStatus();
  const {
    todos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    isSyncing,
    syncError,
  } = useTodos(user, isOnline);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Extract unique categories dynamically from existing todos + defaults
  const categories = useMemo(() => {
    const defaultCats = ['Personal', 'Work', 'Shopping', 'Ideas'];
    const existingCats = todos.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...existingCats]));
  }, [todos]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white pb-16 antialiased">
      {/* Sticky Modern Header */}
      <Navbar
        user={user}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-5">
        {/* Sync & Offline Status Callout */}
        <SyncStatusBanner
          isOnline={isOnline}
          user={user}
          syncError={syncError}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Progress Overview Stats */}
        <StatsOverview todos={todos} />

        {/* New Task Input Form */}
        <TodoInput onAddTodo={addTodo} categories={categories} />

        {/* Task List and Filters */}
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
          categories={categories}
        />
      </main>

      {/* Account Management & Device Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        user={user}
        isOnline={isOnline}
      />
    </div>
  );
}
