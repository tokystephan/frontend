import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfUse = () => {
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

        <div className="flex flex-1 items-center justify-center overflow-y-auto py-12">
          <div className="w-full max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Conditions d'Utilisation</h1>
            
            <div className="rounded-4xl bg-white/10 p-8 backdrop-blur-lg border border-white/10 space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">1. Acceptation des Conditions</h2>
                <p className="text-slate-300">
                  En accédant à Akanjo RH, vous acceptez de respecter ces conditions d'utilisation et toutes les lois et réglementations applicables.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">2. Utilisation du Service</h2>
                <p className="text-slate-300">
                  Vous acceptez d'utiliser ce service uniquement à des fins légales et de ne pas l'utiliser pour du contenu offensant, diffamatoire ou contraire à la loi.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">3. Propriété Intellectuelle</h2>
                <p className="text-slate-300">
                  Le contenu, les fonctionnalités et la conception du site sont protégés par les droits d'auteur et autres lois de protection intellectuelle.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">4. Limitation de Responsabilité</h2>
                <p className="text-slate-300">
                  Akanjo RH ne sera pas responsable des dommages indirects, accidentels ou consécutifs découlant de votre utilisation du service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">5. Modifications</h2>
                <p className="text-slate-300">
                  Akanjo RH se réserve le droit de modifier ces conditions à tout moment. Les modifications seront effectives immédiatement après publication.
                </p>
              </section>
            </div>

            <div className="text-center mt-8">
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

export default TermsOfUse;
