// Card Back Designs Catalog

export const CARD_BACKS = [
  // Starter (Free/Cheap)
  {
    id: 'default_card_back',
    name: 'Classic',
    description: 'The original design',
    rarity: 'common',
    price: 0,
    currency: 'coins',
    unlockMethod: 'default',
    preview: '/assets/card-backs/classic.png',
    pattern: 'cubes' // Texture pattern name
  },
  {
    id: 'blue_wave',
    name: 'Blue Wave',
    description: 'Flowing ocean waves',
    rarity: 'common',
    price: 200,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'waves-blue'
  },
  {
    id: 'red_flame',
    name: 'Red Flame',
    description: 'Burning passion',
    rarity: 'common',
    price: 200,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'flames-red'
  },
  {
    id: 'green_forest',
    name: 'Forest Green',
    description: 'Natural elegance',
    rarity: 'common',
    price: 200,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'leaves-green'
  },
  {
    id: 'purple_galaxy',
    name: 'Purple Nebula',
    description: 'Cosmic wonder',
    rarity: 'common',
    price: 200,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'stars-purple'
  },
  
  // Rare
  {
    id: 'cyberpunk_neon',
    name: 'Cyberpunk Neon',
    description: 'Futuristic city lights',
    rarity: 'rare',
    price: 500,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'circuit-neon',
    glowEffect: true
  },
  {
    id: 'golden_dragon',
    name: 'Golden Dragon',
    description: 'Legendary creature',
    rarity: 'rare',
    price: 500,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'dragon-gold',
    animated: true
  },
  {
    id: 'diamond_luxury',
    name: 'Diamond Luxury',
    description: 'Sparkling wealth',
    rarity: 'rare',
    price: 500,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'diamonds',
    sparkle: true
  },
  
  // Epic
  {
    id: 'holo_spectrum',
    name: 'Holographic',
    description: 'Rainbow shimmer',
    rarity: 'epic',
    price: 800,
    currency: 'coins',
    unlockMethod: 'shop',
    pattern: 'holo-rainbow',
    animated: true,
    glowEffect: true
  },
  {
    id: 'midnight_moon',
    name: 'Midnight Moon',
    description: 'Lunar eclipse',
    rarity: 'epic',
    price: 150,
    currency: 'tokens',
    unlockMethod: 'shop',
    pattern: 'moon-phases',
    animated: true
  },
  
  // Legendary
  {
    id: 'phoenix_rise',
    name: 'Phoenix Rising',
    description: 'Reborn in flames',
    rarity: 'legendary',
    price: 300,
    currency: 'tokens',
    unlockMethod: 'shop',
    pattern: 'phoenix-fire',
    animated: true,
    glowEffect: true,
    particleEffect: 'embers'
  },
  {
    id: 'mind_fucked_special',
    name: 'Mind F**ked Master',
    description: 'For true champions',
    rarity: 'legendary',
    price: 500,
    currency: 'tokens',
    unlockMethod: 'achievement', // Unlock by reaching Level 100
    pattern: 'brain-circuit',
    animated: true,
    glowEffect: true,
    exclusive: true
  }
];

export const TABLE_THEMES = [
  {
    id: 'default_table',
    name: 'Casino Classic',
    description: 'Traditional green felt',
    rarity: 'common',
    price: 0,
    currency: 'coins',
    unlockMethod: 'default',
    gradient: 'from-casino-green/30 to-casino-dark',
    texture: 'dark-leather'
  },
  {
    id: 'royal_velvet',
    name: 'Royal Velvet',
    description: 'Luxurious purple',
    rarity: 'rare',
    price: 1000,
    currency: 'coins',
    unlockMethod: 'shop',
    gradient: 'from-purple-900/40 to-purple-950',
    texture: 'fabric'
  },
  {
    id: 'cyber_matrix',
    name: 'Cyber Matrix',
    description: 'Digital grid',
    rarity: 'epic',
    price: 200,
    currency: 'tokens',
    unlockMethod: 'shop',
    gradient: 'from-cyan-900/30 to-blue-950',
    texture: 'circuit-board',
    animated: true
  },
  {
    id: 'space_void',
    name: 'Space Void',
    description: 'Infinite cosmos',
    rarity: 'legendary',
    price: 400,
    currency: 'tokens',
    unlockMethod: 'shop',
    gradient: 'from-indigo-950/50 to-black',
    texture: 'starfield',
    animated: true,
    particleEffect: 'stars'
  }
];

