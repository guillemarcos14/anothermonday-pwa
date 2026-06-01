import { supabase } from './supabase'
import { CATEGORIAS as FALLBACK_CATEGORIAS, PRODUCTOS as FALLBACK_PRODUCTOS } from '../data/products'

/**
 * Fetches all available products from Supabase, grouped by category.
 * Falls back to static data if offline or on error.
 */
export async function listarProductos() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('disponible', true)
      .order('id')

    if (error) throw error

    // Group by category
    const grouped = {}
    for (const p of data) {
      if (!grouped[p.categoria]) grouped[p.categoria] = []
      grouped[p.categoria].push(p)
    }
    return grouped
  } catch {
    return FALLBACK_PRODUCTOS
  }
}

/**
 * Fetches the list of distinct categories.
 * Falls back to static data if offline or on error.
 */
export async function listarCategorias() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('categoria')
      .eq('disponible', true)

    if (error) throw error

    // Preserve insertion order, deduplicate
    const seen = new Set()
    const cats = []
    for (const { categoria } of data) {
      if (!seen.has(categoria)) {
        seen.add(categoria)
        cats.push(categoria)
      }
    }
    return cats
  } catch {
    return FALLBACK_CATEGORIAS
  }
}
