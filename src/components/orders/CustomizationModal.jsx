import { useState } from 'react'
import { COMIDA_IDS } from '../../data/products'

const TAMANOS = [
  { value: 'S', label: 'S', ajuste: -0.30 },
  { value: 'M', label: 'M', ajuste: 0 },
  { value: 'L', label: 'L', ajuste: 0.50 },
]

const LECHES = [
  { value: 'normal', label: 'Normal' },
  { value: 'avena', label: 'Avena', ajuste: 0.40 },
  { value: 'soja', label: 'Soja', ajuste: 0.30 },
  { value: 'almendra', label: 'Almendra', ajuste: 0.40 },
]

const EXTRAS = [
  { nombre: 'Shot extra', precio: 0.60 },
  { nombre: 'Sirope vainilla', precio: 0.40 },
  { nombre: 'Nata montada', precio: 0.50 },
]

export default function CustomizationModal({ product, onConfirm, onClose }) {
  const isComida = COMIDA_IDS.has(product.id)
  const [tamano, setTamano] = useState('M')
  const [leche, setLeche] = useState('normal')
  const [extras, setExtras] = useState([])

  const toggleExtra = (extra) => {
    setExtras((prev) =>
      prev.some((e) => e.nombre === extra.nombre)
        ? prev.filter((e) => e.nombre !== extra.nombre)
        : [...prev, extra]
    )
  }

  const precioBase = product.precio
  const ajusteTamano = TAMANOS.find((t) => t.value === tamano)?.ajuste || 0
  const ajusteLeche = LECHES.find((l) => l.value === leche)?.ajuste || 0
  const ajusteExtras = extras.reduce((sum, e) => sum + e.precio, 0)
  const precioFinal = precioBase + (isComida ? 0 : ajusteTamano + ajusteLeche) + ajusteExtras

  const handleConfirm = () => {
    onConfirm({
      ...product,
      precio: Math.round(precioFinal * 100) / 100,
      tamano: isComida ? null : tamano,
      tipo_leche: isComida ? null : leche,
      extras: extras.length > 0 ? extras : [],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full bg-white rounded-t-2xl max-h-[80vh] flex flex-col pb-[env(safe-area-inset-bottom)] md:max-w-[420px] md:rounded-2xl md:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-[#DFE4EC]" />
        </div>

        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <h2 className="text-[#2E2D38] text-lg font-bold">{product.nombre}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="w-8 h-8 flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="#2E2D38" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-4 flex flex-col gap-5">
          {/* Size (drinks only) */}
          {!isComida && (
            <div>
              <p className="text-sm font-semibold text-[#2E2D38] mb-2">Tamaño</p>
              <div className="flex gap-2">
                {TAMANOS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTamano(t.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      tamano === t.value ? 'bg-brand-green text-white' : 'bg-[#F0F2F5] text-[#2E2D38]'
                    }`}
                  >
                    {t.label}
                    {t.ajuste !== 0 && (
                      <span className="block text-[10px] opacity-70">
                        {t.ajuste > 0 ? '+' : ''}{t.ajuste.toFixed(2)} €
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk (drinks only) */}
          {!isComida && (
            <div>
              <p className="text-sm font-semibold text-[#2E2D38] mb-2">Tipo de leche</p>
              <div className="grid grid-cols-2 gap-2">
                {LECHES.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLeche(l.value)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      leche === l.value ? 'bg-brand-green text-white' : 'bg-[#F0F2F5] text-[#2E2D38]'
                    }`}
                  >
                    {l.label}
                    {l.ajuste && <span className="text-[10px] opacity-70 ml-1">+{l.ajuste.toFixed(2)} €</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extras */}
          <div>
            <p className="text-sm font-semibold text-[#2E2D38] mb-2">Extras</p>
            <div className="flex flex-col gap-2">
              {EXTRAS.map((extra) => {
                const selected = extras.some((e) => e.nombre === extra.nombre)
                return (
                  <button
                    key={extra.nombre}
                    onClick={() => toggleExtra(extra)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      selected ? 'bg-brand-green text-white' : 'bg-[#F0F2F5] text-[#2E2D38]'
                    }`}
                  >
                    <span>{extra.nombre}</span>
                    <span>+{extra.precio.toFixed(2)} €</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-20 pt-2 border-t border-[#F0F2F5] md:pb-5">
          <button
            onClick={handleConfirm}
            className="w-full bg-brand-green text-white font-bold py-3.5 rounded-xl text-sm"
          >
            Añadir — {precioFinal.toFixed(2)} €
          </button>
        </div>
      </div>
    </div>
  )
}
