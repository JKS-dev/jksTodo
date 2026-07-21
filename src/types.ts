export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate: string | null; // ISO string YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
  order?: number;
}

export type FilterStatus = 'all' | 'active' | 'completed';
export type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'alphabetical';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous: boolean;
}
