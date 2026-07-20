import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearAuthError, clearAuthMessage, resetPasswordUser } from '../../store/slices/authSlice'
import InputField from '../../components/Forms/InputField'

const ResetPassword = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error, successMessage } = useAppSelector((state) => state.auth)
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

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
      navigate('/login', { replace: true })
    }
  }, [successMessage, dispatch, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token || !email) return toast.error('Le lien de réinitialisation est incomplet ou invalide.')
    if (password.length < 8) return toast.error('Le mot de passe doit contenir au moins 8 caractères.')
    if (password !== passwordConfirmation) return toast.error('Les deux mots de passe ne correspondent pas.')

    await dispatch(resetPasswordUser({ email, token, password, password_confirmation: passwordConfirmation }))
  }

  if (!token || !email) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8"><div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="text-2xl font-bold text-slate-900">Lien invalide</h1><p className="mt-2 text-sm text-slate-600">Demandez un nouveau lien de réinitialisation.</p><Link to="/forgot-password" className="mt-5 inline-block font-semibold text-blue-700 hover:text-blue-800">Demander un nouveau lien</Link></div></div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h1>
        <p className="mt-1 text-sm text-slate-500">Choisissez un nouveau mot de passe pour {email}.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField label="Nouveau mot de passe" name="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
          <InputField label="Confirmer le mot de passe" name="password_confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} minLength={8} required />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}</button>
        </form>
        <p className="mt-4 text-sm text-slate-600"><Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">Retour à la connexion</Link></p>
      </div>
    </div>
  )
}

export default ResetPassword
