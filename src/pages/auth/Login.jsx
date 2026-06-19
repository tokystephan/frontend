// src/pages/auth/Login.jsx

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";  
import { loginUser, clearError, setUser } from "../../store/slices/authSlice";  
import { getRedirectPath } from "../../utils/roleRedirect";
import toast from "react-hot-toast";

// ============================================================
// CANVAS PARTICULES (fond animé)
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
      const count = Math.min(55, Math.floor((W * H) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W, 
        y: Math.random() * H,
        r: 0.8 + Math.random() * 1.2,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        o: 0.1 + Math.random() * 0.28,
      }));
    };

    const drawLine = (a, b) => {
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 120) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(42,92,142,${0.09 * (1 - d / 120)})`;
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
// COMPOSANT INPUT FIELD
// ============================================================

function InputField({ 
  label, 
  name, 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  onBlur, 
  error, 
  icon,
  showPasswordToggle,
  onTogglePassword,
  showPassword
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-xs font-medium text-[#4A7FAF] uppercase tracking-widest">
          {label}
        </label>
        {name === "password" && (
          <Link
            to="/forgot-password"
            className="text-xs text-[#4A7FAF] hover:text-[#2A5C8E] transition-colors"
          >
            Oublié ?
          </Link>
        )}
      </div>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A7FAF] pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={showPasswordToggle && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          autoComplete={type === "password" ? "current-password" : "email"}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { 
            setFocused(false); 
            onBlur && onBlur(e); 
          }}
          onChange={onChange}
          className={`
            w-full py-3 pr-4 text-sm text-[#333333] placeholder-[#666666]
            bg-white rounded-xl outline-none
            transition-all duration-200
            ${icon ? "pl-10" : "pl-4"}
            ${showPasswordToggle ? "pr-12" : "pr-4"}
            ${error
              ? "border border-[#ef4444]/60 focus:border-[#ef4444]"
              : focused
                ? "border border-[#2A5C8E] ring-2 ring-[#2A5C8E]/20"
                : "border border-[#E0E0E0] hover:border-[#4A7FAF]"
            }
          `}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#2A5C8E] transition-colors p-1"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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

// ============================================================
// VALIDATION LOCALE DU FORMULAIRE
// ============================================================

const validate = (values) => {
  const errors = {};
  const email = (values.email || "").trim();
  const password = (values.password || "").trim();
  
  if (!email) {
    errors.email = "L'adresse email est requise";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
    errors.email = "Format d'email invalide";
  }
  
  if (!password) {
    errors.password = "Le mot de passe est requis";
  } else if (password.length < 6) {
    errors.password = "Minimum 6 caractères";
  }
  
  return errors;
};

// ============================================================
// COMPOSANT PRINCIPAL : Login
// ============================================================

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { loading, error: serverError, isAuthenticated, user } = useAppSelector((s) => s.auth);  

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [departmentWarning, setDepartmentWarning] = useState(null);
  const hasRedirectedRef = useRef(false);

  const cardRef = useRef(null);
  const [cardTilt, setCardTilt] = useState({});

  // Redirection vers le dashboard après authentification
  useEffect(() => {
    if (isAuthenticated && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const redirectPath = getRedirectPath(user);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Nettoyage des erreurs serveur au démontage
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Effacer le warning département quand l'utilisateur modifie l'email
    if (departmentWarning) {
      setDepartmentWarning(null);
    }
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    const fieldErrors = validate(values);
    if (fieldErrors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: fieldErrors[e.target.name] }));
    }
  };

  // ✅ Fonction pour gérer les erreurs spécifiques du backend (403)
  const handleBackendError = (errorData) => {
    const message = errorData?.message || errorData?.error || 'Erreur de connexion';
    const code = errorData?.code;
    const action = errorData?.action;
    
    // Cas spécial: pas de département assigné pour manager
    if (code === 'NO_DEPARTMENT_ASSIGNED' || message.includes('département')) {
      setDepartmentWarning({
        title: '⚠️ Configuration incomplète',
        message: message || 'Aucun département n\'est assigné à votre compte.',
        action: action || 'Veuillez contacter l\'administrateur pour assigner votre département.'
      });
      return toast.error(message, { duration: 5000 });
    }
    
    // Cas spécial: département inexistant
    if (code === 'DEPARTMENT_NOT_FOUND' || message.includes('n\'existe pas')) {
      setDepartmentWarning({
        title: '❌ Erreur de configuration',
        message: message,
        action: action || 'Contactez l\'administrateur pour corriger votre configuration.'
      });
      return toast.error(message, { duration: 5000 });
    }
    
    // Compte désactivé
    if (message.includes('désactivé') || message.includes('désactivé')) {
      toast.error(message, { duration: 5000 });
      return;
    }
    
    // Compte en attente de validation
    if (message.includes('validation') || message.includes('attente')) {
      toast.error(message, { duration: 5000 });
      return;
    }
    
    // Email ou mot de passe incorrect
    if (message.includes('incorrect') || message.includes('Email ou mot de passe')) {
      toast.error('Email ou mot de passe incorrect');
      return;
    }
    
    // Erreur générique
    toast.error(message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    setDepartmentWarning(null);
    
    const formErrors = validate(values);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Veuillez corriger les erreurs");
      return;
    }

    const trimmedValues = {
      email: values.email.trim().toLowerCase(),
      password: values.password.trim()
    };

    hasRedirectedRef.current = false;

    const result = await dispatch(loginUser(trimmedValues));
    
    if (loginUser.fulfilled.match(result)) {
      const firstName = result?.payload?.user?.first_name || '';
      const roleName = result?.payload?.user?.role_name || '';
      const departmentName = result?.payload?.user?.department_name;
      
      // Afficher un message personnalisé selon le rôle
      let welcomeMessage = firstName ? `Bienvenue ${firstName} !` : 'Connexion réussie !';
      
      if (roleName === 'Consultant' && departmentName) {
        welcomeMessage = `Bienvenue ${firstName} ! Vous êtes connecté en tant que Manager du département "${departmentName}".`;
        toast.success(welcomeMessage, { duration: 4000 });
      } else if (roleName === 'Manager' && departmentName) {
        welcomeMessage = `Bienvenue ${firstName} ! Vous êtes connecté en tant que Manager du département "${departmentName}".`;
        toast.success(welcomeMessage, { duration: 4000 });
      } else {
        toast.success(welcomeMessage);
      }
    } else if (loginUser.rejected.match(result)) {
      const errorPayload = result?.payload;
      
      // Gérer l'erreur de manière structurée
      if (errorPayload && typeof errorPayload === 'object') {
        handleBackendError(errorPayload);
      } else if (typeof errorPayload === 'string') {
        // Essayer de parser le JSON si c'est une chaîne
        try {
          const parsed = JSON.parse(errorPayload);
          handleBackendError(parsed);
        } catch {
          toast.error(errorPayload);
        }
      } else {
        toast.error('Erreur de connexion. Veuillez réessayer.');
      }
    }

    hasRedirectedRef.current = loginUser.fulfilled.match(result);
  };

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

  // Backend base URL (strip trailing /api if present)
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

  // Ouvrir une popup pour l'auth Google et écouter le message de retour
  const openGooglePopup = () => {
    setGoogleLoading(true);
    const popup = window.open(`${backendBase}/auth/google/redirect`, 'google_oauth', 'width=540,height=700');
    if (!popup) {
      setGoogleLoading(false);
      toast.error('Impossible d\'ouvrir la fenêtre de connexion. Vérifiez le bloqueur de popups.');
      return;
    }

    const timer = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(timer);
        setGoogleLoading(false);
      }
    }, 500);
  };

  useEffect(() => {
    const onMessage = (e) => {
      try {
        const data = e.data || {};
        if (e.origin !== window.location.origin || data.type !== 'oauth_google_success') return;

        if (data.type === 'oauth_google_success' && data.token && data.user) {
          setGoogleLoading(false);
          hasRedirectedRef.current = false;
          dispatch(setUser({ token: data.token, user: data.user }));
          toast.success(data.user.first_name ? `Bienvenue ${data.user.first_name} !` : 'Connexion réussie !');
        }
      } catch (err) {
        setGoogleLoading(false);
        toast.error('Connexion Google impossible');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [dispatch]);

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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeInUp { animation: fadeInUp 0.55s ease both; }
        .animate-fadeIn   { animation: fadeIn   0.4s ease both; }
        .animate-shake    { animation: shake    0.4s ease both; }
      `}</style>

      <ParticlesCanvas />

      {/* ============================================================
          HEADER
      ============================================================ */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-4 border-b border-[#E0E0E0] bg-white/95 backdrop-blur-md shadow-sm">
        <Link to="/" className="flex items-center gap-3 group">
          <LogoCube3D size={36} />
        </Link>

        <div className="flex items-center gap-2 text-sm text-[#666666]">
          Pas encore de compte ?{" "}
          <Link
            to="/register"
            className="text-[#2A5C8E] hover:text-[#4A7FAF] font-medium transition-colors"
          >
            S'inscrire →
          </Link>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm" style={{ perspective: "1000px" }}>

          <div className="text-center mb-8 animate-fadeInUp">
            <h1 className="text-2xl font-bold text-[#333333] mb-1">Bon retour !</h1>
            <p className="text-[#666666] text-sm">Connectez-vous à votre espace recrutement</p>
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

              {/* ✅ Message d'erreur serveur générique */}
              {serverError && !departmentWarning && (
                <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/25 animate-fadeIn">
                  <svg className="w-4 h-4 text-[#ef4444] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd" />
                  </svg>
                  <p className="text-[#ef4444] text-xs leading-relaxed">{serverError}</p>
                </div>
              )}

              {/* ✅ Message d'avertissement spécifique pour département manquant */}
              {departmentWarning && (
                <div className="mb-5 animate-shake">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">{departmentWarning.title}</p>
                      <p className="text-xs text-amber-700 mt-1">{departmentWarning.message}</p>
                      {departmentWarning.action && (
                        <p className="text-xs text-amber-600 mt-2 font-medium">{departmentWarning.action}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                <InputField
                  label="Adresse email"
                  name="email"
                  type="email"
                  placeholder="vous@entreprise.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email ? errors.email : ""}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <InputField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password ? errors.password : ""}
                  showPasswordToggle={true}
                  showPassword={showPwd}
                  onTogglePassword={() => setShowPwd(!showPwd)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  }
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3 mt-1 bg-[#2A5C8E] hover:bg-[#4A7FAF]
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
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#E0E0E0]" />
                  <span className="text-xs text-[#666666]">ou</span>
                  <div className="flex-1 h-px bg-[#E0E0E0]" />
                </div>

                <button
                  type="button"
                  onClick={openGooglePopup}
                  disabled={loading || googleLoading}
                  className="w-full py-3 mt-1 border border-[#E0E0E0] rounded-xl flex items-center justify-center gap-3 hover:shadow-sm hover:border-[#4A7FAF] transition-colors bg-white"
                >
                  {googleLoading ? (
                    <svg className="w-4 h-4 animate-spin text-[#2A5C8E]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.35 11.1h-9.2v2.9h5.3c-.25 1.44-1.03 2.67-2.2 3.5v2.9h3.55c2.08-1.92 3.28-4.74 3.28-8.3 0-.62-.06-1.22-.18-1.8z" fill="#4285F4"/>
                      <path d="M12.15 22c2.97 0 5.46-1 7.28-2.73l-3.55-2.9c-.98.66-2.24 1.06-3.73 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84C3.99 19.98 7.82 22 12.15 22z" fill="#34A853"/>
                      <path d="M6 13.9c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.0H2.18A9.996 9.996 0 002.15 12c0 1.6.36 3.12 1 4.5L6 13.9z" fill="#FBBC05"/>
                      <path d="M12.15 6.3c1.61 0 3.06.57 4.2 1.69l3.15-3.15C17.6 2.9 15.11 2 12.15 2 7.82 2 3.99 4.02 2.18 7.0l3.82 2.9c.86-2.6 3.28-4.6 6.15-4.6z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span className="text-sm font-medium text-[#333333]">
                    {googleLoading ? 'Connexion Google...' : 'Continuer avec Google'}
                  </span>
                </button>

                <Link
                  to="/register"
                  className="
                    w-full py-3 text-center text-sm font-medium text-[#666666]
                    hover:text-[#2A5C8E] border border-[#E0E0E0] hover:border-[#4A7FAF]
                    rounded-xl transition-all duration-200 hover:bg-[#F5F5F5] block
                  "
                >
                  Créer un compte gratuit
                </Link>
              </form>
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
              <span className="text-[#2A5C8E]">Connexion sécurisée</span>
              {" "}· Chiffrement TLS · Jetons JWT · Conforme RGPD
            </span>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-xs text-[#999999] hover:text-[#2A5C8E] transition-colors">Aide</a>
            <a href="#" className="text-xs text-[#999999] hover:text-[#2A5C8E] transition-colors">Confidentialité</a>
            <a href="#" className="text-xs text-[#999999] hover:text-[#2A5C8E] transition-colors">Contact</a>
          </div>
        </div>

        <p className="text-center text-xs text-[#999999] mt-2">
          © 2025 Akanjo · Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
