import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { TaskCategory } from '../types';

const PartnerMaster: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode.length !== 5) {
      alert('コードは5桁で入力してください');
      return;
    }
    dispatch({
      type: 'ADD_PARTNER',
      payload: { id: crypto.randomUUID(), code: newCode, name: newName }
    });
    setNewCode('');
    setNewName('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('削除しますか？')) {
      dispatch({ type: 'DELETE_PARTNER', payload: id });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">取引先コード順に自動整列されます。</p>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 shadow-sm"
        >
          <Plus size={16} className="mr-2" /> 追加
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 flex flex-col md:flex-row gap-3 items-end md:items-center">
          <div>
            <label className="block text-xs text-gray-500 mb-1">コード (5桁)</label>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="border p-2 rounded w-24 text-sm"
              maxLength={5}
              placeholder="00001"
              required
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs text-gray-500 mb-1">事務所名</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-2 rounded w-full text-sm"
              placeholder="〇〇会計事務所"
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary text-white p-2 rounded text-sm">保存</button>
            <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-100 p-2 rounded text-sm">キャンセル</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-24">コード</th>
              <th className="px-4 py-3">事務所名</th>
              <th className="px-4 py-3 w-20 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {state.partners.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 group">
                <td className="px-4 py-3 font-mono text-gray-600">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(p.id)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {state.partners.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">データがありません</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RecurringMaster: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isAdding, setIsAdding] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('その他');
  const [month, setMonth] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask = {
      id: crypto.randomUUID(),
      title,
      category,
      triggerMonth: month,
    };
    dispatch({ type: 'ADD_RECURRING', payload: newTask });
    setIsAdding(false);
    setTitle('');
    setCategory('その他');
    setMonth(1);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('削除しますか？')) {
      dispatch({ type: 'DELETE_RECURRING', payload: id });
    }
  };

  const sortedTasks = [...state.recurringTasks].sort((a, b) => a.triggerMonth - b.triggerMonth);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">毎年発生する定期タスクのテンプレートを登録します。</p>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 shadow-sm"
        >
          <Plus size={16} className="mr-2" /> 追加
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">発生時期 (月)</label>
              <select
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
                className="w-full border p-2 rounded text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">区分</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full border p-2 rounded text-sm"
              >
                <option value="研修">研修</option>
                <option value="TPS">TPS</option>
                <option value="その他">その他</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">タスク名</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border p-2 rounded text-sm"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm text-gray-600">キャンセル</button>
            <button type="submit" className="px-3 py-1 text-sm bg-primary text-white rounded">保存</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg border border-gray-200 relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => handleDelete(task.id)} className="text-gray-400 hover:text-red-500 p-1">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded">{task.triggerMonth}月</span>
              <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded">{task.category}</span>
            </div>
            <h3 className="font-bold text-gray-800">{task.title}</h3>
          </div>
        ))}
        {sortedTasks.length === 0 && (
          <div className="col-span-full py-8 text-center text-gray-400">データがありません</div>
        )}
      </div>
    </div>
  );
};

export const Masters: React.FC = () => {
  const [activeTab, setActiveTab] = useState('partners');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">マスター管理</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'partners' ? 'text-primary border-b-2 border-primary bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            取引先情報
          </button>
          <button
            onClick={() => setActiveTab('recurring')}
            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'recurring' ? 'text-primary border-b-2 border-primary bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            定期タスク設定
          </button>
        </div>

        <div className="p-6 flex-1 bg-gray-50/30">
          {activeTab === 'partners' ? <PartnerMaster /> : <RecurringMaster />}
        </div>
      </div>
    </div>
  );
};
