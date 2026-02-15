import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Edit3, Archive, Trash2, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProgressBar } from '../components/ProgressBar';
import type { TaskCategory } from '../types';

export const TaskDetail: React.FC = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<TaskCategory>('その他');
  const [editDeadline, setEditDeadline] = useState('');

  const task = state.tasks.find(t => t.id === taskId);

  if (!task) {
    return <div className="p-8 text-center">タスクが見つかりません</div>;
  }

  const total = task.assignments.length;
  const completed = task.assignments.filter(a => a.completed).length;
  const isAllComplete = total > 0 && total === completed;

  const filteredAssignments = task.assignments.filter(a => {
    const partner = state.partners.find(p => p.id === a.partnerId);
    if (!partner) return false;
    const query = searchTerm.toLowerCase();
    return partner.name.toLowerCase().includes(query) || partner.code.includes(query);
  }).sort((a, b) => {
    if (a.completed === b.completed) {
      const pA = state.partners.find(p => p.id === a.partnerId);
      const pB = state.partners.find(p => p.id === b.partnerId);
      return (pA?.code || '').localeCompare(pB?.code || '');
    }
    return a.completed ? 1 : -1;
  });

  const handleToggle = (partnerId: string) => {
    dispatch({
      type: 'TOGGLE_ASSIGNMENT',
      payload: { taskId: task.id, partnerId }
    });
  };

  const handleArchive = () => {
    if (window.confirm('このタスクを完了（アーカイブ）しますか？ダッシュボードから非表示になります。')) {
      dispatch({ type: 'ARCHIVE_TASK', payload: task.id });
      navigate('/tasks');
    }
  };

  const handleDelete = () => {
    if (window.confirm('本当にこのタスクを削除しますか？この操作は取り消せません。')) {
      dispatch({ type: 'DELETE_TASK', payload: task.id });
      navigate('/tasks');
    }
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditCategory(task.category);
    setEditDeadline(task.deadline);
    setIsEditMode(true);
  };

  const saveEdit = () => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        ...task,
        title: editTitle,
        category: editCategory,
        deadline: editDeadline
      }
    });
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 transition">
        <ArrowLeft size={20} className="mr-1" />
        戻る
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 w-full">
            {isEditMode ? (
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-indigo-100">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold border-gray-300 rounded focus:ring-primary"
                />
                <div className="flex gap-2">
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as TaskCategory)}
                    className="text-sm border-gray-300 rounded focus:ring-primary"
                  >
                    <option value="研修">研修</option>
                    <option value="TPS">TPS</option>
                    <option value="その他">その他</option>
                  </select>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="text-sm border-gray-300 rounded focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditMode(false)} className="px-3 py-1 text-sm bg-white border rounded">キャンセル</button>
                  <button onClick={saveEdit} className="px-3 py-1 text-sm bg-primary text-white rounded">保存</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">{task.category}</span>
                  {task.archived && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">アーカイブ済</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{task.title}</h1>
                <div className="flex items-center text-gray-500">
                  <span className="mr-4">期限: {task.deadline}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {!isEditMode && !task.archived && (
              <button onClick={startEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg tooltip" title="編集">
                <Edit3 size={20} />
              </button>
            )}
            {!task.archived && (
              <button
                onClick={handleArchive}
                disabled={!isAllComplete}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition
                  ${isAllComplete
                    ? 'bg-success text-white hover:bg-emerald-600 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <Archive size={18} className="mr-2" />
                完了にする
              </button>
            )}
            <button onClick={handleDelete} className="p-2 text-red-400 hover:bg-red-50 rounded-lg" title="削除">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="mb-8">
          <ProgressBar current={completed} total={total} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">進捗チェックリスト</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="事務所を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 md:w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAssignments.map(assignment => {
              const partner = state.partners.find(p => p.id === assignment.partnerId);
              if (!partner) return null;

              return (
                <div
                  key={assignment.partnerId}
                  onClick={() => handleToggle(assignment.partnerId)}
                  className={`
                    cursor-pointer p-4 rounded-lg border flex items-center justify-between transition group select-none
                    ${assignment.completed
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : 'bg-white border-gray-200 hover:border-primary hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-xs text-gray-400 font-mono mb-0.5">{partner.code}</p>
                    <p className={`font-medium truncate ${assignment.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {partner.name}
                    </p>
                  </div>
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center border transition-colors
                    ${assignment.completed ? 'bg-success border-success text-white' : 'border-gray-300 group-hover:border-primary'}
                  `}>
                    {assignment.completed && <CheckCircle size={16} />}
                  </div>
                </div>
              );
            })}
            {filteredAssignments.length === 0 && (
              <div className="col-span-full py-8 text-center text-gray-400">
                該当する事務所がありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
