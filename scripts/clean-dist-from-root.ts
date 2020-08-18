import fs from "fs-extra";

function removeExtractedFromDist() {
  if (fs.existsSync("dist-content.json")) {
    const { distContent } = fs.readJsonSync("./dist-content.json") as {
      distContent: string[];
    };
    distContent.forEach((file) => {
      fs.removeSync(file);
    });
    fs.removeSync("./dist-content.json");
  }
}

removeExtractedFromDist();
