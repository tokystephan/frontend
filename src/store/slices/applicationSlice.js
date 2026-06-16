// src/store/slices/applicationSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { 
  getAllApplications,
  getApplication,
  createNewApplication,
  editApplication,
  removeApplication,
  updateApplicationStatus,
  addComment,
  getComments,
  removeComment
} from '../../services/applicationService'

// ✅ FONCTION UTILITAIRE
const normalizeError = (error) => {
  const response = error?.response?.data
  if (response?.message) return response.message
  if (response?.errors) {
    const errors = Object.values(response.errors).flat()
    return errors.length > 0 ? errors.join(' ') : 'Erreur de validation'
  }
  return error?.message || 'Erreur sur les candidatures'
}

// ✅ ASYNC THUNKS

export const fetchApplications = createAsyncThunk(
  'applications/fetchApplications',
  async (page = 1, { rejectWithValue }) => {
    try {
      console.log('📋 fetchApplications - Page:', page)
      const response = await getAllApplications(page)
      console.log('✅ fetchApplications - Succès')
      return response
    } catch (error) {
      console.error('❌ fetchApplications - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchApplicationById',
  async (id, { rejectWithValue }) => {
    try {
      console.log('📋 fetchApplicationById - ID:', id)
      const response = await getApplication(id)
      console.log('✅ fetchApplicationById - Succès')
      return response
    } catch (error) {
      console.error('❌ fetchApplicationById - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const createNewApp = createAsyncThunk(
  'applications/createNewApp',
  async (applicationData, { rejectWithValue }) => {
    try {
      console.log('📋 createNewApp - Données:', applicationData)
      const response = await createNewApplication(applicationData)
      console.log('✅ createNewApp - Succès')
      return response
    } catch (error) {
      console.error('❌ createNewApp - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const editApp = createAsyncThunk(
  'applications/editApp',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('📋 editApp - ID:', id)
      const response = await editApplication(id, data)
      console.log('✅ editApp - Succès')
      return response
    } catch (error) {
      console.error('❌ editApp - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const deleteApp = createAsyncThunk(
  'applications/deleteApp',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🗑️ deleteApp - ID:', id)
      await removeApplication(id)
      console.log('✅ deleteApp - Succès')
      return id
    } catch (error) {
      console.error('❌ deleteApp - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const updateStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      console.log('🔄 updateStatus - ID:', id)
      const response = await updateApplicationStatus(id, statusData)
      console.log('✅ updateStatus - Succès')
      return response
    } catch (error) {
      console.error('❌ updateStatus - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const addNewComment = createAsyncThunk(
  'applications/addNewComment',
  async ({ applicationId, commentData }, { rejectWithValue }) => {
    try {
      console.log('💬 addNewComment - Application ID:', applicationId)
      const response = await addComment(applicationId, commentData)
      console.log('✅ addNewComment - Succès')
      return response
    } catch (error) {
      console.error('❌ addNewComment - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const fetchComments = createAsyncThunk(
  'applications/fetchComments',
  async (applicationId, { rejectWithValue }) => {
    try {
      console.log('💬 fetchComments - Application ID:', applicationId)
      const response = await getComments(applicationId)
      console.log('✅ fetchComments - Succès')
      return response
    } catch (error) {
      console.error('❌ fetchComments - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

export const deleteComment = createAsyncThunk(
  'applications/deleteComment',
  async ({ applicationId, commentId }, { rejectWithValue }) => {
    try {
      console.log('🗑️ deleteComment - Comment ID:', commentId)
      await removeComment(applicationId, commentId)
      console.log(' deleteComment - Succès')
      return { applicationId, commentId }
    } catch (error) {
      console.error('❌ deleteComment - Erreur:', error)
      return rejectWithValue(normalizeError(error))
    }
  }
)

//  SLICE

const initialState = {
  applications: [],
  currentApplication: null,
  comments: [],
  loading: false,
  error: null,
  successMessage: '',
}

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessage: (state) => {
      state.successMessage = ''
    },
  },
  extraReducers: (builder) => {
    // ========== FETCH APPLICATIONS ==========
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false
        state.applications = action.payload?.data || action.payload || []
        state.error = null
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== FETCH APPLICATION BY ID ==========
    builder
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        state.loading = false
        state.currentApplication = action.payload?.data || action.payload
        state.error = null
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== CREATE APPLICATION ==========
    builder
      .addCase(createNewApp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNewApp.fulfilled, (state, action) => {
        state.loading = false
        const newApp = action.payload?.data || action.payload
        state.applications.unshift(newApp)
        state.successMessage = 'Candidature créée avec succès'
        state.error = null
      })
      .addCase(createNewApp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== EDIT APPLICATION ==========
    builder
      .addCase(editApp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(editApp.fulfilled, (state, action) => {
        state.loading = false
        const updatedApp = action.payload?.data || action.payload
        const index = state.applications.findIndex(app => app.id === updatedApp.id)
        if (index !== -1) {
          state.applications[index] = updatedApp
        }
        if (state.currentApplication?.id === updatedApp.id) {
          state.currentApplication = updatedApp
        }
        state.successMessage = 'Candidature mise à jour'
        state.error = null
      })
      .addCase(editApp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== DELETE APPLICATION ==========
    builder
      .addCase(deleteApp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteApp.fulfilled, (state, action) => {
        state.loading = false
        state.applications = state.applications.filter(app => app.id !== action.payload)
        if (state.currentApplication?.id === action.payload) {
          state.currentApplication = null
        }
        state.successMessage = 'Candidature supprimée'
        state.error = null
      })
      .addCase(deleteApp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== UPDATE STATUS ==========
    builder
      .addCase(updateStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedApp = action.payload?.data || action.payload
        const index = state.applications.findIndex(app => app.id === updatedApp.id)
        if (index !== -1) {
          state.applications[index] = updatedApp
        }
        if (state.currentApplication?.id === updatedApp.id) {
          state.currentApplication = updatedApp
        }
        state.successMessage = 'Statut mis à jour'
        state.error = null
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== ADD COMMENT ==========
    builder
      .addCase(addNewComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addNewComment.fulfilled, (state, action) => {
        state.loading = false
        const newComment = action.payload?.data || action.payload
        state.comments.unshift(newComment)
        if (state.currentApplication) {
          const currentComments = Array.isArray(state.currentApplication.comments)
            ? state.currentApplication.comments
            : []
          state.currentApplication.comments = [newComment, ...currentComments]
        }
        state.successMessage = 'Commentaire ajouté'
        state.error = null
      })
      .addCase(addNewComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== FETCH COMMENTS ==========
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false
        state.comments = action.payload?.data || action.payload || []
        state.error = null
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // ========== DELETE COMMENT ==========
    builder
      .addCase(deleteComment.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false
        state.comments = state.comments.filter(comment => comment.id !== action.payload.commentId)
        state.successMessage = 'Commentaire supprimé'
        state.error = null
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearMessage } = applicationSlice.actions
export default applicationSlice.reducer
