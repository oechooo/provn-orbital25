// DiceBear avatar utility functions and types

export interface AvatarConfig {
  skinColor: string;
  hairColor: string;
  hair: string;
  eyes: string;
  mouth: string;
  accessories: string;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinColor: 'efcc9f',
  hairColor: '71472d',
  hair: 'shortHair',
  eyes: 'normal',
  mouth: 'teethSmile',
  accessories: 'none'
};

export const AVATAR_OPTIONS = {
  skinColor: [
    { value: 'ffe4c0', label: 'Light', color: '#ffe4c0' },
    { value: 'f5d7b1', label: 'Fair', color: '#f5d7b1' },
    { value: 'efcc9f', label: 'Medium', color: '#efcc9f' },
    { value: 'e2ba87', label: 'Tan', color: '#e2ba87' },
    { value: 'c99c62', label: 'Olive', color: '#c99c62' },
    { value: 'a47539', label: 'Brown', color: '#a47539' },
    { value: '8c5a2b', label: 'Dark', color: '#8c5a2b' },
    { value: '643d19', label: 'Deep', color: '#643d19' }
  ],
  hairColor: [
    { value: '3a1a00', label: 'Black', color: '#3a1a00' },
    { value: '220f00', label: 'Dark Brown', color: '#220f00' },
    { value: '71472d', label: 'Brown', color: '#71472d' },
    { value: 'd56c0c', label: 'Auburn', color: '#d56c0c' },
    { value: 'e2ba87', label: 'Light Brown', color: '#e2ba87' },
    { value: 'e9b729', label: 'Blonde', color: '#e9b729' },
    { value: '605de4', label: 'Purple', color: '#605de4' },
    { value: '238d80', label: 'Teal', color: '#238d80' }
  ],
  hair: [
    { value: 'shortHair', label: 'Short Hair' },
    { value: 'curlyShortHair', label: 'Curly Short' },
    { value: 'straightHair', label: 'Straight Hair' },
    { value: 'curlyBob', label: 'Curly Bob' },
    { value: 'wavyBob', label: 'Wavy Bob' },
    { value: 'bunHair', label: 'Bun' },
    { value: 'braids', label: 'Braids' },
    { value: 'froBun', label: 'Fro Bun' },
    { value: 'bangs', label: 'Bangs' },
    { value: 'bowlCutHair', label: 'Bowl Cut' },
    { value: 'halfShavedHead', label: 'Half Shaved' },
    { value: 'mohawk', label: 'Mohawk' },
    { value: 'shavedHead', label: 'Shaved Head' }
  ],
  eyes: [
    { value: 'normal', label: 'Normal' },
    { value: 'angry', label: 'Angry' },
    { value: 'cheery', label: 'Cheery' },
    { value: 'confused', label: 'Confused' },
    { value: 'sad', label: 'Sad' },
    { value: 'sleepy', label: 'Sleepy' },
    { value: 'starstruck', label: 'Starstruck' },
    { value: 'winking', label: 'Winking' }
  ],
  mouth: [
    { value: 'teethSmile', label: 'Teeth Smile' },
    { value: 'openedSmile', label: 'Open Smile' },
    { value: 'gapSmile', label: 'Gap Smile' },
    { value: 'awkwardSmile', label: 'Awkward Smile' },
    { value: 'kawaii', label: 'Kawaii' },
    { value: 'braces', label: 'Braces' },
    { value: 'openSad', label: 'Open Sad' },
    { value: 'unimpressed', label: 'Unimpressed' }
  ],
  accessories: [
    { value: 'none', label: 'None' },
    { value: 'catEars', label: 'Cat Ears' },
    { value: 'clownNose', label: 'Clown Nose' },
    { value: 'faceMask', label: 'Face Mask' },
    { value: 'glasses', label: 'Glasses' },
    { value: 'mustache', label: 'Mustache' },
    { value: 'sailormoonCrown', label: 'Sailor Moon Crown' },
    { value: 'sleepMask', label: 'Sleep Mask' },
    { value: 'sunglasses', label: 'Sunglasses' }
  ]
};

export const generateAvatarUrl = (config?: AvatarConfig, size: number = 200): string => {
  const baseUrl = 'https://api.dicebear.com/9.x/big-smile/svg';
  const finalConfig = config || DEFAULT_AVATAR_CONFIG;
  
  const params = new URLSearchParams({
    size: size.toString(),
    skinColor: finalConfig.skinColor,
    hairColor: finalConfig.hairColor,
    hair: finalConfig.hair,
    eyes: finalConfig.eyes,
    mouth: finalConfig.mouth,
    backgroundColor: 'transparent'
  });
  
  // Handle accessories properly for DiceBear API
  if (finalConfig.accessories && finalConfig.accessories !== 'none') {
    params.append('accessories', finalConfig.accessories);
    params.append('accessoriesProbability', '100');
  } else {
    // Ensure no accessories are shown
    params.append('accessoriesProbability', '0');
  }
  
  return `${baseUrl}?${params.toString()}`;
};

export const getRandomAvatarConfig = (): AvatarConfig => {
  const getRandomOption = (options: any[]) => 
    options[Math.floor(Math.random() * options.length)].value;
  
  return {
    skinColor: getRandomOption(AVATAR_OPTIONS.skinColor),
    hairColor: getRandomOption(AVATAR_OPTIONS.hairColor),
    hair: getRandomOption(AVATAR_OPTIONS.hair),
    eyes: getRandomOption(AVATAR_OPTIONS.eyes),
    mouth: getRandomOption(AVATAR_OPTIONS.mouth),
    accessories: getRandomOption(AVATAR_OPTIONS.accessories)
  };
};
