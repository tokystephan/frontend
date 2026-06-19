// src/pages/auth/Register.jsx

import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import InputField from '../../components/Forms/InputField'
import useAuth from '../../hooks/useAuth'
import { registerSchema } from '../../utils/validations'

// ============================================================
// CANVAS PARTICULES
// ============================================================

function ParticlesCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H, particles = [];

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initParticles();
    };

    const initParticles = () => {
      const count = Math.min(60, Math.floor((W * H) / 20000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W, 
        y: Math.random() * H,
        r: 0.8 + Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        o: 0.08 + Math.random() * 0.2,
      }));
    };

    const drawLine = (a, b) => {
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 120) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(42,92,142,${0.08 * (1 - d / 120)})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; 
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; 
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(42,92,142,${p.o})`;
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++)
          drawLine(particles[i], particles[j]);
      animId = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener("resize", resize);
    return () => { 
      cancelAnimationFrame(animId); 
      window.removeEventListener("resize", resize); 
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ============================================================
// COMPOSANT CUBE 3D (logo)
// ============================================================

function LogoCube3D({ size = 36 }) {
  const s = size;
  const half = s / 2;
  const faceStyle = (transform, bgOpacity = 0.15) => ({
    position: "absolute", 
    width: s, 
    height: s,
    border: "1.5px solid rgba(42,92,142,0.65)", 
    background: `rgba(42,92,142,${bgOpacity})`,
    transform,
  });

  return (
    <div style={{ width: s, height: s, perspective: s * 4 }}>
      <div
        style={{
          width: s, 
          height: s, 
          position: "relative",
          transformStyle: "preserve-3d",
          animation: "cubeSpin 12s linear infinite",
          transform: "rotateX(22deg) rotateY(0deg)",
        }}
      >
        <div style={faceStyle(`translateZ(${half}px)`, 0.25)} />
        <div style={faceStyle(`rotateY(180deg) translateZ(${half}px)`, 0.1)} />
        <div style={faceStyle(`rotateY(-90deg) translateZ(${half}px)`, 0.15)} />
        <div style={faceStyle(`rotateY(90deg) translateZ(${half}px)`, 0.15)} />
        <div style={faceStyle(`rotateX(90deg) translateZ(${half}px)`, 0.2)} />
        <div style={faceStyle(`rotateX(-90deg) translateZ(${half}px)`, 0.08)} />
      </div>
    </div>
  );
}

// ============================================================
// COMPOSANT INPUT FIELD PERSONNALISÉ
// ============================================================

function CustomInputField({ 
  label, 
  name, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  icon
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-[#4A7FAF] uppercase tracking-widest">
        {label} {required && <span className="text-[#ef4444]">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7FAF] pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={onChange}
          className={`
            w-full py-3 pr-4 text-sm text-[#333333] placeholder-[#666666]
            bg-white rounded-xl outline-none
            transition-all duration-200
            ${icon ? "pl-10" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            ${error
              ? "border border-[#ef4444]/60 focus:border-[#ef4444]"
              : focused
                ? "border border-[#2A5C8E] ring-2 ring-[#2A5C8E]/20"
                : "border border-[#E0E0E0] hover:border-[#4A7FAF]"
            }
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#2A5C8E] transition-colors p-1"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-[#ef4444] flex items-center gap-1.5 animate-fadeIn">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

const initialForm = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role_name: 'assistant',
}

// ============================================================
// COMPOSANT PRINCIPAL : Register
// ============================================================

const Register = () => {
  const navigate = useNavigate()
  const { register, loading, error, successMessage, clearError, clearMessage } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [validationErrors, setValidationErrors] = useState({})
  const lastRegisterSuccessRef = useRef(false);

  const cardRef = useRef(null);
  const [cardTilt, setCardTilt] = useState({});

  // Affichage des erreurs
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // Redirection après inscription
  useEffect(() => {
    if (successMessage && !lastRegisterSuccessRef.current) {
      lastRegisterSuccessRef.current = true;
      toast.success(successMessage)
      clearMessage()
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    }
  }, [successMessage, navigate, clearMessage])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const parsed = registerSchema.safeParse({
      ...form,
      role_name: form.role_name
    })
    
    if (!parsed.success) {
      const errors = {}
      if (parsed.error && parsed.error.errors) {
        parsed.error.errors.forEach(err => {
          const path = err.path && err.path[0] ? err.path[0] : 'general'
          errors[path] = err.message
        })
      }
      setValidationErrors(errors)
      
      const firstError = (parsed.error && parsed.error.errors && parsed.error.errors[0]?.message) || 'Formulaire invalide'
      toast.error(firstError)
      return
    }

    setValidationErrors({})
    lastRegisterSuccessRef.current = false;
    await register(parsed.data)
  }

  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ 
      transform: `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)` 
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ transform: "rotateY(-2deg) rotateX(1deg)" });
  };

  // Icônes pour les champs
  const userIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const emailIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const lockIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative flex flex-col font-['Inter',system-ui,sans-serif]">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes cubeSpin {
          from { transform: rotateX(22deg) rotateY(0deg); }
          to   { transform: rotateX(22deg) rotateY(360deg); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        
        .animate-fadeInUp { animation: fadeInUp 0.55s ease both; }
        .animate-fadeIn   { animation: fadeIn   0.4s ease both; }
      `}</style>

      <ParticlesCanvas />

      {/* ============================================================
          HEADER
      ============================================================ */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#E0E0E0] bg-white/95 backdrop-blur-md shadow-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <LogoCube3D size={36} />
          <div className="flex flex-col leading-tight">
            <span className="text-[#2A5C8E] font-semibold text-base tracking-tight group-hover:text-[#4A7FAF] transition-colors">
              Akanjo
            </span>
            <span className="text-[#4A7FAF] text-[9px] uppercase tracking-widest">
              Gestion des candidatures
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 text-sm text-[#666666]">
          Déjà inscrit ?{" "}
          <Link
            to="/login"
            className="text-[#2A5C8E] hover:text-[#4A7FAF] font-medium transition-colors"
          >
            Se connecter →
          </Link>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl" style={{ perspective: "1000px" }}>

          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-2xl font-bold text-[#333333] mb-1">Créer un compte</h1>
            <p className="text-[#666666] text-sm">Rejoignez la plateforme de recrutement</p>
          </div>

          {/* ============================================================
              CARTE 3D
          ============================================================ */}
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="animate-fadeInUp"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateY(-2deg) rotateX(1deg)",
              transition: "transform 0.2s ease",
              animationDelay: "80ms",
              ...cardTilt,
            }}
          >
            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 relative overflow-hidden shadow-lg">

              {/* Barre décorative */}
              <div className="absolute top-0 left-8 right-8 h-0.5 bg-[#2A5C8E] rounded-b-full" />

              {/* Message d'erreur serveur */}
              {error && (
                <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/25 animate-fadeIn">
                  <svg className="w-4 h-4 text-[#ef4444] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd" />
                  </svg>
                  <p className="text-[#ef4444] text-xs leading-relaxed">{error}</p>
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Nom d'utilisateur */}
                <div>
                  <CustomInputField
                    label="Nom d'utilisateur"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="ex: john.doe"
                    required
                    icon={userIcon}
                  />
                  {validationErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <CustomInputField
                    label="Email professionnel"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@entreprise.com"
                    required
                    icon={emailIcon}
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                  )}
                </div>

                {/* Prénom et Nom */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <CustomInputField
                      label="Prénom"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="ex: John"
                      required
                      icon={userIcon}
                    />
                    {validationErrors.first_name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <CustomInputField
                      label="Nom"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="ex: Doe"
                      required
                      icon={userIcon}
                    />
                    {validationErrors.last_name && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-xs font-medium text-[#4A7FAF] uppercase tracking-widest mb-1.5">
                    Rôle <span className="text-[#ef4444]">*</span>
                  </label>
                  <select
                    name="role_name"
                    value={form.role_name}
                    onChange={handleChange}
                    className="w-full py-3 px-4 text-sm text-[#333333] bg-white border border-[#E0E0E0] rounded-xl outline-none transition-all duration-200 focus:border-[#2A5C8E] focus:ring-2 focus:ring-[#2A5C8E]/20 hover:border-[#4A7FAF]"
                    required
                  >
                    <option value="assistant">Assistant RH</option>
                    <option value="manager">Manager</option>
                    <option value="direction">Direction</option>
                  </select>
                  {validationErrors.role_name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.role_name}</p>
                  )}
                </div>

                {/* Mot de passe et confirmation */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <CustomInputField
                      label="Mot de passe"
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      icon={lockIcon}
                    />
                    {validationErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>
                  <div>
                    <CustomInputField
                      label="Confirmer"
                      name="password_confirmation"
                      type="password"
                      value={form.password_confirmation}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      icon={lockIcon}
                    />
                    {validationErrors.password_confirmation && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.password_confirmation}</p>
                    )}
                  </div>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3 mt-4 bg-[#2A5C8E] hover:bg-[#4A7FAF]
                    text-white font-semibold text-sm rounded-xl
                    transition-all duration-200
                    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#2A5C8E]/30
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                    flex items-center justify-center gap-2
                  "
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {loading ? "Inscription en cours..." : "Créer mon compte"}
                </button>
              </form>

              {/* Lien vers la connexion */}
              <p className="mt-6 text-center text-sm text-[#666666]">
                Déjà inscrit ?{' '}
                <Link to="/login" className="font-semibold text-[#2A5C8E] hover:text-[#4A7FAF] transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[#999999] mt-5">
            <Link to="/" className="hover:text-[#2A5C8E] transition-colors">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="relative z-10 border-t border-[#E0E0E0] bg-white px-6 py-3 mt-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-[#666666]">
              <span className="text-[#2A5C8E]">Inscription sécurisée</span>
              {" "}· Données chiffrées · Conforme RGPD
            </span>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-xs text-[#999999] hover:text-[#2A5C8E] transition-colors">Aide</a>
            <a href="#" className="text-xs text-[#999999] hover:text-[#2A5C8E] transition-colors">Confidentialité</a>
            <a href="#" className="text-xs text-[#999999] hover:text-[#2A5C8E] transition-colors">CGU</a>
          </div>
        </div>

        <p className="text-center text-xs text-[#999999] mt-2">
          © 2025 Akanjo · Tous droits réservés
        </p>
      </footer>
    </div>
  )
}

export default Register
