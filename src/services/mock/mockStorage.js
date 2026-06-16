import { APPLICATION_STATUSES } from '../../utils/constants'

const STORAGE_KEY = 'gestion_candidatures_mock_v1'

const nowIso = () => new Date().toISOString()

const initialDb = {
  posts: [
    {
      id: 1,
      title: 'Développeur Full Stack',
      department: 'IT',
      contract_type: 'CDI',
      status: 'ouvert',
      description: 'Développement et maintenance des applications internes.',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: 2,
      title: 'Assistant RH',
      department: 'Ressources Humaines',
      contract_type: 'CDD',
      status: 'ouvert',
      description: 'Support opérationnel recrutement et administration RH.',
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ],
  candidates: [
    {
      id: 1,
      first_name: 'Aina',
      last_name: 'Rakoto',
      email: 'aina.rakoto@example.com',
      phone: '+261340000001',
      source: 'job_board',
      documents: ['CV_Aina_Rakoto.pdf'],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: 2,
      first_name: 'Miora',
      last_name: 'Randria',
      email: 'miora.randria@example.com',
      phone: '+261340000002',
      source: 'cooptation',
      documents: ['CV_Miora_Randria.pdf', 'Lettre_Motivation_Miora.pdf'],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ],
  applications: [
    {
      id: 1,
      candidate_id: 1,
      post_id: 1,
      status: 'en_cours',
      assigned_to: 'Responsable RH',
      comments: [
        {
          id: 1,
          author: 'Admin RH',
          content: 'Profil intéressant, à contacter rapidement.',
          created_at: nowIso(),
        },
      ],
      history: [
        {
          id: 1,
          previous_status: null,
          new_status: 'recue',
          changed_by: 'Système',
          note: 'Création de candidature',
          changed_at: nowIso(),
        },
        {
          id: 2,
          previous_status: 'recue',
          new_status: 'en_cours',
          changed_by: 'Admin RH',
          note: 'Dossier en cours de traitement',
          changed_at: nowIso(),
        },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
    {
      id: 2,
      candidate_id: 2,
      post_id: 2,
      status: 'entretien_rh',
      assigned_to: 'Assistant RH',
      comments: [],
      history: [
        {
          id: 1,
          previous_status: null,
          new_status: 'recue',
          changed_by: 'Système',
          note: 'Création de candidature',
          changed_at: nowIso(),
        },
        {
          id: 2,
          previous_status: 'recue',
          new_status: 'entretien_rh',
          changed_by: 'Assistant RH',
          note: 'Entretien RH planifié',
          changed_at: nowIso(),
        },
      ],
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ],
}

const isValidStatus = (status) => APPLICATION_STATUSES.includes(status)

const clone = (value) => JSON.parse(JSON.stringify(value))

export const loadDb = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb))
      return clone(initialDb)
    }

    const parsed = JSON.parse(raw)
    if (!parsed.posts || !parsed.candidates || !parsed.applications) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb))
      return clone(initialDb)
    }

    return parsed
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDb))
    return clone(initialDb)
  }
}

export const saveDb = (db) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  return db
}

export const nextId = (items) => {
  if (!items.length) return 1
  return Math.max(...items.map((item) => item.id || 0)) + 1
}

export const now = () => nowIso()

export const ensureApplicationDefaults = (application) => ({
  ...application,
  comments: application.comments || [],
  history: application.history || [],
  status: isValidStatus(application.status) ? application.status : 'recue',
})
