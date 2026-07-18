import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulaire envoyé:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
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
          <div className="w-full max-w-2xl">
            <h1 className="text-4xl font-bold text-center mb-8">Contactez-nous</h1>
            
            <form
              onSubmit={handleSubmit}
              className="rounded-4xl bg-white/10 p-8 backdrop-blur-lg border border-white/10"
            >
              {submitted && (
                <div className="mb-6 rounded-lg bg-green-500/20 border border-green-500/50 p-4 text-green-300">
                  ✓ Message envoyé avec succès!
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Votre nom"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Sujet</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Sujet de votre message"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full rounded-lg bg-white/10 px-4 py-2 border border-white/20 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  placeholder="Votre message..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              >
                Envoyer le message
              </button>
            </form>

            <div className="text-center mt-8">
              <Link
                to="/"
                className="inline-block rounded-xl bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
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

export default Contact;
