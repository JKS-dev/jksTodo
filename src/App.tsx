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
  } = useTodos(user, isOnline);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Extract unique categories dynamically from existing todos + defaults
  const categories = useMemo(() => {
    const defaultCats = ['Personal', 'Work', 'Shopping', 'Ideas'];
    const existingCats = todos.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...existingCats]));
  }, [todos]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-900 selection:text-stone-50 pb-16">
      {/* Sticky Minimalist Header */}
      <Navbar
        user={user}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
        {/* Sync & Offline Status Callout */}
        <SyncStatusBanner
          isOnline={isOnline}
          user={user}
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
