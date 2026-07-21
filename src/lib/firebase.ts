import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Todo } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with default database
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

// Helper to strip undefined values so Firestore setDoc / updateDoc won't throw invalid data errors
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

// Error Handling Infrastructure according to Firebase Skill Guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Auth Helper Functions
export const signUpWithEmail = (email: string, pass: string) => 
  createUserWithEmailAndPassword(auth, email, pass);

export const signInWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const signInGuest = () => signInAnonymously(auth);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logOutUser = () => signOut(auth);

// Realtime Firestore Subscription Listener
export const subscribeToUserTodos = (
  userId: string,
  onSuccess: (todos: Todo[]) => void,
  onError?: (err: FirestoreErrorInfo) => void
) => {
  const path = `users/${userId}/todos`;
  const todosRef = collection(db, 'users', userId, 'todos');

  const unsubscribe = onSnapshot(
    todosRef,
    (snapshot) => {
      const todos: Todo[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Todo[];
      // Sort newest created tasks first
      todos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onSuccess(todos);
    },
    (error) => {
      const errInfo = handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(errInfo);
    }
  );

  return unsubscribe;
};

// Save a todo document
export const saveTodoToFirestore = async (userId: string, todo: Todo) => {
  const path = `users/${userId}/todos/${todo.id}`;
  try {
    const todoRef = doc(db, 'users', userId, 'todos', todo.id);
    const cleanData = sanitizeForFirestore({ ...todo, userId });
    await setDoc(todoRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};

// Update a todo document
export const updateTodoInFirestore = async (userId: string, todoId: string, updates: Partial<Todo>) => {
  const path = `users/${userId}/todos/${todoId}`;
  try {
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    const cleanUpdates = sanitizeForFirestore({
      ...updates,
      updatedAt: Date.now(),
    });
    await setDoc(todoRef, cleanUpdates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }
};

// Delete a todo document
export const deleteTodoFromFirestore = async (userId: string, todoId: string) => {
  const path = `users/${userId}/todos/${todoId}`;
  try {
    const todoRef = doc(db, 'users', userId, 'todos', todoId);
    await deleteDoc(todoRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
};

// Batch sync local guest todos to Firestore upon login
export const batchSyncLocalTodosToFirestore = async (userId: string, todos: Todo[]) => {
  if (!todos || todos.length === 0) return;
  const path = `users/${userId}/todos`;
  try {
    const batch = writeBatch(db);
    todos.forEach((todo) => {
      const todoRef = doc(db, 'users', userId, 'todos', todo.id);
      const cleanData = sanitizeForFirestore({ ...todo, userId });
      batch.set(todoRef, cleanData, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
};
