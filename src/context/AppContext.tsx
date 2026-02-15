import React, { useReducer, useEffect, useContext, createContext } from 'react';
import type { AppState, Action } from '../types';

const initialState: AppState = {
  partners: [],
  tasks: [],
  recurringTasks: [],
};

const STORAGE_KEY = 'task_progress_app_v1';

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_PARTNER': {
      const newPartners = [...state.partners, action.payload].sort((a, b) => a.code.localeCompare(b.code));
      return { ...state, partners: newPartners };
    }
    case 'UPDATE_PARTNER':
      return {
        ...state,
        partners: state.partners.map(p => p.id === action.payload.id ? action.payload : p).sort((a, b) => a.code.localeCompare(b.code))
      };
    case 'DELETE_PARTNER':
      return { ...state, partners: state.partners.filter(p => p.id !== action.payload) };

    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'TOGGLE_ASSIGNMENT':
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id !== action.payload.taskId) return task;
          const newAssignments = task.assignments.map(a => {
            if (a.partnerId !== action.payload.partnerId) return a;
            return {
              ...a,
              completed: !a.completed,
              completedAt: !a.completed ? new Date().toISOString() : undefined
            };
          });
          return { ...task, assignments: newAssignments };
        })
      };
    case 'ARCHIVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload ? { ...t, archived: true } : t)
      };

    case 'ADD_RECURRING':
      return { ...state, recurringTasks: [...state.recurringTasks, action.payload] };
    case 'DELETE_RECURRING':
      return { ...state, recurringTasks: state.recurringTasks.filter(r => r.id !== action.payload) };

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType>({ state: initialState, dispatch: () => null });

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initial;
    } catch (e) {
      console.error("Failed to load state", e);
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
