import fs from "fs-extra";
import path from "path";
import { isEmpty } from "lodash";
import {
  getCreatedSeeds,
  getSeedsFromDir,
  syncDBwithSeed,
  updateSeedsTable,
} from "./utils";

export const generateFromDir = async (dir: string) => {
  try {
    const seedsDir = path.join(global.strapi.dir, dir);
    if (!fs.existsSync(seedsDir)) {
      global.strapi.log.warn(
        `[strapi-plugin-seeds]: seeds directory doesn't exist in Strapi Root, please create: ${seedsDir}`,
      );
      return;
    }
    const seeds = getSeedsFromDir(seedsDir);

    if (isEmpty(seeds)) {
      global.strapi.log.info(`[strapi-plugin-seeds]: No seeds found`);
      return;
    }
    const existingSeeds = await getCreatedSeeds();
    const seedsToSave = seeds.filter(
      (s) =>
        !existingSeeds.find(
          ({ contentType, filename }) =>
            contentType === s.contentType && filename === s.filename,
        ),
    );
    await syncDBwithSeed(seedsToSave);
    await updateSeedsTable(seedsToSave);
    global.strapi.log.info(
      `[strapi-plugin-seeds]: Created ${seedsToSave.length} seed(s):` +
        seedsToSave
          .map((s) => `[strapi-plugin-seeds]: ${s.contentType} - ${s.filename}`)
          .join("\n"),
    );
  } catch (e) {
    global.strapi.log.warn(
      "[strapi-plugin-seeds]: Cannot seed database with initial data",
    );
    global.strapi.log.trace(e);
  }
};
