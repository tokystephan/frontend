const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-[var(--app-border)] bg-[var(--app-surface)] px-6 py-3 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-indicator)] animate-pulse" />
          <span className="text-xs text-[var(--app-text-soft)]">
            <span className="text-[var(--app-primary)]">Système opérationnel</span>
            {" "}· Chiffrement TLS · Jetons JWT · Conforme RGPD
          </span>
        </div>

        <div className="flex gap-4">
          <a href="#" className="text-xs text-[var(--app-text-soft)] hover:text-[var(--app-primary)] transition-colors">Aide</a>
          <a href="#" className="text-xs text-[var(--app-text-soft)] hover:text-[var(--app-primary)] transition-colors">Confidentialité</a>
          <a href="#" className="text-xs text-[var(--app-text-soft)] hover:text-[var(--app-primary)] transition-colors">Contact</a>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--app-text-soft)] mt-2">
        © {new Date().getFullYear()} Akanjo · Tous droits réservés
      </p>
    </footer>
  )
}

export default Footer
