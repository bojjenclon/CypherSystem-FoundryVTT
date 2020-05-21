export const CYPHER_SYSTEM = {};

CYPHER_SYSTEM.weightClasses = [
  'Light',
  'Medium',
  'Heavy'
];

CYPHER_SYSTEM.weaponTypes = [
  'Bashing',
  'Bladed',
  'Ranged',
]

CYPHER_SYSTEM.stats = [
  'Might',
  'Speed',
  'Intellect',
];

CYPHER_SYSTEM.skillLevels = {
  'i': 'Inability',
  'u': 'Untrained',
  't': 'Trained',
  's': 'Specialized'
};

CYPHER_SYSTEM.types = [
  {
    abbrev: 'a',
    name: 'Arkus',
  },
  {
    abbrev: 'd',
    name: 'Delve',
  },
  {
    abbrev: 'g',
    name: 'Glaive',
  },
  {
    abbrev: 'j',
    name: 'Jack',
  },
  {
    abbrev: 'n',
    name: 'Nano',
  },
  {
    abbrev: 'w',
    name: 'Wright',
  },
];

CYPHER_SYSTEM.typePowers = {
  'g': 'Combat Maneuvers',
  'j': 'Tricks of the Trade',
  'n': 'Esoteries',
  'a': 'Precepts',
  'd': 'Delve Lores',
  'w': 'Inspired Techniques',
};

CYPHER_SYSTEM.damageTrack = [
  {
    label: 'Hale',
    description: 'Normal state for a character.'
  },
  {
    label: 'Impaired',
    description: 'In a wounded or injured state. Applying Effort costs 1 extra point per effort level applied.'
  },
  {
    label: 'Debilitated',
    description: 'In a critically injured state. The character can do no other action than to crawl an immediate distance; if their Speed pool is 0, they cannot move at all.'
  },
  {
    label: 'Dead',
    description: 'The character is dead.'
  }
];

CYPHER_SYSTEM.recoveries = {
  'action': '1 Action',
  'tenMin': '10 min',
  'oneHour': '1 hour',
  'tenHours': '10 hours'
};

CYPHER_SYSTEM.advances = {
  'statPools': '+4 to stat pools',
  'effort': '+1 to Effort',
  'edge': '+1 to Edge',
  'skillTraining': 'Train/specialize skill',
  'other': 'Other',
};

CYPHER_SYSTEM.ranges = [
  'Immediate',
  'Short',
  'Long',
  'Very Long'
];

CYPHER_SYSTEM.optionalRanges = ["N/A"].concat(CYPHER_SYSTEM.ranges);

CYPHER_SYSTEM.abilityTypes = [
  'Action',
  'Enabler',
];

CYPHER_SYSTEM.supportsMacros = [
  'skill'
];
