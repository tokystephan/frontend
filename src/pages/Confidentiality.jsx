import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
            
            <div className="rounded-4xl bg-white/10 p-8 backdrop-blur-lg border border-white/10 space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">1. Collecte d'Informations</h2>
                <p className="text-slate-300">
                  Nous collectons les informations que vous nous fournissez volontairement, ainsi que certaines informations automatiquement lors de votre visite.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">2. Utilisation des Données</h2>
                <p className="text-slate-300">
                  Vos données sont utilisées pour améliorer nos services, personnaliser votre expérience et communiquer avec vous concernant nos services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">3. Protection des Données</h2>
                <p className="text-slate-300">
                  Nous mettez en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé et la divulgation.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">4. Cookies</h2>
                <p className="text-slate-300">
                  Nous utilisons des cookies pour amélorer votre expérience utilisateur. Vous pouvez configurer votre navigateur pour refuser les cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">5. Droits de l'Utilisateur</h2>
                <p className="text-slate-300">
                  Vous avez le droit d'accéder, de corriger ou de supprimer vos données personnelles. Contactez-nous pour exercer ces droits.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-blue-400">6. Contact</h2>
                <p className="text-slate-300">
                  Pour toute question concernant notre politique de confidentialité, veuillez nous contacter via notre formulaire de contact.
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

export default PrivacyPolicy;
