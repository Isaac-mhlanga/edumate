
'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface HeroBackgroundProps extends React.HTMLAttributes<HTMLCanvasElement> {}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ className, ...props }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 70;
    
    let mouse = {
        x: 0,
        y: 0,
        radius: 150
    };

    const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
          canvas.width = parent.offsetWidth;
          canvas.height = parent.offsetHeight;
      }
      init();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor(x: number, y: number, size: number, speedX: number, speedY: number) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = speedX;
        this.speedY = speedY;
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

        this.x += this.speedX;
        this.y += this.speedY;
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + this.size){
            if(mouse.x < this.x && this.x < canvas.width - this.size * 10){
                this.x += 5;
            }
            if(mouse.x > this.x && this.x > this.size * 10){
                this.x -= 5;
            }
            if(mouse.y < this.y && this.y < canvas.height - this.size * 10){
                this.y += 5;
            }
            if(mouse.y > this.y && this.y > this.size * 10){
                this.y -= 5;
            }
        }
      }

      draw() {
        const color = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(45, 25, 80, 0.8)';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        let size = Math.random() * 1.5 + 1;
        let x = Math.random() * (innerWidth - size * 2 - size * 2) + size * 2;
        let y = Math.random() * (innerHeight - size * 2 - size * 2) + size * 2;
        let speedX = Math.random() * 2 - 1;
        let speedY = Math.random() * 2 - 1;
        particles.push(new Particle(x, y, size, speedX, speedY));
      }
    };
    
    const connect = () => {
        let opacityValue = 1;
        const color = resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(45, 25, 80, 0.1)';

        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) 
                             + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = resolvedTheme === 'dark' ? `rgba(255, 255, 255, ${opacityValue})` : `rgba(45, 25, 80, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();
    
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [resolvedTheme]);

  return <canvas ref={canvasRef} className={cn(className)} {...props} />;
};

HeroBackground.displayName = 'HeroBackground';
