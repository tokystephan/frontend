import { useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { toggleSidebar } from '../../store/slices/uiSlice'
import Footer from './Footer'
import Header from './Header'
import Sidebar from './Sidebar'

const DashboardParticles = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const context = canvas.getContext('2d')
    let animationId
    let width = 0
    let height = 0
    let particles = []

    const createParticles = () => {
      const count = Math.min(80, Math.floor((width * height) / 22000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.7 + Math.random() * 1.5,
        velocityX: (Math.random() - 0.5) * 0.35,
        velocityY: (Math.random() - 0.5) * 0.35,
        opacity: 0.1 + Math.random() * 0.28,
      }))
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      createParticles()
    }

    const linkParticles = (first, second) => {
      const dx = first.x - second.x
      const dy = first.y - second.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance > 130) return

      context.beginPath()
      context.moveTo(first.x, first.y)
      context.lineTo(second.x, second.y)
      context.strokeStyle = `rgba(42,92,142,${0.08 * (1 - distance / 130)})`
      context.lineWidth = 0.5
      context.stroke()
    }

    const animate = () => {
      context.clearRect(0, 0, width, height)

      for (const particle of particles) {
        particle.x += particle.velocityX
        particle.y += particle.velocityY

        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        context.beginPath()
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fillStyle = `rgba(42,92,142,${particle.opacity})`
        context.fill()
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          linkParticles(particles[i], particles[j])
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}

const AppLayout = ({ children }) => {
  const dispatch = useAppDispatch()

  const handleMenuClick = () => {
    dispatch(toggleSidebar())
  }

  const content = children ?? <Outlet />

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--app-bg)]">
      <style>{`
        @keyframes dashboardFloatOne {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(14px, -16px, 0) scale(1.04); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes dashboardFloatTwo {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-20px, 10px, 0) scale(1.05); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        .dashboard-float-one { animation: dashboardFloatOne 12s ease-in-out infinite; }
        .dashboard-float-two { animation: dashboardFloatTwo 15s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(42,92,142,0.05),transparent_38%),radial-gradient(circle_at_85%_78%,rgba(42,92,142,0.08),transparent_35%),linear-gradient(180deg,var(--app-bg)_0%,var(--app-bg-soft)_45%,var(--app-bg)_100%)]" />
        <div className="absolute inset-0 opacity-10 [background-size:40px_40px] [background-image:linear-gradient(rgba(42,92,142,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(42,92,142,0.35)_1px,transparent_1px)]" />
        <div className="dashboard-float-one absolute -left-16 top-28 h-56 w-56 rounded-full bg-[rgba(42,92,142,0.08)] blur-3xl" />
        <div className="dashboard-float-two absolute right-8 top-40 h-64 w-64 rounded-full bg-[rgba(42,92,142,0.06)] blur-3xl" />
        <div className="dashboard-float-two absolute bottom-20 left-1/3 h-52 w-52 rounded-full bg-[rgba(42,92,142,0.06)] blur-3xl" />
        <DashboardParticles />
      </div>

      <div className="relative z-10">
        <Header onMenuClick={handleMenuClick} />
        <div className="mx-auto flex w-full max-w-full flex-col gap-3 px-2 pb-3 pt-19 sm:gap-4 sm:px-4 sm:pb-4 sm:pt-20 md:flex-row md:items-start">
          <div className="md:flex-shrink-0">
            <Sidebar />
          </div>
          <main className="w-full min-w-0 flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-3 shadow-lg card-3d sm:p-5">
            {content}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  )
}

export default AppLayout
