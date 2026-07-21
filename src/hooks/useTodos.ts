import { useState, useEffect, useCallback, useRef } from 'react';
import { Todo } from '../types';
import { UserProfile } from '../types';
import {
  subscribeToUserTodos,
  saveTodoToFirestore,
  updateTodoInFirestore,
  deleteTodoFromFirestore,
  batchSyncLocalTodosToFirestore,
  FirestoreErrorInfo
} from '../lib/firebase';

const LOCAL_STORAGE_KEY = 'todo_app_local_todos';

// Sample initial items for new users to quickly test the experience
const DEFAULT_SAMPLE_TODOS: Todo[] = [
  {
    id: 'sample-1',
    userId: 'guest',
    title: 'Welcome to TaskFlow! 🎯',
    description: 'This app works offline and syncs in real-time across all your devices once logged in.',
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

  // Reset initial load ref whenever user UID changes
  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [user?.uid]);

  // Subscribe to Firestore when authenticated
  useEffect(() => {
    if (!user?.uid) return;

    setIsSyncing(true);
    setSyncError(null);

    const unsubscribe = subscribeToUserTodos(
      user.uid,
      (remoteTodos) => {
        setIsSyncing(false);

        setTodos((prevTodos) => {
          if (remoteTodos.length > 0) {
            isInitialLoadRef.current = false;
            return remoteTodos;
          }

          if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            // Seed Firestore with initial tasks if remote collection is empty
            const currentLocal = prevTodos.length > 0 ? prevTodos : DEFAULT_SAMPLE_TODOS;
            batchSyncLocalTodosToFirestore(user.uid, currentLocal).catch(console.error);
            return currentLocal;
          }

          return [];
        });
      },
      (errInfo: FirestoreErrorInfo) => {
        console.warn('Firestore subscription error:', errInfo);
        setIsSyncing(false);
        const msg = errInfo.error || '';

        if (
          msg.includes('not-found') || 
          msg.includes('NOT_FOUND') || 
          msg.includes('not found') || 
          msg.includes('does not exist')
        ) {
          setSyncError('Firestore Database Not Found: Check Firestore Database in Firebase Console.');
        } else if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
          setSyncError('Permission Denied: Please check security rules in Firebase Console.');
        } else {
          setSyncError(`Sync issue: ${msg || 'Unable to sync with Firestore'}`);
        }
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

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

      if (user?.uid) {
        try {
          await saveTodoToFirestore(user.uid, newTodo);
        } catch (err) {
          console.warn('Failed to save todo to Firestore:', err);
        }
      }
    },
    [user]
  );

  // Toggle Complete
  const toggleTodo = useCallback(
    async (id: string) => {
      const target = todos.find((t) => t.id === id);
      if (!target) return;

      const nextCompleted = !target.completed;
      const now = Date.now();

      // Optimistic update
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: nextCompleted, updatedAt: now } : t
        )
      );

      if (user?.uid) {
        try {
          await updateTodoInFirestore(user.uid, id, {
            completed: nextCompleted,
            updatedAt: now,
          });
        } catch (err) {
          console.warn('Failed to update toggle in Firestore:', err);
        }
      }
    },
    [todos, user]
  );

  // Update Todo details
  const updateTodo = useCallback(
    async (id: string, updates: Partial<Omit<Todo, 'id' | 'userId' | 'createdAt'>>) => {
      const now = Date.now();

      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
      );

      if (user?.uid) {
        try {
          await updateTodoInFirestore(user.uid, id, {
            ...updates,
            updatedAt: now,
          });
        } catch (err) {
          console.warn('Failed to update todo in Firestore:', err);
        }
      }
    },
    [user]
  );

  // Delete Todo
  const deleteTodo = useCallback(
    async (id: string) => {
      setTodos((prev) => prev.filter((t) => t.id !== id));

      if (user?.uid) {
        try {
          await deleteTodoFromFirestore(user.uid, id);
        } catch (err) {
          console.warn('Failed to delete todo from Firestore:', err);
        }
      }
    },
    [user]
  );

  // Clear Completed Tasks
  const clearCompleted = useCallback(async () => {
    const completedIds = todos.filter((t) => t.completed).map((t) => t.id);
    setTodos((prev) => prev.filter((t) => !t.completed));

    if (user?.uid && completedIds.length > 0) {
      for (const id of completedIds) {
        try {
          await deleteTodoFromFirestore(user.uid, id);
        } catch (err) {
          console.warn('Failed to batch delete completed todos from Firestore:', err);
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
