// src/pages/profile/Profile.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../store/hooks";
import { ROLE_LABELS } from "../../utils/constants";
import { getFullName } from "../../utils/helpers";
import { updateUserProfile } from "../../store/slices/authSlice";
import { uploadAvatarApi } from "../../api/userApi";
import Avatar from "../../components/Common/Avatar";
import toast from "react-hot-toast";
import { Upload, X, User, Mail, Phone, Calendar, Building2, Shield, Home } from "lucide-react";

// -----------------------------------------------------------
// COMPOSANT CARTE D'INFORMATION
// -----------------------------------------------------------

const InfoCard = ({ icon: Icon, label, value, className = "" }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-base font-semibold text-gray-900 break-words">
            {value || <span className="text-gray-400 italic">Non renseigné</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------
// COMPOSANT PRINCIPAL : Profile
// -----------------------------------------------------------

export default function Profile() {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Format de fichier non valide. Utilisez JPEG ou PNG.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    await uploadAvatar(file);

    // Reset file input
    event.target.value = '';
  };

  const uploadAvatar = async (file) => {
    setUploading(true);
    setUploadError(null);
    try {
      const data = await uploadAvatarApi(file);
      if (data.data) {
        dispatch(updateUserProfile(data.data));
        toast.success('Avatar mis à jour avec succès!');
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);

      if (!error.response) {
        setUploadError('Impossible de se connecter au serveur.');
        toast.error('Erreur de connexion au serveur');
      } else if (error.response.status === 422) {
        setUploadError('Format d\'image non valide. Utilisez JPG ou PNG.');
        toast.error('Format d\'image non valide');
      } else if (error.response.status === 401) {
        setUploadError('Session expirée. Veuillez vous reconnecter.');
        toast.error('Session expirée');
      } else {
        setUploadError('Erreur lors du téléchargement de l\'avatar');
        toast.error('Erreur lors du téléchargement');
      }
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    setUploadError(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">
        
        {/* ==================== EN-TÊTE ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Mon profil</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Profil utilisateur</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez vos informations personnelles et votre avatar
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              <Home className="w-4 h-4" />
              Retour au Dashboard
            </Link>
          </div>
        </div>

        {/* ==================== SECTION AVATAR ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />

              {/* Avatar with upload overlay */}
              <div
                onClick={handleAvatarClick}
                role="button"
                tabIndex={0}
                className={`relative cursor-pointer group ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Avatar user={previewUrl ? { ...user, profile_image: previewUrl } : user} size="xl" />
                
                {/* Upload overlay */}
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Loading indicator */}
              {uploading && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                </div>
              )}

              {/* Clear preview button */}
              {previewUrl && (
                <button
                  onClick={clearPreview}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition"
                  title="Annuler"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Cliquez sur l'avatar pour le modifier (JPG, PNG, max 5MB)
            </p>

            {uploadError && (
              <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{uploadError}</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ==================== INFORMATIONS PERSONNELLES ==================== */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <InfoCard
            icon={User}
            label="Nom complet"
            value={getFullName(user)}
          />
          <InfoCard
            icon={Mail}
            label="Adresse email"
            value={user?.email}
          />
          <InfoCard
            icon={Shield}
            label="Rôle"
            value={ROLE_LABELS[user?.role?.name] || user?.role?.name}
          />
          <InfoCard
            icon={Building2}
            label="Département"
            value={user?.department?.name || user?.department || '-'}
          />
        </div>

        {/* ==================== INFORMATIONS COMPLÉMENTAIRES ==================== */}
        {(user?.phone || user?.created_at) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              Informations complémentaires
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {user?.phone && (
                <InfoCard
                  icon={Phone}
                  label="Téléphone"
                  value={user.phone}
                />
              )}
              {user?.created_at && (
                <InfoCard
                  icon={Calendar}
                  label="Membre depuis"
                  value={formatDate(user.created_at)}
                />
              )}
            </div>
          </div>
        )}

        {/* ==================== STATISTIQUES (simulées) ==================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Aperçu rapide
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">--</div>
              <div className="text-sm text-gray-500">Candidatures traitées</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">--</div>
              <div className="text-sm text-gray-500">Entretiens réalisés</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">--</div>
              <div className="text-sm text-gray-500">Taux de conversion</div>
            </div>
          </div>
        </div>

        {/* ==================== NOTES DE SÉCURITÉ ==================== */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Système opérationnel - Chiffrement TLS - Jetons JWT - Conforme RGPD</p>
          <p className="mt-1">© 2026 Akanjo - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}