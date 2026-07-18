// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [activeModal, setActiveModal] = React.useState(null);

  const closeModal = () => setActiveModal(null);

  const renderModal = () => {
    switch (activeModal) {
      case 'about':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-4xl bg-black/90 p-8 border border-white/20 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">À Propos d'Akanjo</h1>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-slate-300">
                <p>
                  Akanjo RH est une plateforme de gestion des ressources humaines conçue pour simplifier vos processus de recrutement et d'évaluation des candidats.
                </p>
                <p>
                  Notre mission est de fournir un outil moderne et intuitif qui permet aux entreprises de gérer efficacement leurs candidatures, entretiens et décisions RH.
                </p>
                <p>
                  Avec Akanjo, vous bénéficiez d'une solution complète pour centraliser vos données, collaborer en équipe et prendre les meilleures décisions de recrutement.
                </p>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-4xl bg-black/90 p-8 border border-white/20 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Nos Fonctionnalités</h1>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { title: 'Gestion des Candidatures', desc: 'Centralisez toutes vos candidatures en un seul endroit.' },
                  { title: 'Planification des Entretiens', desc: 'Programmez et gérez vos entretiens avec un calendrier intelligent.' },
                  { title: 'Évaluations et Rapports', desc: 'Créez des évaluations détaillées et générez des rapports.' },
                  { title: 'Collaboration d\'équipe', desc: 'Travaillez en équipe avec un système de commentaires.' },
                  { title: 'Gestion des Compétences', desc: 'Enregistrez et suivez les compétences des candidats.' },
                  { title: 'Intégrations Avancées', desc: 'Connectez Akanjo à vos outils existants.' }
                ].map((feature, idx) => (
                  <div key={idx} className="rounded-lg bg-white/10 p-4 border border-white/10">
                    <h3 className="font-semibold text-blue-400 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-300">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl rounded-4xl bg-black/90 p-8 border border-white/20 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Contactez-nous</h1>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message envoyé !'); closeModal(); }} className="space-y-4">
                <div>
                  <input type="text" placeholder="Votre nom" className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400" required />
                </div>
                <div>
                  <input type="email" placeholder="Votre email" className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400" required />
                </div>
                <div>
                  <input type="text" placeholder="Sujet" className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400" required />
                </div>
                <div>
                  <textarea placeholder="Votre message..." rows="4" className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400" required />
                </div>
                <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        );

      case 'terms':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-4xl bg-black/90 p-8 border border-white/20 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Conditions d'Utilisation</h1>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-slate-300">
                <section>
                  <h2 className="text-lg font-semibold text-blue-400 mb-2">1. Acceptation des Conditions</h2>
                  <p>En accédant à Akanjo RH, vous acceptez de respecter ces conditions d'utilisation.</p>
                </section>
                <section>
                  <h2 className="text-lg font-semibold text-blue-400 mb-2">2. Utilisation du Service</h2>
                  <p>Vous acceptez d'utiliser ce service uniquement à des fins légales.</p>
                </section>
                <section>
                  <h2 className="text-lg font-semibold text-blue-400 mb-2">3. Propriété Intellectuelle</h2>
                  <p>Le contenu du site est protégé par les droits d'auteur.</p>
                </section>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-4xl bg-black/90 p-8 border border-white/20 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Politique de Confidentialité</h1>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 text-slate-300">
                <section>
                  <h2 className="text-lg font-semibold text-blue-400 mb-2">1. Collecte d'Informations</h2>
                  <p>Nous collectons les informations que vous nous fournissez volontairement.</p>
                </section>
                <section>
                  <h2 className="text-lg font-semibold text-blue-400 mb-2">2. Utilisation des Données</h2>
                  <p>Vos données sont utilisées pour améliorer nos services.</p>
                </section>
                <section>
                  <h2 className="text-lg font-semibold text-blue-400 mb-2">3. Protection des Données</h2>
                  <p>Nous mettons en œuvre des mesures de sécurité appropriées.</p>
                </section>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/back.jpeg"
      >
        <source src="/bg akanjo.mp4" type="video/mp4" />
        Votre navigateur ne prend pas en charge la lecture vidéo.
      </video>

      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <img
              src="/akanjo.jpg"
              alt=""
              className="h-13 w-auto object-contain cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="flex min-w-35 items-center justify-center rounded-xl bg-[#0f172a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#111827]"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="flex min-w-35 items-center justify-center rounded-xl border-2 border-[#0f172a] bg-[#83aab3] px-5 py-2.5 text-black font-bold text-[#0f172a] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#94b8c4]"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl rounded-4xl bg-linear-to-br from-white/20 via-white/10 to-transparent p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10 lg:p-12">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
              Akanjo RH
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Gérez vos recrutements avec simplicité
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm text-slate-200 sm:text-base">
              Découvrez un espace moderne pour piloter vos candidatures, vos entretiens et vos décisions RH.
            </p>
          </div>
        </div>

        <footer className="mt-auto border-t border-white/10 rounded-2xl bg-black/40 px-6 py-6 backdrop-blur-lg">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="mb-4 font-semibold text-white">Akanjo RH</h3>
                <p className="text-sm text-slate-300">
                  Une plateforme moderne pour gérer vos recrutements avec simplicité et efficacité.
                </p>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-white">Liens</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><button onClick={() => setActiveModal('about')} className="hover:text-white transition cursor-pointer">À propos</button></li>
                  <li><button onClick={() => setActiveModal('features')} className="hover:text-white transition cursor-pointer">Fonctionnalités</button></li>
                  <li><button onClick={() => setActiveModal('contact')} className="hover:text-white transition cursor-pointer">Contact</button></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold text-white">Légal</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li><button onClick={() => setActiveModal('terms')} className="hover:text-white transition cursor-pointer">Conditions d&apos;utilisation</button></li>
                  <li><button onClick={() => setActiveModal('privacy')} className="hover:text-white transition cursor-pointer">Politique de confidentialité</button></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
              <p>&copy; 2024 Akanjo RH. Tous droits réservés.</p>
            </div>
          </div>
        </footer>

        {/* Modal */}
        {renderModal()}
      </div>
    </div>
  );
};

export default Home;