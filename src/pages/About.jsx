import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
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

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-3xl rounded-4xl bg-linear-to-br from-white/20 via-white/10 to-transparent p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10 lg:p-12">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6">
              À Propos d'Akanjo
            </h1>
            <div className="text-left space-y-6 text-slate-200">
              <p>
                Akanjo RH est une plateforme de gestion des ressources humaines conçue pour simplifier vos processus de recrutement et d'évaluation des candidats.
              </p>
              <p>
                Notre mission est de fournir un outil moderne et intuitif qui permet aux entreprises de gérer efficacement leurs candidatures, entretiens et décisions RH.
              </p>
              <p>
                Avec Akanjo, vous bénéficiez d'une solution complète pour centraliser vos données, collaborer en équipe et prendre les meilleures décisions de recrutement.
              </p>
              <div className="pt-6">
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
    </div>
  );
};

export default About;
