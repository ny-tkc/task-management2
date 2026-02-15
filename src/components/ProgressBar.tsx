import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);

  let colorClass = 'bg-primary';
  if (percentage === 100) colorClass = 'bg-success';
  else if (percentage < 30) colorClass = 'bg-warning';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1 font-medium text-gray-600">
        <span>{percentage}% 完了</span>
        <span>{current} / {total} 件</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
