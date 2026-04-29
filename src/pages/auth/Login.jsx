import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useUserStore } from '../../store/userStore'

const inputClass =
  'w-full py-3 px-5 bg-transparent text-brand-black border border-brand-gray rounded-full focus:outline-none focus:border-brand-green placeholder:text-brand-black/30 text-sm'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [poblacion, setPoblacion] = useState('')
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Load profile (with points) before navigating
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      console.log('[Login] Profile loaded:', profile, 'Error:', profileError)
      if (profile) {
        useUserStore.getState().setProfile(profile)
      } else {
        // Fallback: ensure profile.id exists so points can be persisted
        useUserStore.getState().setProfile({ id: data.user.id, email: data.user.email, points: 0, tier: 'Bronce' })
      }
    }

    navigate('/home')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      const user = data.user
      if (user) {
        await new Promise(resolve => setTimeout(resolve, 500))

        // Login automático tras el registro (salta confirmación de email)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) {
          setError(signInError.message)
          setLoading(false)
          return
        }

        const profileData = {
          id: user.id,
          name,
          email: user.email,
          poblacion,
          birthday,
          points: 0,
          tier: 'Bronce',
        }

        const { error: profileError } = await supabase.from('profiles').insert(profileData)

        if (profileError) console.error('Profile error:', profileError)
        else useUserStore.getState().setProfile(profileData)
      }

      navigate('/home')
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta')
      setLoading(false)
    }
  }

  const handleSubmit = mode === 'login' ? handleLogin : handleRegister

  return (
    <div className="min-h-[100dvh] flex flex-col px-8 justify-center md:items-center" style={{ backgroundColor: '#F6F5F1', paddingBottom: '12dvh' }}>
      <div className="md:bg-white md:rounded-3xl md:p-12 md:shadow-xl md:max-w-[480px] md:w-full">
      {/* Title */}
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: '28px', letterSpacing: '-1px', color: '#679974' }}>
        Another Monday
      </h1>

      {/* Subtitle */}
      <p className="text-brand-black/50 text-sm mt-3 max-w-[280px]">
        Pide con antelación, recoge sin esperas y acumula recompensas en cada visita.
      </p>

      {/* Form area */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="Usuario"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="Contraseña"
          required
          minLength={6}
        />

        {mode === 'register' && (
          <>
            <input
              type="text"
              value={poblacion}
              onChange={(e) => setPoblacion(e.target.value)}
              className={inputClass}
              placeholder="Población"
            />

            <input
              type="text"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              onFocus={(e) => (e.target.type = 'date')}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text' }}
              className={inputClass}
              placeholder="Fecha de Cumpleaños"
            />
          </>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="button"
          className="text-xs text-brand-black/40 self-start"
        >
          ¿Has olvidado tu contraseña?
        </button>
      </form>

      {/* Bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-8 pb-10 flex gap-3 md:static md:mt-8 md:pb-0 md:px-0" style={{ backgroundColor: '#F6F5F1' }}>
        <button
          type="button"
          onClick={(e) => {
            if (mode === 'login') handleLogin(e)
            else switchMode('login')
          }}
          disabled={mode === 'login' && loading}
          className={`flex-1 py-3.5 font-semibold rounded-full text-sm transition-colors disabled:opacity-50 ${
            mode === 'login'
              ? 'bg-brand-green text-white hover:bg-brand-dark'
              : 'text-brand-black/60'
          }`}
        >
          {mode === 'login' && loading ? 'Entrando...' : 'Iniciar Sesión'}
        </button>
        <button
          type="button"
          onClick={(e) => {
            if (mode === 'register') handleRegister(e)
            else switchMode('register')
          }}
          disabled={mode === 'register' && loading}
          className={`flex-1 py-3.5 font-semibold rounded-full text-sm transition-colors disabled:opacity-50 ${
            mode === 'register'
              ? 'bg-brand-green text-white hover:bg-brand-dark'
              : 'text-brand-black/60'
          }`}
        >
          {mode === 'register' && loading ? 'Creando...' : 'Crear Cuenta'}
        </button>
      </div>
      </div>
    </div>
  )
}
