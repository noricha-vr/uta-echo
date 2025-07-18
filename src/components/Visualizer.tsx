import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VisualizerProps {
  audioEngine: { getAnalyserData: () => Uint8Array | null };
  isActive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  hue: number;
}

const Visualizer = ({ audioEngine, isActive }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const [visualMode, setVisualMode] = useState<'bars' | 'circular' | 'wave'>('bars');

  useEffect(() => {
    if (!isActive || !canvasRef.current) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    particlesRef.current = [];

    const createParticle = (x: number, y: number, intensity: number): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 3 - 1,
      radius: Math.random() * 3 + 1,
      life: 1,
      maxLife: 60 + Math.random() * 60,
      hue: 260 + Math.random() * 60 + intensity * 20,
    });

    const drawBars = (data: Uint8Array, width: number, height: number) => {
      const barWidth = width / data.length * 2.5;
      let x = 0;

      // Draw bars with gradient
      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * height * 0.7;
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        const hue = (i / data.length) * 60 + 260;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${hue + 20}, 70%, 50%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue + 40}, 85%, 65%, 0.6)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        
        // Add glow effect for high intensity
        if (data[i] > 200) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsl(${hue}, 80%, 60%)`;
          ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
          ctx.shadowBlur = 0;
        }
        
        // Create particles for high frequencies
        if (data[i] > 180 && Math.random() > 0.7) {
          particlesRef.current.push(
            createParticle(x + barWidth / 2, height - barHeight, data[i] / 255)
          );
        }
        
        x += barWidth;
        if (x > width) break;
      }
    };

    const drawCircular = (data: Uint8Array, width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      
      for (let i = 0; i < data.length; i++) {
        const angle = (i / data.length) * Math.PI * 2;
        const barHeight = (data[i] / 255) * radius;
        
        ctx.save();
        ctx.rotate(angle);
        
        // Create radial gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, barHeight);
        const hue = (i / data.length) * 60 + 260;
        gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue + 20}, 85%, 70%, 0.4)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-2, 0, 4, barHeight);
        
        // Add particle bursts
        if (data[i] > 200 && Math.random() > 0.8) {
          const px = Math.cos(angle) * barHeight;
          const py = Math.sin(angle) * barHeight;
          particlesRef.current.push(
            createParticle(centerX + px, centerY + py, data[i] / 255)
          );
        }
        
        ctx.restore();
      }
      
      ctx.restore();
      
      // Draw center circle with glow
      const avgIntensity = data.reduce((sum, val) => sum + val, 0) / data.length / 255;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + avgIntensity * 10, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(280, 80%, 60%, ${0.3 + avgIntensity * 0.5})`;
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'hsl(280, 80%, 60%)';
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawWave = (data: Uint8Array, width: number, height: number) => {
      ctx.beginPath();
      
      // Draw smooth wave
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * width;
        const y = height / 2 + (data[i] - 128) * height / 256;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = ((i - 1) / data.length) * width;
          const prevY = height / 2 + (data[i - 1] - 128) * height / 256;
          const cpx = (prevX + x) / 2;
          const cpy = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
        }
      }
      
      // Create gradient stroke
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'hsla(260, 80%, 60%, 0.8)');
      gradient.addColorStop(0.5, 'hsla(280, 70%, 50%, 0.9)');
      gradient.addColorStop(1, 'hsla(320, 85%, 65%, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'hsl(280, 80%, 60%)';
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Add secondary wave with less intensity
      ctx.beginPath();
      for (let i = 0; i < data.length; i += 2) {
        const x = (i / data.length) * width;
        const y = height / 2 + (data[i] - 128) * height / 512;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const updateParticles = () => {
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.life--;
        
        return particle.life > 0;
      });
    };

    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      particlesRef.current.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${alpha * 0.8})`;
        ctx.fill();
      });
    };

    const draw = () => {
      const data = audioEngine.getAnalyserData();
      if (!data) {
        animationIdRef.current = requestAnimationFrame(draw);
        return;
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
      ctx.fillRect(0, 0, width, height);

      // Draw based on visual mode
      switch (visualMode) {
        case 'bars':
          drawBars(data, width, height);
          break;
        case 'circular':
          drawCircular(data, width, height);
          break;
        case 'wave':
          drawWave(data, width, height);
          break;
      }

      // Update and draw particles
      updateParticles();
      drawParticles(ctx);

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [audioEngine, isActive, visualMode]);

  return (
    <div className="relative">
      {/* Mode selector */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {(['bars', 'circular', 'wave'] as const).map((mode) => (
          <motion.button
            key={mode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setVisualMode(mode)}
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              visualMode === mode
                ? 'bg-purple-500/50 text-white'
                : 'bg-black/30 text-gray-400 hover:bg-black/50'
            }`}
          >
            {mode === 'bars' && '▁▃▅▇'}
            {mode === 'circular' && '◉'}
            {mode === 'wave' && '~'}
          </motion.button>
        ))}
      </div>
      
      {/* Canvas container */}
      <motion.div 
        className="relative bg-gray-900/50 rounded-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded"
          style={{ 
            imageRendering: 'auto',
            filter: 'contrast(1.1) saturate(1.2)'
          }}
        />
        
        {/* Overlay gradient for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
        </div>
      </motion.div>
    </div>
  );
};

export default Visualizer;