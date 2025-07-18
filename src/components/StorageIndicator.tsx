interface StorageIndicatorProps {
  usage: number;
  limit: number;
}

const StorageIndicator = ({ usage, limit }: StorageIndicatorProps) => {
  const percentage = Math.round((usage / limit) * 100);
  const usageMB = (usage / (1024 * 1024)).toFixed(1);
  const limitMB = (limit / (1024 * 1024)).toFixed(0);
  
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">ストレージ使用状況</h3>
        <span className="text-sm text-gray-600">
          {usageMB} MB / {limitMB} MB ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {percentage >= 90 && (
        <p className="mt-2 text-sm text-red-600">
          ストレージ容量が残りわずかです。古い録音を削除してください。
        </p>
      )}
    </div>
  );
};

export default StorageIndicator;