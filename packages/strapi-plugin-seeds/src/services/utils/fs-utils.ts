import fs from "fs-extra";
import path from "path";

export const getSeedsFromDir = (dir: string) => {
  let seeds: {
    contentType: string;
    filename: string;
    fileLocation: string;
  }[] = [];
  fs.readdirSync(dir).forEach((contentType) => {
    const seedPath = path.join(dir, contentType);
    const contentTypeSeeds = fs
      .readdirSync(path.join(dir, contentType))
      .map((filename) => ({
        contentType,
        filename,
        fileLocation: path.join(seedPath, filename),
      }));
    seeds = [...seeds, ...contentTypeSeeds];
  });
  return seeds;
};

export const getSeedFromFile = <T extends any>(
  filePath: string,
): Promise<T> => {
  return fs.readJsonSync(filePath);
};
