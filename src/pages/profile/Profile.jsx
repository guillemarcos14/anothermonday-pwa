import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useUserStore } from '../../store/userStore'
import PageWrapper from '../../components/layout/PageWrapper'

export default function Profile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useUserStore((s) => s.profile)
  const setProfile = useUserStore((s) => s.setProfile)

  const [form, setForm] = useState({
    usuario: '',
    email: '',
    poblacion: '',
    cumpleanos: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        usuario: profile.usuario || profile.name || '',
        email: profile.email || '',
        poblacion: profile.poblacion || '',
        cumpleanos: profile.cumpleanos || '',
      })
    }
  }, [profile])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user?.id) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          usuario: form.usuario,
          poblacion: form.poblacion,
          cumpleanos: form.cumpleanos || null,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      setSaved(true)
    } catch (err) {
      console.error('Error guardando perfil:', err)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full py-3 px-4 bg-white border border-[#DFE4EC] rounded-xl text-sm text-[#2E2D38] focus:outline-none focus:border-brand-green'

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <button onClick={() => navigate(-1)} aria-label="Volver" className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[#2E2D38] text-lg font-bold absolute left-1/2 -translate-x-1/2">Mi Perfil</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 mt-6">
        {/* Avatar placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-green flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {(form.usuario || form.email || '?')[0].toUpperCase()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-[#54647A] font-semibold mb-1 block">Nombre</label>
            <input
              type="text"
              value={form.usuario}
              onChange={(e) => handleChange('usuario', e.target.value)}
              className={inputClass}
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="text-xs text-[#54647A] font-semibold mb-1 block">Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className={`${inputClass} bg-[#F6F5F1] text-[#54647A]`}
            />
          </div>

          <div>
            <label className="text-xs text-[#54647A] font-semibold mb-1 block">Población</label>
            <input
              type="text"
              value={form.poblacion}
              onChange={(e) => handleChange('poblacion', e.target.value)}
              className={inputClass}
              placeholder="Tu ciudad"
            />
          </div>

          <div>
            <label className="text-xs text-[#54647A] font-semibold mb-1 block">Cumpleaños</label>
            <input
              type="date"
              value={form.cumpleanos}
              onChange={(e) => handleChange('cumpleanos', e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-green text-white font-bold text-base py-3.5 rounded-xl mt-2 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </form>

        {/* Points info */}
        {profile && (
          <div className="mt-6 bg-white rounded-xl px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-[#2E2D38]">Nivel {profile.tier || 'Bronce'}</p>
                <p className="text-xs text-[#54647A]">{profile.points || 0} puntos</p>
              </div>
              {profile.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-3 py-1.5 bg-[#1D4D4F] text-white text-xs font-semibold rounded-lg"
                >
                  Panel Admin
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
