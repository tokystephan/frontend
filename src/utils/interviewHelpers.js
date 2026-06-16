import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateStr) => {
  return format(new Date(dateStr), 'dd MMMM yyyy à HH\'h\'mm', { locale: fr });
};

export const formatDuration = (start, end) => {
  const minutes = differenceInMinutes(new Date(end), new Date(start));
  return `${minutes} min`;
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'planifie': return { label: 'Planifié', color: 'bg-blue-100 text-blue-800' };
    case 'realise':  return { label: 'Réalisé',  color: 'bg-green-100 text-green-800' };
    case 'annule':   return { label: 'Annulé',   color: 'bg-red-100 text-red-800' };
    default: return { label: status, color: 'bg-gray-100' };
  }
};

export const getLocationLabel = (type, location) => {
  if (type === 'visio') return 'Google Meet';
  if (type === 'presentiel') return `Présentiel — ${location || 'Salle'}`;
  return 'Téléphone';
};

export const getInitials = (fullName) => {
  if (!fullName) return '?';
  return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getTypeLabel = (type) => {
  const map = {
    telephonique: 'Téléphonique',
    rh: 'Entretien RH',
    technique: 'Technique',
    metier: 'Métier',
    final: 'Final',
    comite: 'Comité',
    autre: 'Autre',
  };
  return map[type] || type;
};
