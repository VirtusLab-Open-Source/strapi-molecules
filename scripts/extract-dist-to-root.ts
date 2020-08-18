import fs from "fs-extra";
import path from "path";

function getAllFilesFromDir(dir = "dist") {
  const distContent: string[] = [];
  fs.readdirSync(dir).forEach((file) => {
    distContent.push(file);
  });
  fs.writeJsonSync("./dist-content.json", { distContent });
  validateDist(distContent);
  fs.copySync(path.join(process.cwd(), dir), process.cwd(), {
    overwrite: false,
    errorOnExist: true,
  });
}

function validateDist(distContent: string[]) {
  const existingFiles = distContent.filter(fs.existsSync);
  console.log(existingFiles);
  if (existingFiles.length) {
    throw new Error(
      `"${existingFiles.join(", ")}" already exist(s) in root directory`,
    );
  }
}

getAllFilesFromDir();
