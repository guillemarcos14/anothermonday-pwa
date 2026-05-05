export const CATEGORIAS = ['Best Sellers', 'Café', 'Matcha', 'Comida']

export const PRODUCTOS = {
  'Best Sellers': [
    { id: 1, nombre: 'Matcha Latte', precio: 4.50, categoria: 'Best Sellers', imagen: '/matchalatte.webp', descripcion: 'Matcha ceremonial batido con leche cremosa' },
    { id: 2, nombre: 'Latte', precio: 3.80, categoria: 'Best Sellers', imagen: '/latte.webp', descripcion: 'Espresso suave con leche texturizada' },
    { id: 3, nombre: 'Cookie Choco', precio: 3.20, categoria: 'Best Sellers', imagen: '/cookiechoco.webp', descripcion: 'Crujiente por fuera, fundida por dentro' },
    { id: 4, nombre: 'Muffin Choco', precio: 3.50, categoria: 'Best Sellers', imagen: '/muffinchoco.webp', descripcion: 'Esponjoso con trozos de chocolate negro' },
  ],
  'Café': [
    { id: 10, nombre: 'Espresso', precio: 2.20, categoria: 'Café', imagen: '/Espresso.webp', descripcion: 'Intenso, con crema dorada perfecta' },
    { id: 11, nombre: 'Americano', precio: 2.80, categoria: 'Café', imagen: '/americano.webp', descripcion: 'Espresso largo, limpio y aromático' },
    { id: 13, nombre: 'Cappuccino', precio: 3.50, categoria: 'Café', imagen: '/capuccino.webp', descripcion: 'Equilibrio perfecto de espuma y café' },
    { id: 14, nombre: 'Latte', precio: 3.80, categoria: 'Café', imagen: '/latte.webp', descripcion: 'Espresso suave con leche texturizada' },
  ],
  'Matcha': [
    { id: 20, nombre: 'Matcha Latte', precio: 4.50, categoria: 'Matcha', imagen: '/matchalatte.webp', descripcion: 'Matcha ceremonial batido con leche cremosa' },
    { id: 21, nombre: 'Iced Matcha Latte', precio: 5.00, categoria: 'Matcha', imagen: '/icedmatchalatte.webp', descripcion: 'Matcha frío con leche, refrescante y vibrante' },
    { id: 22, nombre: 'Chai Latte', precio: 4.80, categoria: 'Matcha', imagen: '/chailatte.webp', descripcion: 'Especias cálidas con leche sedosa' },
    { id: 23, nombre: 'Iced Chai Latte', precio: 5.20, categoria: 'Matcha', imagen: '/icedchailatte.webp', descripcion: 'Chai especiado sobre hielo, dulce y fresco' },
  ],
  'Comida': [
    { id: 30, nombre: 'Cookie Choco', precio: 3.20, categoria: 'Comida', imagen: '/cookiechoco.webp', descripcion: 'Crujiente por fuera, fundida por dentro' },
    { id: 31, nombre: 'Muffin Choco', precio: 3.50, categoria: 'Comida', imagen: '/muffinchoco.webp', descripcion: 'Esponjoso con trozos de chocolate negro' },
    { id: 32, nombre: 'Croissant', precio: 2.80, categoria: 'Comida', imagen: '/croissant.webp', descripcion: 'Mantequilla francesa, capas hojaldradas' },
    { id: 33, nombre: 'Roll Canela', precio: 3.00, categoria: 'Comida', imagen: '/rollcanela.webp', descripcion: 'Masa tierna con canela y glaseado suave' },
  ],
}

export const COMIDA_IDS = new Set([3, 4, 30, 31, 32, 33])

export const ALL_PRODUCTOS = Object.values(PRODUCTOS).flat()
