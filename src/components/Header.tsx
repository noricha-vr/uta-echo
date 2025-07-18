import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Header = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden"
    >
      {/* Dynamic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: -mousePosition.x * 0.5,
            y: -mousePosition.y * 0.5,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 30 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl"
        />
        
        {/* Sound wave pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          preserveAspectRatio="none"
          viewBox="0 0 1440 400"
        >
          <motion.path
            d="M0,200 Q360,100 720,200 T1440,200"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,250 Q360,150 720,250 T1440,250"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.2, ease: "easeInOut" }}
          />
          <motion.path
            d="M0,150 Q360,50 720,150 T1440,150"
            stroke="url(#gradient)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.4, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          {/* Logo/Title with gradient animation */}
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-4 gradient-text"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            うたエコー
          </motion.h1>
          
          {/* Subtitle with typewriter effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="relative inline-block"
          >
            <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
              リアルタイムカラオケエフェクト
            </p>
            
            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1.2 }}
            />
          </motion.div>

          {/* Interactive hint */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-purple-400 rounded-full"
            />
            <span>マイクを有効にして、あなたの声を変身させよう</span>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-pink-400 rounded-full"
            />
          </motion.div>
        </motion.div>

        {/* Floating music notes animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 50,
              }}
              animate={{ 
                y: -100,
                x: `${Math.random() * 200 - 100}%`,
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: i * 2,
                ease: "linear",
              }}
            >
              {['♪', '♫', '♬'][Math.floor(Math.random() * 3)]}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;