import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosConfig';

export const fetchDepartments = createAsyncThunk(
    'departments/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/departments');
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.response?.statusText || error?.message || 'Erreur de chargement des départements';
            return rejectWithValue(message);
        }
    }
);

const departmentSlice = createSlice({
    name: 'departments',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchDepartments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || 'Impossible de charger les départements';
            });
    },
});

export default departmentSlice.reducer;