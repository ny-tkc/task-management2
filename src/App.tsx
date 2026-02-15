import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { TaskList } from './pages/TaskList';
import { TaskDetail } from './pages/TaskDetail';
import { Masters } from './pages/Masters';
import { Export } from './pages/Export';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
          <Navigation />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/:taskId" element={<TaskDetail />} />
                <Route path="/masters" element={<Masters />} />
                <Route path="/export" element={<Export />} />
              </Routes>
            </div>
          </main>
        </div>
      </HashRouter>
    </AppProvider>
  );
};
