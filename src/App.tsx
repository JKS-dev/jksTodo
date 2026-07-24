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
import { FilterStatus, SortBy } from './types';

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
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');

  const handleSelectFilterAndSort = (targetFilter: FilterStatus, targetSortBy: SortBy) => {
    if (filter === targetFilter && sortBy === targetSortBy) {
      setFilter('all');
      setSortBy('createdAt');
    } else {
      setFilter(targetFilter);
      setSortBy(targetSortBy);
    }
  };

  // Extract unique categories dynamically from existing todos + defaults
  const categories = useMemo(() => {
    const defaultCats = ['Personal', 'Work', 'Shopping', 'Ideas'];
    const existingCats = todos.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...existingCats]));
  }, [todos]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white pb-20 antialiased relative">
      {/* Navbar Header */}
      <Navbar
        user={user}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-5">
        {/* Sync & Offline Status Callout */}
        <SyncStatusBanner
          isOnline={isOnline}
          user={user}
          syncError={syncError}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Unified Productivity Overview */}
        <StatsOverview
          todos={todos}
          activeFilter={filter}
          activeSortBy={sortBy}
          onSelectFilterAndSort={handleSelectFilterAndSort}
        />

        {/* Unified Task Input Dock */}
        <TodoInput onAddTodo={addTodo} categories={categories} />

        {/* Task List Workspace */}
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
          categories={categories}
          filter={filter}
          setFilter={setFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
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

