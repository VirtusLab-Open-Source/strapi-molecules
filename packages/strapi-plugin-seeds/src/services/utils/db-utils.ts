import { getSeedFromFile } from "./fs-utils";
import { SEEDS_TABLE } from "./constants";

type Timestamp = number;
type Seed = {
  id: number;
  contentType: string;
  filename: string;
  created_at: Timestamp;
};

export const getCreatedSeeds = (): Promise<Seed[]> => {
  const knex = global.strapi.connections.default;
  return knex.select().from(SEEDS_TABLE);
};

export const syncDBwithSeed = (
  seeds: { contentType: string; filename: string; fileLocation: string }[],
) => {
  return Promise.all(
    seeds.map((seed) =>
      global.strapi.services[seed.contentType].create(
        getSeedFromFile(seed.fileLocation),
      ),
    ),
  );
};

export const updateSeedsTable = (
  seeds: { contentType: string; filename: string; fileLocation: string }[],
) => {
  const knex = global.strapi.connections.default;
  seeds.forEach(({ contentType, filename }) => {
    knex(SEEDS_TABLE)
      .insert({
        contentType,
        filename,
      })
      .then();
  });
};
