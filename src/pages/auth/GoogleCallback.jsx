import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { getRedirectPath } from '../../utils/roleRedirect';

// Page minimale que le backend redirige après OAuth.
// Elle lit le token et l'objet user encodés dans le fragment (#) ou la query,
// envoie un message au `window.opener` et se ferme.

function parseHashOrSearch() {
  const result = {};
  // Essayer le hash first (#token=...&user=...)
  const raw = window.location.hash || window.location.search;
  if (!raw) return result;
  const str = raw.replace(/^#|^\?/, '');
  const params = new URLSearchParams(str);
  const token = params.get('token');
  const userRaw = params.get('user');
  if (token) result.token = token;
  if (userRaw) {
    try {
      result.user = JSON.parse(decodeURIComponent(userRaw));
    } catch (e) {
      try { result.user = JSON.parse(userRaw); } catch { result.user = null; }
    }
  }
  return result;
}

export default function GoogleCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const data = parseHashOrSearch();
    if (window.opener && (data.token || data.user)) {
      try {
        window.opener.postMessage({ type: 'oauth_google_success', token: data.token, user: data.user }, '*');
      } catch (err) {
        // ignore
      }
      // Fermer la fenêtre après un petit délai
      setTimeout(() => {
        window.close();
      }, 600);
    } else if (data.token && data.user) {
      dispatch(setUser({ token: data.token, user: data.user }));
      navigate(getRedirectPath(data.user), { replace: true });
    } else {
      // Si pas d'opener (ou pas de données), rediriger vers login
      setTimeout(() => navigate('/login', { replace: true }), 800);
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-6">
        <h2 className="text-lg font-semibold mb-2">Finalisation de la connexion...</h2>
        <p className="text-sm text-gray-600">Vous pouvez fermer cette fenêtre si elle ne se ferme pas automatiquement.</p>
      </div>
    </div>
  );
}
