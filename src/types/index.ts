export type TaskCategory = '研修' | 'TPS' | 'その他';

export interface Partner {
  id: string;
  code: string;
  name: string;
}

export interface RecurringTask {
  id: string;
  title: string;
  category: TaskCategory;
  triggerMonth: number;
  description?: string;
}

export interface TaskAssignment {
  partnerId: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  deadline: string;
  assignments: TaskAssignment[];
  createdAt: string;
  archived: boolean;
}

export interface AppState {
  partners: Partner[];
  tasks: Task[];
  recurringTasks: RecurringTask[];
}

export type Action =
  | { type: 'ADD_PARTNER'; payload: Partner }
  | { type: 'UPDATE_PARTNER'; payload: Partner }
  | { type: 'DELETE_PARTNER'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_ASSIGNMENT'; payload: { taskId: string; partnerId: string } }
  | { type: 'ARCHIVE_TASK'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringTask }
  | { type: 'DELETE_RECURRING'; payload: string };
