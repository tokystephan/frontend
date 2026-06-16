import { useDispatch, useSelector } from 'react-redux'
import {
  loginUser,
  registerUser,
  logoutUser,
  checkAuth,
  forgotPasswordUser,
  resetPasswordUser,
  clearAuthError,
  clearAuthMessage,
} from '../store/slices/authSlice'

const useAuth = () => {
  const dispatch = useDispatch()
  const {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    error,
    successMessage,
    initialized,
  } = useSelector((state) => state.auth)

  // ✅ LOGIN
  const login = async (credentials) => {
    const result = await dispatch(loginUser(credentials))
    return result.payload
  }

  // ✅ REGISTER
  const register = async (userData) => {
    const result = await dispatch(registerUser(userData))
    return result.payload
  }

  // ✅ LOGOUT
  const logout = async () => {
    await dispatch(logoutUser())
  }

  // ✅ CHECK AUTH
  const checkAuthStatus = async () => {
    await dispatch(checkAuth())
  }

  // ✅ FORGOT PASSWORD
  const forgotPassword = async (email) => {
    const result = await dispatch(forgotPasswordUser(email))
    return result.payload
  }

  // ✅ RESET PASSWORD
  const resetPassword = async (payload) => {
    const result = await dispatch(resetPasswordUser(payload))
    return result.payload
  }

  // ✅ CLEAR ERROR
  const clearError = () => dispatch(clearAuthError())

  // ✅ CLEAR MESSAGE
  const clearMessage = () => dispatch(clearAuthMessage())

  return {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    error,
    successMessage,
    initialized,
    login,
    register,
    logout,
    checkAuthStatus,
    forgotPassword,
    resetPassword,
    clearError,
    clearMessage,
  }
}

export default useAuth