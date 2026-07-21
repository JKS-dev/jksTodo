import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Todo } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with offline persistence
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // Fallback if already initialized
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const googleProvider = new GoogleAuthProvider();

// Auth Helper Functions
export const signUpWithEmail = (email: string, pass: string) => 
  createUserWithEmailAndPassword(auth, email, pass);

export const signInWithEmail = (email: string, pass: string) => 
  signInWithEmailAndPassword(auth, email, pass);

export const signInGuest = () => signInAnonymously(auth);

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logOutUser = () => signOut(auth);

// Firestore Todo Sync Helpers
export const getTodosCollection = (userId: string) => {
  return collection(db, 'users', userId, 'todos');
};

export const subscribeToUserTodos = (
  userId: string,
  onSuccess: (todos: Todo[]) => void,
  onError?: (err: Error) => void
) => {
  const todosRef = collection(db, 'users', userId, 'todos');
  const q = query(todosRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const todos: Todo[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Todo[];
      onSuccess(todos);
    },
    (error) => {
      console.warn('Firestore snapshot error (likely offline):', error);
      if (onError) onError(error);
    }
  );
};

export const saveTodoToFirestore = async (userId: string, todo: Todo) => {
  const todoRef = doc(db, 'users', userId, 'todos', todo.id);
  await setDoc(todoRef, todo, { merge: true });
};

export const updateTodoInFirestore = async (userId: string, todoId: string, updates: Partial<Todo>) => {
  const todoRef = doc(db, 'users', userId, 'todos', todoId);
  await updateDoc(todoRef, {
    ...updates,
    updatedAt: Date.now()
  });
};

export const deleteTodoFromFirestore = async (userId: string, todoId: string) => {
  const todoRef = doc(db, 'users', userId, 'todos', todoId);
  await deleteDoc(todoRef);
};

export const batchSyncLocalTodosToFirestore = async (userId: string, todos: Todo[]) => {
  if (todos.length === 0) return;
  const batch = writeBatch(db);
  todos.forEach((todo) => {
    const todoRef = doc(db, 'users', userId, 'todos', todo.id);
    batch.set(todoRef, { ...todo, userId }, { merge: true });
  });
  await batch.commit();
};
