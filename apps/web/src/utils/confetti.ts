// Lightweight Japanese Cherry Blossom (桜吹雪) and Golden Stardust Particle Engine
import { settingsRepo } from '../repositories';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  type: 'petal' | 'star' | 'circle';
}

class SakuraConfetti {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  private isEnabled(): boolean {
    const settings = settingsRepo.getSettings();
    return settings.sakuraParticles !== false;
  }

  private initCanvas() {
    if (typeof document === 'undefined') return;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100vw';
      this.canvas.style.height = '100vh';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '99999';
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
    }

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  /**
   * Launch Sakura celebration burst
   */
  public trigger(count: number = 60) {
    if (!this.isEnabled()) return;
    this.initCanvas();
    if (!this.ctx || !this.canvas) return;

    const colors = [
      '#FFB7C5', // Sakura pink
      '#FF9AA2', // Coral pink
      '#FFDAC1', // Warm peach
      '#FAD2E1', // Pale cherry
      '#E2ECE9', // White jade
      '#F8B500', // Gold flake
      '#D4AF37'  // Imperial gold
    ];

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < count; i++) {
      const typeChoice = Math.random();
      const type: 'petal' | 'star' | 'circle' = typeChoice > 0.4 ? 'petal' : typeChoice > 0.15 ? 'star' : 'circle';
      
      this.particles.push({
        x: Math.random() * width,
        y: -20 - Math.random() * 50,
        size: Math.random() * 12 + 6,
        speedX: (Math.random() - 0.5) * 3,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        opacity: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        type
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private drawPetal(ctx: CanvasRenderingContext2D, size: number) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size / 2, -size / 2, -size / 2, size / 2, 0, size);
    ctx.bezierCurveTo(size / 2, size / 2, size / 2, -size / 2, 0, 0);
    ctx.fill();
  }

  private drawStar(ctx: CanvasRenderingContext2D, size: number) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(
        Math.cos(((18 + i * 72) * Math.PI) / 180) * size,
        -Math.sin(((18 + i * 72) * Math.PI) / 180) * size
      );
      ctx.lineTo(
        Math.cos(((54 + i * 72) * Math.PI) / 180) * (size / 2),
        -Math.sin(((54 + i * 72) * Math.PI) / 180) * (size / 2)
      );
    }
    ctx.closePath();
    ctx.fill();
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.ctx.clearRect(0, 0, width, height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX + Math.sin(p.y * 0.02) * 1.2;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.005;

      if (p.y > height + 20 || p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.fillStyle = p.color;

      if (p.type === 'petal') {
        this.drawPetal(this.ctx, p.size);
      } else if (p.type === 'star') {
        this.drawStar(this.ctx, p.size * 0.7);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.animationId = null;
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, width, height);
      }
    }
  };
}

export const sakuraConfetti = new SakuraConfetti();
