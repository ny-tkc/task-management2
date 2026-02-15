import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, ArrowRight, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from '../components/ProgressBar';

export const Dashboard: React.FC = () => {
  const { state } = useApp();
  const { tasks } = state;

  const activeTasks = tasks.filter(t => !t.archived);
  const totalActive = activeTasks.length;

  const urgentTasks = activeTasks.filter(task => {
    const total = task.assignments.length;
    const completed = task.assignments.filter(a => a.completed).length;
    if (total === completed) return false;

    const daysUntil = Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return daysUntil <= 7;
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const recentTasks = [...activeTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">タスクの進捗状況と期限の確認ができます</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">進行中のタスク</p>
              <p className="text-2xl font-bold text-gray-800">{totalActive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">期限切れ・直前</p>
              <p className="text-2xl font-bold text-gray-800">{urgentTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">全パートナー数</p>
              <p className="text-2xl font-bold text-gray-800">{state.partners.length}</p>
            </div>
          </div>
        </div>
      </div>

      {urgentTasks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="text-red-500 mr-2" size={20} />
            要注意タスク（期限間近）
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {urgentTasks.map(task => {
              const completedCount = task.assignments.filter(a => a.completed).length;
              return (
                <Link to={`/tasks/${task.id}`} key={task.id} className="block group">
                  <div className="bg-white p-5 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">
                        あと {Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} 日
                      </span>
                      <span className="text-xs text-gray-500">{task.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors truncate">
                      {task.title}
                    </h3>
                    <ProgressBar current={completedCount} total={task.assignments.length} />
                    <div className="mt-3 text-xs text-gray-500 text-right">
                      期限: {task.deadline}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">最新のタスク</h2>
          <Link to="/tasks" className="text-sm text-primary hover:underline flex items-center">
            全て見る <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">タスク名</th>
                  <th className="px-6 py-4">区分</th>
                  <th className="px-6 py-4">期限</th>
                  <th className="px-6 py-4 w-1/3">進捗</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTasks.map(task => {
                  const completedCount = task.assignments.filter(a => a.completed).length;
                  return (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                          {task.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">{task.deadline}</td>
                      <td className="px-6 py-4">
                        <ProgressBar current={completedCount} total={task.assignments.length} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/tasks/${task.id}`} className="text-primary hover:text-indigo-800 font-medium text-xs">
                          詳細
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {recentTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      タスクがまだありません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
