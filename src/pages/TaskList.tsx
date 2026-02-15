import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Calendar, Archive } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from '../components/ProgressBar';
import type { TaskCategory } from '../types';

export const TaskList: React.FC = () => {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('その他');
  const [deadline, setDeadline] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [useTemplate, setUseTemplate] = useState('');

  const filteredTasks = state.tasks
    .filter(t => (filter === 'active' ? !t.archived : t.archived))
    .filter(t => categoryFilter === 'ALL' || t.category === categoryFilter)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || selectedPartners.length === 0) return;

    const newTask = {
      id: crypto.randomUUID(),
      title,
      category,
      deadline,
      createdAt: new Date().toISOString(),
      archived: false,
      assignments: selectedPartners.map(pid => ({
        partnerId: pid,
        completed: false
      }))
    };

    dispatch({ type: 'ADD_TASK', payload: newTask });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setCategory('その他');
    setDeadline('');
    setSelectedPartners([]);
    setUseTemplate('');
  };

  const applyTemplate = (templateId: string) => {
    const template = state.recurringTasks.find(t => t.id === templateId);
    if (template) {
      setTitle(template.title);
      setCategory(template.category);
      const currentYear = new Date().getFullYear();
      const targetDate = new Date(currentYear, template.triggerMonth - 1, 1);
      setDeadline(targetDate.toISOString().split('T')[0]);
      setSelectedPartners(state.partners.map(p => p.id));
      setUseTemplate(templateId);
    }
  };

  const togglePartnerSelection = (id: string) => {
    if (selectedPartners.includes(id)) {
      setSelectedPartners(selectedPartners.filter(p => p !== id));
    } else {
      setSelectedPartners([...selectedPartners, id]);
    }
  };

  const selectAllPartners = () => {
    if (selectedPartners.length === state.partners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(state.partners.map(p => p.id));
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">タスク管理</h1>
          <p className="text-gray-500">全ての業務タスクを一元管理します</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          新規タスク登録
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'active' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            進行中
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'archived' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            完了済み・アーカイブ
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
          >
            <option value="ALL">全ての区分</option>
            <option value="研修">研修</option>
            <option value="TPS">TPS</option>
            <option value="その他">その他</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">表示するタスクがありません</p>
          </div>
        )}
        {filteredTasks.map(task => {
          const completedCount = task.assignments.filter(a => a.completed).length;
          const isComplete = completedCount === task.assignments.length && task.assignments.length > 0;

          return (
            <Link to={`/tasks/${task.id}`} key={task.id} className="block">
              <div className={`bg-white p-6 rounded-xl border transition hover:shadow-md ${isComplete && filter === 'active' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        task.category === '研修' ? 'bg-blue-100 text-blue-700' :
                        task.category === 'TPS' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {task.category}
                      </span>
                      {task.archived && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600 flex items-center"><Archive size={12} className="mr-1"/> アーカイブ済</span>}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{task.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar size={14} className="mr-1" />
                      期限: {task.deadline}
                    </div>
                  </div>

                  <div className="w-full md:w-64">
                    <ProgressBar current={completedCount} total={task.assignments.length} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">新規タスク登録</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Filter className="rotate-45" size={24} />
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-6">
              {state.recurringTasks.length > 0 && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-indigo-900 mb-2">定期タスクから入力（任意）</label>
                  <select
                    value={useTemplate}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full bg-white border border-indigo-200 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
                  >
                    <option value="">テンプレートを選択...</option>
                    {state.recurringTasks.map(t => (
                      <option key={t.id} value={t.id}>{t.triggerMonth}月 - {t.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タスク名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                    placeholder="例: 年末調整資料配布"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">区分</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                  >
                    <option value="研修">研修</option>
                    <option value="TPS">TPS</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">期限 <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">対象事務所 ({selectedPartners.length}件選択中) <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={selectAllPartners}
                    className="text-xs text-primary hover:underline"
                  >
                    {selectedPartners.length === state.partners.length ? '全解除' : '全選択'}
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 bg-gray-50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {state.partners.length === 0 && <p className="text-sm text-gray-400 p-2 col-span-2">マスター管理から取引先を登録してください。</p>}
                  {state.partners.map(partner => (
                    <label key={partner.id} className="flex items-center p-2 rounded hover:bg-white transition cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPartners.includes(partner.id)}
                        onChange={() => togglePartnerSelection(partner.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700 truncate">
                        <span className="font-mono text-gray-400 mr-1">{partner.code}</span>
                        {partner.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={selectedPartners.length === 0}
                  className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  登録する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