export const AVATARS = [
  {
    id: 'default_avatar',
    name: 'Anonymous',
    description: 'Mystery player',
    rarity: 'common',
    price: 0,
    currency: 'coins',
    unlockMethod: 'default',
    icon: '🎭'
  },
  {
    id: 'brain_master',
    name: 'Brain Master',
    description: 'Big brain energy',
    rarity: 'common',
    price: 300,
    currency: 'coins',
    unlockMethod: 'shop',
    icon: '🧠'
  },
  {
    id: 'card_shark',
    name: 'Card Shark',
    description: 'Professional player',
    rarity: 'rare',
    price: 500,
    currency: 'coins',
    unlockMethod: 'shop',
    icon: '🦈'
  },
  {
    id: 'wizard',
    name: 'Memory Wizard',
    description: 'Magical mind',
    rarity: 'epic',
    price: 100,
    currency: 'tokens',
    unlockMethod: 'shop',
    icon: '🧙'
  },
  {
    id: 'crown',
    name: 'Champion',
    description: 'Hall of fame',
    rarity: 'legendary',
    price: 250,
    currency: 'tokens',
    unlockMethod: 'achievement', // Win 100 games
    icon: '👑'
  }
];

export const EMOTES = [
  {
    id: 'thinking',
    name: 'Thinking',
    description: 'Hmm...',
    price: 150,
    currency: 'coins',
    unlockMethod: 'shop',
    animation: 'thinking',
    icon: '🤔'
  },
  {
    id: 'gg',
    name: 'Good Game',
    description: 'Well played!',
    price: 150,
    currency: 'coins',
    unlockMethod: 'shop',
    animation: 'thumbs-up',
    icon: '👍'
  },
  {
    id: 'shocked',
    name: 'Shocked',
    description: 'No way!',
    price: 150,
    currency: 'coins',
    unlockMethod: 'shop',
    animation: 'shocked',
    icon: '😱'
  },
  {
    id: 'laugh',
    name: 'Laugh',
    description: 'HAHA!',
    price: 50,
    currency: 'tokens',
    unlockMethod: 'shop',
    animation: 'laugh',
    icon: '😂'
  },
  {
    id: 'mind_blown',
    name: 'Mind Blown',
    description: 'Incredible!',
    price: 100,
    currency: 'tokens',
    unlockMethod: 'shop',
    animation: 'explosion',
    icon: '🤯',
    particleEffect: 'sparkles'
  }
];

// Helper functions
export const getCosmeticById = (id) => {
  const allCosmetics = [...CARD_BACKS, ...TABLE_THEMES, ...AVATARS, ...EMOTES];
  return allCosmetics.find(item => item.id === id);
};

export const getCosmeticsByType = (type) => {
  const typeMap = {
    cardBack: CARD_BACKS,
    tableTheme: TABLE_THEMES,
    avatar: AVATARS,
    emote: EMOTES
  };
  return typeMap[type] || [];
};

export const getCosmeticsByRarity = (rarity) => {
  const allCosmetics = [...CARD_BACKS, ...TABLE_THEMES, ...AVATARS, ...EMOTES];
  return allCosmetics.filter(item => item.rarity === rarity);
};

export const getShopItems = () => {
  const allCosmetics = [...CARD_BACKS, ...TABLE_THEMES, ...AVATARS, ...EMOTES];
  return allCosmetics.filter(item => item.unlockMethod === 'shop');
};

export const RARITY_COLORS = {
  common: 'text-gray-400 border-gray-400',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-yellow-400 border-yellow-400'
};

export const RARITY_GLOW = {
  common: 'shadow-gray-400/20',
  rare: 'shadow-blue-400/30',
  epic: 'shadow-purple-400/40',
  legendary: 'shadow-yellow-400/50'
};
