import { format, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return format(new Date(dateStr), 'dd MMMM yyyy à HH\'h\'mm', { locale: fr });
};

export const getDuration = (start, end) => {
  if (!start || !end) return '';
  const minutes = differenceInMinutes(new Date(end), new Date(start));
  return `${minutes} min`;
};

export const getTypeLabel = (type) => {
  const map = { telephonique: 'Téléphonique', rh: 'RH', technique: 'Technique', final: 'Final' };
  return map[type] || type;
};

export const getLocationLabel = (locationType, location, meetingLink, phone) => {
  if (locationType === 'visio') return 'Google Meet';
  if (locationType === 'presentiel') return `Présentiel — ${location || 'Salle'}`;
  return `Téléphone : ${phone || location || ''}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const getStatusBadge = (status) => {
  const map = {
    planifie: { label: 'Planifié', color: 'bg-blue-100 text-blue-800' },
    confirme: { label: 'Confirmé', color: 'bg-purple-100 text-purple-800' },
    realise: { label: 'Réalisé', color: 'bg-green-100 text-green-800' },
    termine: { label: 'Terminé', color: 'bg-green-100 text-green-800' },
    annule: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
    reporte: { label: 'Reporté', color: 'bg-orange-100 text-orange-800' },
  };
  return map[status] || { label: status, color: 'bg-gray-100' };
};

export const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return 'à l\'instant';
    if (minutes < 60) return `il y a ${minutes} min`;
    if (hours < 24) return `il y a ${hours} h`;
    if (days < 7) return `il y a ${days} j`;
    if (weeks < 4) return `il y a ${weeks} sem`;
    return `il y a ${Math.floor(days / 30)} mois`;
};