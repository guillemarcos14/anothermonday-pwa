/**
 * Maps achievement IDs to the product_id the user receives as a gift
 * when the achievement is unlocked.
 *
 * Escalón 1 (fácil):      Espresso (10) / Americano (11)
 * Escalón 2 (medio-bajo): Cappuccino (13) / Latte (14) / Croissant (32)
 * Escalón 3 (medio):      Matcha Latte (20) / Iced Matcha (21) / Chai (22) / Matcha BS (1)
 * Escalón 4 (premium):    Iced Chai Latte (23)
 */
const ACHIEVEMENT_REWARDS = {
  1: 10,   // Primera vez        → Espresso
  6: 11,   // Madrugador         → Americano
  2: 13,   // 5 pedidos          → Cappuccino
  8: 14,   // Explorador         → Latte
  9: 32,   // Tier Plata         → Croissant
  3: 20,   // 10 pedidos         → Matcha Latte
  5: 21,   // Matcha Lover       → Iced Matcha Latte
  7: 22,   // Racha 7 días       → Chai Latte
  10: 1,   // Tier Oro           → Matcha Latte (Best Seller)
  4: 23,   // 25 pedidos         → Iced Chai Latte
  11: 23,  // Tier Platino       → Iced Chai Latte
}

export default ACHIEVEMENT_REWARDS
