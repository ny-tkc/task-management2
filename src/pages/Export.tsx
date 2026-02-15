import React from 'react';
import { Download, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Export: React.FC = () => {
  const { state } = useApp();

  const handleDownloadIncomplete = () => {
    const activeTasks = state.tasks.filter(t => !t.archived);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "\uFEFF";
    csvContent += "コード,事務所名,タスク名\n";

    activeTasks.forEach(task => {
      task.assignments.forEach(assignment => {
        if (!assignment.completed) {
          const partner = state.partners.find(p => p.id === assignment.partnerId);
          if (partner) {
            const row = `"${partner.code}","${partner.name}","${task.title}"`;
            csvContent += row + "\n";
          }
        }
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `未完了タスク一覧_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">データ出力</h1>
        <p className="text-gray-500 mt-1">タスクや進捗状況をCSV形式でダウンロードできます。</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
              <FileText size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">未完了タスク切り出し</h2>
            <p className="text-gray-600 text-sm mb-4">
              現在進行中のタスクの中で、未完了となっている事務所一覧を出力します。<br />
              リスト作成やリマインド連絡等に活用できます。
            </p>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 font-mono mb-4">
              出力項目: コード, 事務所名, タスク名
            </div>
          </div>
          <button
            onClick={handleDownloadIncomplete}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition group"
          >
            <Download size={20} className="mr-2 group-hover:animate-bounce" />
            CSVダウンロード
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center opacity-75">
          <p className="font-bold text-gray-400">その他のレポート</p>
          <p className="text-sm text-gray-400 mt-1">将来的な機能拡張用エリア</p>
        </div>
      </div>
    </div>
  );
};
