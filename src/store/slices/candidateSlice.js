import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createCandidateService as createCandidate,
  getCandidate,
  listCandidates,
  updateCandidateService as updateCandidate,
  deleteCandidateService as deleteCandidate,
} from '../../services/candidateService'

// ✅ FONCTION UTILITAIRE - Normalisation des erreurs
const normalizeError = (error) => {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'Erreur sur les candidats'
}

// ✅ ASYNC THUNKS

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('👥 fetchCandidates - Paramètres:', params)
      const response = await listCandidates(params)
      console.log('✅ fetchCandidates - Succès')
      // ✅ response est déjà les données (pas l'objet Axios)
      return response
    } catch (error) {
      console.error('❌ fetchCandidates - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const fetchCandidateById = createAsyncThunk(
  'candidates/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      console.log('👥 fetchCandidateById - ID:', id)
      const response = await getCandidate(id)
      console.log('✅ fetchCandidateById - Succès')
      // ✅ response est déjà les données
      return response
    } catch (error) {
      console.error('❌ fetchCandidateById - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const createCandidateAction = createAsyncThunk(
  'candidates/create',
  async (payload, { rejectWithValue }) => {
    try {
      // ✅ Nettoyer les données avant envoi (protection supplémentaire)
      const cleanedPayload = {
        first_name: payload.first_name?.trim() || '',
        last_name: payload.last_name?.trim() || '',
        email: payload.email?.trim() || '',
        phone: payload.phone?.trim() || '',
        source: payload.source || null,
        notes: payload.notes?.trim() || '',
        documents: payload.documents || [],
      }
      console.log('👥 createCandidateAction - Données:', cleanedPayload)
      const response = await createCandidate(cleanedPayload)
      console.log('✅ createCandidateAction - Succès')
      return response
    } catch (error) {
      console.error('❌ createCandidateAction - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const updateCandidateAction = createAsyncThunk(
  'candidates/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      // ✅ Nettoyer les données avant envoi
      const cleanedPayload = {
        first_name: payload.first_name?.trim() || '',
        last_name: payload.last_name?.trim() || '',
        email: payload.email?.trim() || '',
        phone: payload.phone?.trim() || '',
        source: payload.source || null,
        notes: payload.notes?.trim() || '',
        documents: payload.documents || [],
      }
      console.log('👥 updateCandidateAction - ID:', id, 'Données:', cleanedPayload)
      const response = await updateCandidate(id, cleanedPayload)
      console.log('✅ updateCandidateAction - Succès')
      return response
    } catch (error) {
      console.error('❌ updateCandidateAction - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const deleteCandidateAction = createAsyncThunk(
  'candidates/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🗑️ deleteCandidateAction - ID:', id)
      const response = await deleteCandidate(id)
      console.log('✅ deleteCandidateAction - Succès')
      // ✅ Retourner l'ID et éventuellement le message
      return { id, message: response?.message || 'Candidat supprimé' }
    } catch (error) {
      console.error('❌ deleteCandidateAction - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

// ✅ SLICE

const initialState = {
  items: [],           // Liste des candidats
  current: null,      // Candidat courant (détail)
  loading: false,     // État de chargement
  error: null,        // Message d'erreur
  successMessage: '', // Message de succès
  total: 0,           // Total des candidats (pour pagination)
  lastPage: 1,        // Dernière page
}

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    clearCandidateError: (state) => {
      state.error = null
    },
    clearCandidateMessage: (state) => {
      state.successMessage = ''
    },
    resetCandidateState: (state) => {
      state.items = []
      state.current = null
      state.error = null
      state.successMessage = ''
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    // ========== FETCH CANDIDATES ==========
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.loading = false
        // ✅ Gestion des différents formats de réponse
        const responseData = action.payload
        if (Array.isArray(responseData)) {
          state.items = responseData
          state.total = responseData.length
          state.lastPage = 1
        } else if (responseData?.data && Array.isArray(responseData.data)) {
          state.items = responseData.data
          state.total = responseData.total || responseData.data.length
          state.lastPage = responseData.last_page || 1
        } else {
          state.items = []
          state.total = 0
        }
        state.error = null
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Erreur lors du chargement des candidats'
        state.items = []
      })

    // ========== FETCH CANDIDATE BY ID ==========
    builder
      .addCase(fetchCandidateById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
        state.error = null
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Erreur lors du chargement du candidat'
        state.current = null
      })

    // ========== CREATE CANDIDATE ==========
    builder
      .addCase(createCandidateAction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCandidateAction.fulfilled, (state, action) => {
        state.loading = false
        const newCandidate = action.payload
        if (newCandidate) {
          state.items = [newCandidate, ...state.items]
        }
        state.successMessage = 'Candidat créé avec succès'
        state.error = null
      })
      .addCase(createCandidateAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Erreur lors de la création du candidat'
      })

    // ========== UPDATE CANDIDATE ==========
    builder
      .addCase(updateCandidateAction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCandidateAction.fulfilled, (state, action) => {
        state.loading = false
        const updatedCandidate = action.payload
        if (updatedCandidate) {
          const index = state.items.findIndex((item) => item.id === updatedCandidate.id)
          if (index !== -1) {
            state.items[index] = updatedCandidate
          }
          if (state.current?.id === updatedCandidate.id) {
            state.current = updatedCandidate
          }
        }
        state.successMessage = 'Candidat mis à jour avec succès'
        state.error = null
      })
      .addCase(updateCandidateAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Erreur lors de la mise à jour du candidat'
      })

    // ========== DELETE CANDIDATE ==========
    builder
      .addCase(deleteCandidateAction.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCandidateAction.fulfilled, (state, action) => {
        state.loading = false
        const { id, message } = action.payload
        state.items = state.items.filter((item) => item.id !== id)
        if (state.current?.id === id) {
          state.current = null
        }
        state.successMessage = message || 'Candidat supprimé avec succès'
        state.error = null
      })
      .addCase(deleteCandidateAction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Erreur lors de la suppression du candidat'
      })
  },
})

// ✅ Export des actions
export const { clearCandidateError, clearCandidateMessage, resetCandidateState } = candidateSlice.actions

// ✅ Export du reducer
export default candidateSlice.reducer