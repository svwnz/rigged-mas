import React, { useEffect, useRef } from 'react';

const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces: { x: number; y: number; color: string; velocity: { x: number; y: number }; rotation: number }[] = [];
    const colors = ['#ef4444', '#22c55e', '#fbbf24', '#ffffff'];

    for (let i = 0; i < 150; i++) {
      pieces.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: { x: (Math.random() - 0.5) * 15, y: (Math.random() - 0.5) * 15 },
        rotation: Math.random() * 360
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      pieces.forEach((p, index) => {
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.velocity.y += 0.2; // gravity
        p.velocity.x *= 0.99; // friction
        p.rotation += 2;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-5, -5, 10, 10);
        ctx.restore();

        if (p.y > window.innerHeight) {
          pieces.splice(index, 1);
        }
      });

      if (pieces.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

export default Confetti;