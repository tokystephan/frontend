import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as postApi from '../../api/postApi';

const normalizePayload = (payload) => {
    if (!payload) return payload;
    return payload.data ?? payload.post ?? payload;
};

// Thunks (actions asynchrones)
export const fetchPosts = createAsyncThunk('posts/fetchAll', async (params, { rejectWithValue }) => {
    try {
        const response = await postApi.getPosts(params);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des postes');
    }
});

export const fetchPostById = createAsyncThunk('posts/fetchOne', async (id, { rejectWithValue }) => {
    if (id === undefined || id === null || String(id).trim() === '') {
        return rejectWithValue('Identifiant de poste invalide');
    }

    try {
        const response = await postApi.getPostById(id);
        return response?.data ?? response;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || error.message || 'Poste introuvable');
    }
});

export const createPost = createAsyncThunk('posts/create', async (postData, { rejectWithValue }) => {
    try {
        const response = await postApi.createPost(postData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.errors || 'Erreur de création');
    }
});

export const updatePost = createAsyncThunk('posts/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await postApi.updatePost(id, data);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.errors || 'Erreur de modification');
    }
});

export const deletePost = createAsyncThunk('posts/delete', async (id, { rejectWithValue }) => {
    try {
        await postApi.deletePost(id);
        return id;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erreur de suppression');
    }
});

export const archivePost = createAsyncThunk('posts/archive', async (id, { rejectWithValue }) => {
    try {
        const response = await postApi.archivePostApi(id);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Erreur d'archivage");
    }
});

export const restorePost = createAsyncThunk('posts/restore', async (id, { rejectWithValue }) => {
    try {
        const response = await postApi.restorePostApi(id);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Erreur de restauration');
    }
});

// Slice
const initialState = {
    list: [],
    current: null,
    loading: false,
    total: 0,
    lastPage: 1,
    error: null,
};

const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        clearCurrent: (state) => { state.current = null; },
        clearError: (state) => { state.error = null; }
    },
    extraReducers: (builder) => {
        // ✅ 1. TOUS LES addCase d'abord
        builder
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                // Support both nested and flat response structures
                const payload = action.payload || {};
                state.list = payload.data ?? payload;
                state.total = payload.total ?? payload.meta?.total ?? 0;
                state.lastPage = payload.last_page ?? payload.meta?.last_page ?? 1;
            })
            .addCase(fetchPostById.fulfilled, (state, action) => {
                state.loading = false;
                state.current = normalizePayload(action.payload) || null;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.loading = false;
                const newPost = normalizePayload(action.payload);
                if (newPost) {
                    state.list.unshift(newPost);
                    state.total++;
                }
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPost = normalizePayload(action.payload);
                if (updatedPost) {
                    const index = state.list.findIndex(p => p.id === updatedPost.id);
                    if (index !== -1) state.list[index] = updatedPost;
                    if (state.current?.id === updatedPost.id) state.current = updatedPost;
                }
            })
            .addCase(archivePost.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPost = normalizePayload(action.payload);
                if (updatedPost) {
                    const index = state.list.findIndex(p => p.id === updatedPost.id);
                    if (index !== -1) state.list[index] = updatedPost;
                    if (state.current?.id === updatedPost.id) state.current = updatedPost;
                }
            })
            .addCase(restorePost.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPost = normalizePayload(action.payload);
                if (updatedPost) {
                    const index = state.list.findIndex(p => p.id === updatedPost.id);
                    if (index !== -1) state.list[index] = updatedPost;
                    if (state.current?.id === updatedPost.id) state.current = updatedPost;
                }
            })
            .addCase(fetchPostById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.current = null;
            })
            .addCase(fetchPostById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.current = null;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter(p => p.id !== action.payload);
                state.total--;
                if (state.current?.id === action.payload) state.current = null;
            });

        // ✅ 2. Ensuite, les matchers (pending / rejected)
        builder
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    },
});

export const { clearCurrent, clearError } = postSlice.actions;
export default postSlice.reducer;
