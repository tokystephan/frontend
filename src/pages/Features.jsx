import React from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      title: 'Gestion des Candidatures',
      description: 'Centralisez toutes vos candidatures en un seul endroit et suivez leur progression en temps réel.'
    },
    {
      title: 'Planification des Entretiens',
      description: 'Programmez et gérez vos entretiens avec un calendrier intelligent et des notifications automatiques.'
    },
    {
      title: 'Évaluations et Rapports',
      description: 'Créez des évaluations détaillées et générez des rapports pour comparer les candidats.'
    },
    {
      title: 'Collaboration d\'équipe',
      description: 'Travaillez en équipe avec un système de commentaires et de partage d\'informations.'
    },
    {
      title: 'Gestion des Compétences',
      description: 'Enregistrez et suivez les compétences des candidats et des postes disponibles.'
    },
    {
      title: 'Intégrations Avancées',
      description: 'Connectez Akanjo à vos outils existants pour un workflow optimisé.'
    }
  ];

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
              to="/"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Accueil
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-5xl">
            <h1 className="text-4xl font-bold text-center mb-12">Nos Fonctionnalités</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/10 p-6 backdrop-blur-lg border border-white/10 hover:border-blue-500/50 transition-all duration-300"
                >
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/"
                className="inline-block rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
