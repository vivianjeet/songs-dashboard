import { useEffect, useRef } from 'react'
import { useTheme } from '@mui/material'

const PARTICLE_COUNT = 320
const MAX_SPEED = 0.15
const POINTER_RADIUS = 120
const POINTER_FORCE = 0.2
const LINK_DISTANCE = 130

function createParticle(width, height) {
  const driftAngle = Math.random() * Math.PI * 2
  const driftSpeed = MAX_SPEED * (0.2 + Math.random() * 0.3)
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * MAX_SPEED,
    vy: (Math.random() - 0.5) * MAX_SPEED,
    driftVx: Math.cos(driftAngle) * driftSpeed,
    driftVy: Math.sin(driftAngle) * driftSpeed,
    radius: 1 + Math.random() * 1.5,
  }
}

export function ParticleBackground() {
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: null, y: null })
  const theme = useTheme()

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let particles = []
    let animationFrameId = null
    let isVisible = true

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const { innerWidth, innerHeight } = window
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(innerWidth, innerHeight))
    }

    function step() {
      const { innerWidth: width, innerHeight: height } = window
      ctx.clearRect(0, 0, width, height)
      const dotColor = theme.palette.mode === 'dark' ? '255, 255, 255' : '0, 0, 0'
      const { x: px, y: py } = pointerRef.current

      for (const p of particles) {
        if (px !== null && py !== null) {
          const dx = p.x - px
          const dy = p.y - py
          const dist = Math.hypot(dx, dy)
          if (dist < POINTER_RADIUS && dist > 0) {
            const pull = (1 - dist / POINTER_RADIUS) * POINTER_FORCE
            p.vx += (dx / dist) * pull
            p.vy += (dy / dist) * pull
          }
        }

        p.x += p.vx
        p.y += p.vy
        p.vx = p.vx * 0.98 + p.driftVx * 0.02
        p.vy = p.vy * 0.98 + p.driftVy * 0.02

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < LINK_DISTANCE) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(${dotColor}, ${0.15 * (1 - dist / LINK_DISTANCE)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dotColor}, 0.25)`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(step)
    }

    function handlePointerMove(event) {
      pointerRef.current = { x: event.clientX, y: event.clientY }
    }

    function handlePointerLeave() {
      pointerRef.current = { x: null, y: null }
    }

    function handleVisibilityChange() {
      isVisible = document.visibilityState === 'visible'
      if (isVisible && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(step)
      } else if (!isVisible && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    resize()
    animationFrameId = requestAnimationFrame(step)

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [theme.palette.mode])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
