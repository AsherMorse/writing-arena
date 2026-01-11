export type QuestConfig = {
  name: string;
  openingNarrative: string;
};

export const QUEST_CONFIG: Record<string, QuestConfig> = {
  "dragons-lair": {
    name: "The Dragon's Lair",
    openingNarrative: `The cave mouth yawns before you, your torch casting dancing shadows on wet stone walls. The dragon's rumbling breath echoes from deep within, and the glint of gold teases from the darkness ahead. A narrow ledge hugs the left wall leading to higher ground, the main path slopes down through scattered bones, and a crack in the right wall looks just wide enough to squeeze through.`,
  },
  "shattered-kingdom": {
    name: "The Shattered Kingdom",
    openingNarrative: `The ancient road stretches before you, cracked stones overgrown with weeds. In the distance, the spires of a ruined castle pierce the gray sky. A merchant's cart lies overturned by the roadside, its contents scattered. The forest to your left rustles with movement, and smoke rises from a farmhouse chimney to your right.`,
  },
};

export const DEFAULT_QUEST_ID = "dragons-lair";

export const MAX_HEALTH = 100;
