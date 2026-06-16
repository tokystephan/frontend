// src/store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../../services/notificationService';

const normalizeNotification = (notification) => {
    const isRead = notification?.is_read ?? notification?.read ?? false;
    const businessType = notification?.data?.type || notification?.type || 'notification';
    const severityTypes = ['info', 'success', 'warning', 'error'];

    return {
        ...notification,
        type: businessType,
        severity: severityTypes.includes(notification?.type) ? notification.type : notification?.severity,
        is_read: Boolean(isRead),
    };
};

const normalizeNotificationList = (payload) => {
    const list =
        payload?.data?.data ||
        payload?.notifications?.data ||
        payload?.notifications ||
        payload?.data ||
        payload;

    return Array.isArray(list) ? list.map(normalizeNotification) : [];
};

const getUnreadTotal = (items) => items.filter((notification) => !notification.is_read).length;

// ========== ASYNC THUNKS ==========

// ✅ Récupérer toutes les notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.getAll();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// ✅ Récupérer le nombre de notifications non lues
export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.getUnreadCount();
            return response.data?.data?.count ?? response.data?.count ?? 0;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// ✅ Marquer une notification comme lue
export const markAsReadThunk = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.markAsRead(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// ✅ Marquer toutes les notifications comme lues
export const markAllAsReadThunk = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.markAllAsRead();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// ✅ Supprimer une notification
export const deleteNotificationThunk = createAsyncThunk(
    'notifications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await notificationService.delete(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// ✅ Supprimer toutes les notifications (optionnel)
export const deleteAllNotificationsThunk = createAsyncThunk(
    'notifications/deleteAll',
    async (_, { rejectWithValue }) => {
        try {
            await notificationService.deleteAll();
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    }
);

// ========== SLICE ==========

const initialState = {
    items: [],
    pagination: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 50,
    },
    unreadCount: 0,
    loading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
            state.pagination.total += 1;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
            state.pagination.total = 0;
        },
    },
    extraReducers: (builder) => {
        // fetchNotifications
        builder.addCase(fetchNotifications.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.loading = false;
            state.items = normalizeNotificationList(action.payload);
            if (action.payload?.data && !Array.isArray(action.payload.data)) {
                state.pagination = {
                    currentPage: action.payload.current_page || 1,
                    lastPage: action.payload.last_page || 1,
                    total: action.payload.total || 0,
                    perPage: action.payload.per_page || 50,
                };
            } else {
                state.pagination.total = state.items.length;
            }
            state.unreadCount = getUnreadTotal(state.items);
        });
        builder.addCase(fetchNotifications.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // fetchUnreadCount
        builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
            state.unreadCount = action.payload;
        });

        // markAsReadThunk
        builder.addCase(markAsReadThunk.fulfilled, (state, action) => {
            const notification = state.items.find(n => n.id === action.payload);
            if (notification && !notification.is_read) {
                notification.is_read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        });

        // markAllAsReadThunk
        builder.addCase(markAllAsReadThunk.fulfilled, (state) => {
            state.items.forEach(n => n.is_read = true);
            state.unreadCount = 0;
        });

        // deleteNotificationThunk
        builder.addCase(deleteNotificationThunk.fulfilled, (state, action) => {
            state.items = state.items.filter(n => n.id !== action.payload);
            state.unreadCount = getUnreadTotal(state.items);
            state.pagination.total = state.items.length;
        });
    },
});

export const { addNotification, clearError, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
