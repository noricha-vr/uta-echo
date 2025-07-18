import { useEffect, useRef } from 'react';

interface VisualizerProps {
  audioEngine: any;
  isActive: boolean;
}

const Visualizer = ({ audioEngine, isActive }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | undefined>(undefined);

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
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const draw = () => {
      const data = audioEngine.getAnalyserData();
      if (!data) {
        animationIdRef.current = requestAnimationFrame(draw);
        return;
      }

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      
      // Clear canvas
      ctx.fillStyle = 'rgb(17, 24, 39)';
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = width / data.length * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        barHeight = (data[i] / 255) * height * 0.8;
        
        // Gradient color based on frequency
        const hue = (i / data.length) * 120 + 200; // Blue to purple
        const lightness = 50 + (data[i] / 255) * 30;
        ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
        
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
        
        x += barWidth;
        if (x > width) break;
      }

      animationIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [audioEngine, isActive]);

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
};

export default Visualizer;