import { motion, AnimatePresence } from 'framer-motion';

interface StorageIndicatorProps {
  usage: number;
  limit: number;
}

const StorageIndicator = ({ usage, limit }: StorageIndicatorProps) => {
  const percentage = Math.round((usage / limit) * 100);
  const usageMB = (usage / (1024 * 1024)).toFixed(1);
  const limitMB = (limit / (1024 * 1024)).toFixed(0);
  
  const getProgressColor = () => {
    if (percentage >= 90) return 'from-red-500 to-red-600';
    if (percentage >= 70) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };
  
  const getGlowColor = () => {
    if (percentage >= 90) return 'rgba(239, 68, 68, 0.5)';
    if (percentage >= 70) return 'rgba(245, 158, 11, 0.5)';
    return 'rgba(34, 197, 94, 0.5)';
  };

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
          <span className="text-2xl">💾</span>
          ストレージ使用状況
        </h3>
        <motion.span 
          className="text-sm font-mono text-gray-400"
          animate={{ scale: percentage >= 90 ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: percentage >= 90 ? Infinity : 0, repeatDelay: 2 }}
        >
          {usageMB} MB / {limitMB} MB ({percentage}%)
        </motion.span>
      </div>
      
      {/* Progress bar container */}
      <div className="relative">
        <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden backdrop-blur-sm">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              boxShadow: `0 0 20px ${getGlowColor()}`
            }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }}
              animate={{ x: [-200, 200] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        
        {/* Percentage markers */}
        <div className="absolute inset-0 flex items-center">
          {[25, 50, 75].map((mark) => (
            <div
              key={mark}
              className="absolute h-full w-px bg-gray-600/50"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>
      </div>
      
      {/* Warning message */}
      <AnimatePresence>
        {percentage >= 70 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 overflow-hidden"
          >
            <motion.p 
              className={`text-sm flex items-center gap-2 ${
                percentage >= 90 ? 'text-red-400' : 'text-yellow-400'
              }`}
              animate={{ x: percentage >= 90 ? [0, -5, 0] : 0 }}
              transition={{ duration: 0.5, repeat: percentage >= 90 ? Infinity : 0, repeatDelay: 1 }}
            >
              <span className="text-lg">{percentage >= 90 ? '⚠️' : '⚡'}</span>
              {percentage >= 90 
                ? 'ストレージ容量が残りわずかです。古い録音を削除してください。'
                : 'ストレージ容量が少なくなってきています。'
              }
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Storage breakdown (optional enhancement) */}
      <motion.div 
        className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <div className="text-green-400 font-semibold">{(100 - percentage).toFixed(0)}%</div>
          <div>空き容量</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400 font-semibold">{usageMB} MB</div>
          <div>使用中</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 font-semibold">{limitMB} MB</div>
          <div>合計</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StorageIndicator;