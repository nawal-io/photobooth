import { FilterConfig, FontFamilyType, FrameOption } from '../types';

export const PHOTO_FILTERS: FilterConfig[] = [
  {
    id: 'normal',
    name: 'Normal',
    cssFilter: 'none',
    description: 'Warna asli jernih dan natural',
  },
  {
    id: 'grayscale',
    name: 'B&W / Mono',
    cssFilter: 'grayscale(100%) contrast(115%)',
    description: 'Hitam putih klasik dengan kontras tegas',
  },
  {
    id: 'sepia',
    name: 'Sepia Warm',
    cssFilter: 'sepia(75%) contrast(105%) brightness(95%)',
    description: 'Nuansa coklat hangat retro abad 20',
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    cssFilter: 'sepia(35%) contrast(110%) brightness(105%) saturate(130%) hue-rotate(-10deg)',
    description: 'Warna hangat film 35mm dengan grain subtle',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    cssFilter: 'contrast(135%) saturate(160%) hue-rotate(185deg) brightness(105%)',
    description: 'Warna neon elektrik dengan kontras tinggi',
  },
  {
    id: 'warm',
    name: 'Golden Hour',
    cssFilter: 'sepia(20%) saturate(140%) brightness(108%) contrast(105%)',
    description: 'Sinar matahari sore keemasan lembut',
  },
  {
    id: 'filmnoir',
    name: 'Film Noir',
    cssFilter: 'grayscale(100%) contrast(165%) brightness(85%)',
    description: 'Hitam putih dramatis bayangan pekat',
  },
];

export const FRAME_OPTIONS: FrameOption[] = [
  // Classic
  {
    id: 'white',
    name: 'Classic White',
    category: 'classic',
    bgClass: 'bg-white',
    hexCode: '#FFFFFF',
    textColor: '#171717',
  },
  {
    id: 'black',
    name: 'Matte Black',
    category: 'classic',
    bgClass: 'bg-neutral-900',
    hexCode: '#171717',
    textColor: '#FFFFFF',
  },
  {
    id: 'cream',
    name: 'Warm Cream',
    category: 'classic',
    bgClass: 'bg-[#F9F6F0]',
    hexCode: '#F9F6F0',
    textColor: '#292524',
  },

  // Pastels
  {
    id: 'pastel-pink',
    name: 'Baby Pink',
    category: 'pastel',
    bgClass: 'bg-[#FED7E2]',
    hexCode: '#FED7E2',
    textColor: '#702459',
  },
  {
    id: 'pastel-purple',
    name: 'Lavender Lilac',
    category: 'pastel',
    bgClass: 'bg-[#E9D8FD]',
    hexCode: '#E9D8FD',
    textColor: '#44337A',
  },
  {
    id: 'pastel-mint',
    name: 'Mint Matcha',
    category: 'pastel',
    bgClass: 'bg-[#C6F6D5]',
    hexCode: '#C6F6D5',
    textColor: '#22543D',
  },
  {
    id: 'pastel-blue',
    name: 'Sky Blue',
    category: 'pastel',
    bgClass: 'bg-[#BEE3F8]',
    hexCode: '#BEE3F8',
    textColor: '#2A4365',
  },
  {
    id: 'pastel-butter',
    name: 'Butter Yellow',
    category: 'pastel',
    bgClass: 'bg-[#FEFCBF]',
    hexCode: '#FEFCBF',
    textColor: '#744210',
  },
  {
    id: 'pastel-peach',
    name: 'Soft Peach',
    category: 'pastel',
    bgClass: 'bg-[#FEEBC8]',
    hexCode: '#FEEBC8',
    textColor: '#7B341E',
  },

  // Neon
  {
    id: 'neon-cyan',
    name: 'Cyber Cyan',
    category: 'neon',
    bgClass: 'bg-[#00f0ff]',
    hexCode: '#00f0ff',
    textColor: '#0f172a',
  },
  {
    id: 'neon-pink',
    name: 'Electric Pink',
    category: 'neon',
    bgClass: 'bg-[#ff007f]',
    hexCode: '#ff007f',
    textColor: '#ffffff',
  },
  {
    id: 'neon-purple',
    name: 'Neon Violet',
    category: 'neon',
    bgClass: 'bg-[#8a2be2]',
    hexCode: '#8a2be2',
    textColor: '#ffffff',
  },

  // Pattern
  {
    id: 'pattern-dots',
    name: 'Polka Dots',
    category: 'pattern',
    bgClass: 'bg-white bg-pattern-dots',
    hexCode: '#FFFFFF',
    textColor: '#171717',
    isPattern: true,
  },
  {
    id: 'pattern-dots-dark',
    name: 'Dark Dots',
    category: 'pattern',
    bgClass: 'bg-neutral-900 bg-pattern-dots-dark',
    hexCode: '#171717',
    textColor: '#FFFFFF',
    isPattern: true,
  },
  {
    id: 'pattern-grid',
    name: 'Grid Paper',
    category: 'pattern',
    bgClass: 'bg-white bg-pattern-grid',
    hexCode: '#FFFFFF',
    textColor: '#171717',
    isPattern: true,
  },
  {
    id: 'pattern-stripes',
    name: 'Retro Diagonal',
    category: 'pattern',
    bgClass: 'bg-[#fff5eb] bg-pattern-stripes',
    hexCode: '#fff5eb',
    textColor: '#431407',
    isPattern: true,
  },
  {
    id: 'pattern-checker',
    name: 'Checkerboard',
    category: 'pattern',
    bgClass: 'bg-white bg-pattern-checker',
    hexCode: '#FFFFFF',
    textColor: '#171717',
    isPattern: true,
  },
];

export const STICKER_PALETTE = {
  emojis: [
    '✨', '❤️', '🌸', '🎀', '🧸', '🕶️', '👑', '🐱',
    '🍓', '✌️', '⭐', '💖', '🧁', '🦋', '📸', '🍒',
    '🌙', '🥂', '🥳', '🔥', '🎉', '💐', '🍭', '🍕',
    '🕶', '🦄', '🍀', '💎', '💋', '🐾', '🥑', '⚡'
  ],
  stamps: [
    'BESTIES',
    'PHOTOBOOTH',
    'SMILE :)',
    'VIBES',
    'LOVE',
    'FOREVER',
    'MEMORIES',
    'SO CUTE',
    'LUCKY',
    'SWEET',
    'OUR DAY',
    'GIRLS'
  ]
};

export const FONT_OPTIONS: { id: FontFamilyType; name: string; preview: string; className: string }[] = [
  {
    id: 'outfit',
    name: 'Modern Sans',
    preview: 'SnapStrip Studio',
    className: 'font-outfit',
  },
  {
    id: 'caveat',
    name: 'Handwritten',
    preview: 'SnapStrip Studio',
    className: 'font-caveat text-xl',
  },
  {
    id: 'playfair',
    name: 'Classic Serif',
    preview: 'SnapStrip Studio',
    className: 'font-playfair italic',
  },
  {
    id: 'spacemono',
    name: 'Retro Mono',
    preview: 'SnapStrip Studio',
    className: 'font-mono-retro tracking-widest text-xs uppercase',
  },
];
