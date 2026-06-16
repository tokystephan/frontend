import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  clearAuthError,
  clearAuthMessage,
  forgotPasswordUser,
} from '../../store/slices/authSlice'
import InputField from '../../components/Forms/InputField'

const ForgotPassword = () => {
  const dispatch = useAppDispatch()
  const { loading, error, successMessage } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage)
      dispatch(clearAuthMessage())
    }
  }, [successMessage, dispatch])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await dispatch(forgotPasswordUser(email))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-slate-500">Saisissez votre email pour recevoir le lien de réinitialisation.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
