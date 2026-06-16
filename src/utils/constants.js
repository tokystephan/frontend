export const ROLES = {
  ADMIN: 'admin',
  ASSISTANT: 'assistant',
  CONSULTANT: 'consultant',
  MANAGER: 'manager',
  DIRECTION: 'direction',
}

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Responsable RH',
  [ROLES.ASSISTANT]: 'Assistant RH',
  [ROLES.CONSULTANT]: 'Consultant',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.DIRECTION]: 'Direction',
}

export const APPLICATION_STATUSES = [
  'recue',
  'en_cours',
  'entretien_rh',
  'entretien_technique',
  'acceptee',
  'refusee',
]

export const APPLICATION_STATUS_LABELS = {
  recue: 'Reçue',
  en_cours: 'En cours',
  entretien_rh: 'Entretien RH',
  entretien_technique: 'Entretien technique',
  acceptee: 'Acceptée',
  refusee: 'Refusée',
}

export const POST_STATUSES = ['ouvert', 'ferme', 'en_attente', 'archive']

export const POST_STATUS_LABELS = {
  ouvert: 'Ouvert',
  ferme: 'Fermé',
  en_attente: 'En attente',
  archive: 'Archivé',
}

export const CONTRACT_TYPES = ['stage', 'CDD', 'CDI']

export const SOURCES = ['email', 'cooptation', 'job_board', 'site_carriere', 'autre']

export const SOURCE_LABELS = {
  email: 'Email',
  cooptation: 'Cooptation',
  job_board: 'Job board',
  site_carriere: 'Site carrière',
  autre: 'Autre',
}

export const DEFAULT_PAGE_SIZE = 8
