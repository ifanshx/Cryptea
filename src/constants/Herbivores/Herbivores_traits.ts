// src/constants/Herbivores/Herbivores_traits.ts

/**
 * @constant HERBIVORE_METADATA_TRAITS
 * @description Objek konstanta yang berisi daftar nilai sifat untuk setiap kategori metadata Herbivores.
 * Menggunakan `as const` untuk memastikan properti-propertinya adalah literal.
 */
export const HERBIVORE_METADATA_TRAITS = {
  Background: [
    "Planet ABC.PNG",
    "Planet Anemone.PNG",
    "Planet Magenta.PNG",
    "Planet Mars.PNG",
    "Planet Sahara.PNG",
    "Planet Savana.PNG",
    "Planet Violet.PNG",
    "Planet Vivid.PNG",
  ],
  Body: [
    "Ash.PNG",
    "Charcoal.PNG",
    "Cherry.PNG",
    "Chocolate.PNG",
    "Croc.PNG",
    "Fire.PNG",
    "Leopard.PNG",
    "Painting.PNG",
    "Rainbow.PNG",
    "Skelly.PNG",
    "Thunder Ice.PNG",
    "Vanilla.PNG",
  ],
  Eyes: [
    "Dive.PNG",
    "El Puppy.PNG",
    "Goat.PNG",
    "Jelly Puppy.PNG",
    "Jelly.PNG",
    "One.PNG",
    "Puppy.PNG",
    "Six.PNG",
    "Tech.PNG",
    "Thirteen.PNG",
    "Tribe.PNG",
  ],
  Head: [
    "Beanie.PNG",
    "Bird of Paradise.PNG",
    "Blue Dubbats.PNG",
    "Books.PNG",
    "Chocolate.PNG",
    "Crocs.PNG",
    "Horns.PNG",
    "King.PNG",
    "Macau.PNG",
    "Pirate.PNG",
    "Puppets.PNG",
    "Robot.PNG",
    "Shooting Star.PNG",
    "Smoking Star.PNG",
    "Vanilla.PNG",
    "White Dubbats.PNG",
  ],
  Mouth: [
    "Bone.PNG",
    "Butterfly.PNG",
    "Chain.PNG",
    "Fish.PNG",
    "Gaping.PNG",
    "Gold.PNG",
    "Grumble.PNG",
    "Grumpy.PNG",
    "Kiss.PNG",
    "Roses.PNG",
    "Smoke.PNG",
    "Teeth.PNG",
    "Tounge.PNG",
    "Weed.PNG",
  ],
  Neck: ["Belt.PNG", "Silver Chain.PNG", "Star Scarf.PNG", "Violet Scarf.PNG"],
} as const; // <--- PENTING: Tambahkan 'as const' di sini

/**
 * @typedef {typeof HERBIVORE_METADATA_TRAITS} HerbivoreMetadataTraits
 * @description Mendefinisikan tipe untuk struktur sifat-sifat metadata Herbivores.
 */
export type HerbivoreMetadataTraits = typeof HERBIVORE_METADATA_TRAITS;

/**
 * @constant HERBIVORE_LAYER_ORDER
 * @description Mendefinisikan urutan layer untuk rendering sifat Herbivores.
 * Menggunakan `as const` untuk memastikan array bersifat immutable dan tipe-nya adalah tuple literal.
 */
export const HERBIVORE_LAYER_ORDER = [
  "Background",
  "Body",
  "Eyes",
  "Head",
  "Mouth",
  "Neck",
] as const;

/**
 * @typedef {typeof HERBIVORE_LAYER_ORDER} HerbivoreLayerOrder
 * @description Mendefinisikan tipe untuk urutan layer sifat Herbivores.
 */
export type HerbivoreLayerOrder = typeof HERBIVORE_LAYER_ORDER;
