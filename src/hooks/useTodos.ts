import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo, Priority } from '../types';
import { UserProfile } from '../types';
import {
  subscribeToUserTodos,
  saveTodoToFirestore,
  updateTodoInFirestore,
  deleteTodoFromFirestore,
  batchSyncLocalTodosToFirestore
} from '../lib/firebase';

const LOCAL_STORAGE_KEY = 'todo_app_local_todos';

// Sample initial items for new users to quickly test the experience
const DEFAULT_SAMPLE_TODOS: Todo[] = [
  {
    id: 'sample-1',
    userId: 'guest',
    title: 'Welcome to your Minimalist Todo List! 🎯',
    description: 'This app works offline and syncs across all your devices once you log in.',
    completed: false,
    priority: 'high',
    category: 'Getting Started',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 20000,
    updatedAt: Date.now() - 20000,
  },
  {
    id: 'sample-2',
    userId: 'guest',
    title: 'Try adding a new task with priority and category tags',
    description: 'Use categories like Work, Personal, or custom tags to organize your day.',
    completed: false,
    priority: 'medium',
    category: 'Work',
    dueDate: null,
    createdAt: Date.now() - 10000,
    updatedAt: Date.now() - 10000,
  },
  {
    id: 'sample-3',
    userId: 'guest',
    title: 'Sign in to enable real-time multi-device sync 📱💻',
    description: 'Click "Account" in the top bar to log in or create an account.',
    completed: true,
    priority: 'low',
    category: 'Account',
    dueDate: null,
    createdAt: Date.now() - 5000,
    updatedAt: Date.now() - 5000,
  }
];

export function useTodos(user: UserProfile | null, isOnline: boolean) {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Failed to parse local storage todos', err);
    }
    return DEFAULT_SAMPLE_TODOS;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Sync state to local storage for offline resiliency
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
    } catch (err) {
      console.warn('Failed to write local storage', err);
    }
  }, [todos]);

  // Subscribe to Firestore when authenticated
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    setSyncError(null);

    const unsubscribe = subscribeToUserTodos(
      user.uid,
      (remoteTodos) => {
        setTodos(remoteTodos);
        setIsSyncing(false);

        // If local storage has guest sample tasks, offer batch upload on first login
        if (isInitialLoadRef.current) {
          isInitialLoadRef.current = false;
          try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (stored) {
              const localList: Todo[] = JSON.parse(stored);
              const unSyncedLocal = localList.filter(
                (lt) => !remoteTodos.some((rt) => rt.id === lt.id) && !lt.id.startsWith('sample-')
              );
              if (unSyncedLocal.length > 0) {
                batchSyncLocalTodosToFirestore(user.uid, unSyncedLocal).catch(console.error);
              }
            }
          } catch (e) {
            console.error('Failed batch sync', e);
          }
        }
      },
      (err) => {
        console.warn('Firestore subscription offline fallback', err);
        setIsSyncing(false);
        setSyncError('Working offline. Changes will sync when online.');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Add Todo
  const addTodo = useCallback(
    async (todoData: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      const newTodo: Todo = {
        ...todoData,
        id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: user ? user.uid : 'guest',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Optimistic update
      setTodos((prev) => [newTodo, ...prev]);

      if (user) {
        try {
          await saveTodoToFirestore(user.uid, newTodo);
        } catch (err) {
          console.warn('Queued todo write for offline sync', err);
        }
      }
    },
    [user]
  );

  // Toggle Complete
  const toggleTodo = useCallback(
    async (id: string) => {
      let updatedItem: Todo | undefined;

      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            updatedItem = { ...t, completed: !t.completed, updatedAt: Date.now() };
            return updatedItem;
          }
          return t;
        })
      );

      if (user && updatedItem) {
        try {
          await updateTodoInFirestore(user.uid, id, {
            completed: updatedItem.completed,
          });
        } catch (err) {
          console.warn('Queued toggle write for offline sync', err);
        }
      }
    },
    [user]
  );

  // Update Todo details
  const updateTodo = useCallback(
    async (id: string, updates: Partial<Omit<Todo, 'id' | 'userId' | 'createdAt'>>) => {
      setTodos((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            return { ...t, ...updates, updatedAt: Date.now() };
          }
          return t;
        })
      );

      if (user) {
        try {
          await updateTodoInFirestore(user.uid, id, updates);
        } catch (err) {
          console.warn('Queued update write for offline sync', err);
        }
      }
    },
    [user]
  );

  // Delete Todo
  const deleteTodo = useCallback(
    async (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));

      if (user) {
        try {
          await deleteTodoFromFirestore(user.uid, id);
        } catch (err) {
          console.warn('Queued delete write for offline sync', err);
        }
      }
    },
    [user]
  );

  // Clear Completed Tasks
  const clearCompleted = useCallback(async () => {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    setTodos((prev) => prev.filter((t) => !t.completed));

    if (user && completedIds.length > 0) {
      for (const id of completedIds) {
        try {
          await deleteTodoFromFirestore(user.uid, id);
        } catch (err) {
          console.warn('Queued batch delete for offline sync', err);
        }
      }
    }
  }, [todos, user]);

  return {
    todos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    isSyncing,
    syncError,
  };
}
