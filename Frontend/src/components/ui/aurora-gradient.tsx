import React, { useEffect, useRef } from 'react';

const AuroraGradient = ({ 
  className = '',
  colors = ['#00C9FF', '#92FE9D', '#6A82FB', '#FF0080', '#7928CA'],
  speed = 4,
  blur = 100,
  opacity = 0.5,
  interactive = true,
  children
}) => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const animationRef = useRef(null);
  
  // Setup and run aurora animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    
    const ctx = canvas.getContext('2d');
    
    let width = wrapper.offsetWidth;
    let height = wrapper.offsetHeight;
    let mouseX = width / 2;
    let mouseY = height / 2;
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      width = wrapper.offsetWidth;
      height = wrapper.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create gradient points
    const points = colors.map((color, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: Math.random() * 100 + 50,
      color
    }));
    
    // Track mouse position if interactive
    const handleMouseMove = (e) => {
      if (!interactive) return;
      
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    // Animation loop
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw aurora effect
      points.forEach((point, i) => {
        // Move points
        point.x += point.vx;
        point.y += point.vy;
        
        // Bounce off edges
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        
        // Subtle attraction to mouse position
        if (interactive) {
          const dx = mouseX - point.x;
          const dy = mouseY - point.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 300) {
            point.x += dx * 0.002;
            point.y += dy * 0.002;
          }
        }
        
        // Draw gradient
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.size
        );
        gradient.addColorStop(0, `${point.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${point.color}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    // Start animation loop
    const animate = () => {
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [colors, speed, blur, opacity, interactive]);
  
  return (
    <div 
      ref={wrapperRef}
      className={`relative ${className}`}
      style={{ overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ filter: `blur(${blur}px)` }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AuroraGradient;