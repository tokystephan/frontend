import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../api/axiosConfig';

export const fetchContractTypes = createAsyncThunk(
    'contractTypes/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/contract-types');
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || error?.response?.statusText || error?.message || 'Erreur de chargement des types de contrat';
            return rejectWithValue(message);
        }
    }
);

const contractTypeSlice = createSlice({
    name: 'contractTypes',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchContractTypes.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContractTypes.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchContractTypes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || 'Impossible de charger les types de contrat';
            });
    },
});

export default contractTypeSlice.reducer;