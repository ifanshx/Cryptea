// constants/traitsConfig.ts

import { METADATA_TRAITS as HERBIVORES_TRAITS } from "./Herbivores/Herbivores_traits";

import { METADATA_TRAITS as ETHEREALENTITIES_TRAITS } from "./EtherealEntities/EtherealEntities_traits";

export const TRAITS_CONFIG = {
  Herbivores: {
    traits: HERBIVORES_TRAITS,
    layerOrder: [
      "Background",
      "Body",
      "Eyes",
      "Head",
      "Mouth",
      "Neck",
    ] as const,
  },
  EtherealEntities: {
    traits: ETHEREALENTITIES_TRAITS,
    layerOrder: [
      "Background",
      "Body",
      "Eyes",
      "Head",
      "Mouth",
      "Neck",
    ] as const,
  },
};
