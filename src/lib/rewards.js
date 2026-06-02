import { supabase } from './supabase'
import ACHIEVEMENT_REWARDS from '../data/achievementRewards'

/**
 * Grant rewards for newly unlocked achievements (idempotent).
 * The UNIQUE(user_id, achievement_id) constraint prevents duplicates at DB level.
 * We catch duplicate-key errors silently so the client flow is never interrupted.
 */
export async function grantAchievementRewards(userId, unlockedAchievementIds) {
  const toGrant = unlockedAchievementIds.filter((id) => id in ACHIEVEMENT_REWARDS)
  if (toGrant.length === 0) return

  const rows = toGrant.map((achievementId) => ({
    user_id: userId,
    achievement_id: achievementId,
    product_id: ACHIEVEMENT_REWARDS[achievementId],
    status: 'pending',
  }))

  // upsert with ON CONFLICT DO NOTHING semantics via ignoreDuplicates
  const { error } = await supabase
    .from('user_rewards')
    .upsert(rows, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true })

  // Swallow duplicate/constraint errors — the reward already exists
  if (error && !error.message?.includes('duplicate') && !error.message?.includes('conflict')) {
    console.error('Error granting rewards:', error)
  }
}

/**
 * Fetch pending rewards for a user (joined with product info).
 */
export async function fetchPendingRewards(userId) {
  const { data, error } = await supabase
    .from('user_rewards')
    .select('id, achievement_id, product_id, status, created_at, products ( nombre, imagen, precio )')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
