import * as fs from "fs-extra";

const packageJson = fs.readJsonSync("./package.json");

const developmentVersion = {
  ...packageJson,
  main: "dist/index.js",
};

fs.writeFileSync(
  "./package.json",
  JSON.stringify(developmentVersion, undefined, 2) + "\n",
  {
    encoding: "utf8",
  },
);
