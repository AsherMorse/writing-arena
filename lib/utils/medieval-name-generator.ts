/**
 * @fileoverview Generates unique medieval/fantasy display names for users.
 * Pool size: 15 titles × 26 names × 15 epithets × 25 houses = 146,250 combinations
 */

const TITLES = [
  'Sir',
  'Lady',
  'Lord',
  'Dame',
  'Squire',
  'Knight',
  'Baron',
  'Baroness',
  'Duke',
  'Duchess',
  'Count',
  'Countess',
  'Sage',
  'Scribe',
  'Magister',
] as const;

const FIRST_NAMES = [
  'Aldric',
  'Elara',
  'Cedric',
  'Isolde',
  'Gareth',
  'Rowena',
  'Theron',
  'Lyra',
  'Edmund',
  'Seraphina',
  'Alaric',
  'Gwendolyn',
  'Roderick',
  'Elowen',
  'Osric',
  'Brynn',
  'Leofric',
  'Astrid',
  'Percival',
  'Rosalind',
  'Aldwin',
  'Mira',
  'Caspian',
  'Freya',
  'Hadrian',
  'Wren',
] as const;

const EPITHETS = [
  'the Bold',
  'the Wise',
  'the Swift',
  'the Brave',
  'the Clever',
  'the Curious',
  'the Wordsmith',
  'the Scribe',
  'the Storyteller',
  'the Eloquent',
  'the Thoughtful',
  'the Keen',
  'the Steadfast',
  'the Learned',
  'the Dreamer',
] as const;

const HOUSES = [
  'Ashford',
  'Blackwood',
  'Crowley',
  'Dunmore',
  'Everhart',
  'Fairfax',
  'Greystone',
  'Holloway',
  'Ironwood',
  'Jasper',
  'Kingsley',
  'Lockwood',
  'Montclair',
  'Northvale',
  'Oakenshield',
  'Pemberton',
  'Queensbury',
  'Ravencrest',
  'Stonebridge',
  'Thornwood',
  'Underhill',
  'Valorian',
  'Westbrook',
  'Yarrow',
  'Zephyrine',
] as const;

/**
 * @description Generates a random medieval-style display name.
 * Format: "Title FirstName the Epithet, House HouseName"
 * Example: "Lord Cedric the Wise, House Greystone"
 */
export function generateRandomName(): string {
  const title = TITLES[Math.floor(Math.random() * TITLES.length)];
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const epithet = EPITHETS[Math.floor(Math.random() * EPITHETS.length)];
  const house = HOUSES[Math.floor(Math.random() * HOUSES.length)];

  return `${title} ${firstName} ${epithet}, House ${house}`;
}

/**
 * @description Creates a Firestore-safe document ID from a name.
 * Converts to lowercase, replaces spaces with dashes, removes special chars.
 */
export function hashName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * @description Generates multiple unique name options (no duplicates in the batch).
 */
export function generateNameOptions(count: number): string[] {
  const names = new Set<string>();

  while (names.size < count) {
    names.add(generateRandomName());
  }

  return Array.from(names);
}
