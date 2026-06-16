import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import applicationReducer from './slices/applicationSlice'
import candidateReducer from './slices/candidateSlice'
import postReducer from './slices/postSlice'
import uiReducer from './slices/uiSlice'
import notificationReducer from './slices/notificationSlice';
import departmentReducer from './slices/departmentSlice';
import contractTypeReducer from './slices/contractTypeSlice';


const store = configureStore({
  reducer: {
    auth: authReducer,
    applications: applicationReducer,
    candidates: candidateReducer,
    posts: postReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    departments: departmentReducer,
   contractTypes: contractTypeReducer,
  },
  
})

export default store