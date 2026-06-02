import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { usePoints, notifyPointsChanged } from '../../hooks/usePoints'
import PageWrapper from '../../components/layout/PageWrapper'

export default function Rewards() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { points } = usePoints()
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)
  const [canjeando, setCanjeando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    if (!user) return // Wait for auth session (RLS needs it)

    supabase
      .from('rewards')
      .select('*')
      .eq('disponible', true)
      .order('coste_puntos')
      .then(({ data, error }) => {
        if (!error && data) setRewards(data)
        setLoading(false)
      })
  }, [user]) // Re-fire when user goes from null → defined

  const handleCanjear = async (reward) => {
    if (!user?.id) return
    setCanjeando(reward.id)
    setMensaje(null)

    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_reward_id: reward.id,
        p_user_id: user.id,
      })

      if (error) throw error

      if (data?.ok) {
        setMensaje({ type: 'success', text: `Has canjeado "${reward.nombre}". Te quedan ${data.points} puntos.` })
        notifyPointsChanged()
      } else {
        setMensaje({ type: 'error', text: data?.error || 'No se pudo canjear.' })
      }
    } catch (err) {
      setMensaje({ type: 'error', text: err.message })
    } finally {
      setCanjeando(null)
    }
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="relative bg-white px-5 pt-6 pb-3 flex items-center justify-between" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        <button onClick={() => navigate(-1)} aria-label="Volver" className="w-9 h-9 flex items-center justify-center">
          <svg width="22" height="22" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-[#2E2D38] text-lg font-bold absolute left-1/2 -translate-x-1/2">Recompensas</h1>
        <div className="w-9" />
      </div>

      <div className="px-5 mt-4">
        {/* Points banner */}
        <div className="bg-brand-green rounded-xl px-4 py-3 text-white flex items-center justify-between mb-5">
          <div>
            <p className="text-xs opacity-80">Tus puntos</p>
            <p className="text-xl font-bold">{points} pts</p>
          </div>
          <svg width="32" height="32" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>

        {/* Messages */}
        {mensaje && (
          <div className={`rounded-xl px-4 py-3 text-sm mb-4 ${
            mensaje.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {mensaje.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rewards.length === 0 ? (
          <p className="text-[#54647A] text-sm text-center py-12">No hay recompensas disponibles.</p>
        ) : (
          <div className="flex flex-col gap-3 pb-24">
            {rewards.map((reward) => {
              const canAfford = points >= reward.coste_puntos
              return (
                <div key={reward.id} className="bg-white rounded-xl p-4 flex items-center gap-4" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div className="w-14 h-14 rounded-xl bg-[#EAF2EB] flex items-center justify-center shrink-0 overflow-hidden">
                    {reward.imagen ? (
                      <img src={reward.imagen} alt={reward.nombre} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <svg width="24" height="24" fill="none" stroke="#46704F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="3" y="8" width="18" height="4" rx="1" />
                        <path d="M12 8v13" />
                        <path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2E2D38]">{reward.nombre}</p>
                    {reward.descripcion && (
                      <p className="text-xs text-[#54647A] mt-0.5">{reward.descripcion}</p>
                    )}
                    <p className="text-xs font-semibold text-brand-green mt-1">{reward.coste_puntos} pts</p>
                  </div>
                  <button
                    onClick={() => handleCanjear(reward)}
                    disabled={!canAfford || canjeando === reward.id}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold shrink-0 transition-colors ${
                      canAfford
                        ? 'bg-brand-green text-white'
                        : 'bg-[#DFE4EC] text-[#54647A] cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    {canjeando === reward.id ? '...' : 'Canjear'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
