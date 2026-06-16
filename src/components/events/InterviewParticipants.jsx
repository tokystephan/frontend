import { getInitials } from '../../utils/dateHelpers';

export default function InterviewParticipants({ participants }) {
  if (!participants?.length) return <p className="text-gray-500">Aucun participant</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {participants.map(p => {
        const userName = p.user?.full_name || p.user?.name || `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim();
        return (
          <div key={p.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm">
            <span className="font-semibold">{getInitials(userName)}</span>
            <span>{userName || 'Utilisateur'}</span>
            {p.is_organizer && <span className="text-xs text-blue-600">(Organisateur)</span>}
          </div>
        );
      })}
    </div>
  );
}