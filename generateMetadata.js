const fs = require("fs");
const path = require("path");

const collectionName =
  process.env.COLLECTION_NAME || process.argv[2] || "assets";

function getFolders(basePath) {
  try {
    return fs
      .readdirSync(basePath)
      .filter((file) => fs.statSync(path.join(basePath, file)).isDirectory());
  } catch (error) {
    console.error("❌ Error reading base directory:", error);
    return [];
  }
}

function getImageFiles(folderPath) {
  try {
    return fs
      .readdirSync(folderPath)
      .filter(
        (file) =>
          fs.statSync(path.join(folderPath, file)).isFile() &&
          /\.(png|jpe?g|gif)$/i.test(file)
      );
  } catch (error) {
    console.error(`❌ Error reading folder ${folderPath}:`, error);
    return [];
  }
}

function generateMetadata() {
  const basePath = path.join(process.cwd(), "public", "assets", collectionName);
  const metadata = {};

  if (!fs.existsSync(basePath)) {
    console.error(
      `❌ Directory public/assets/${collectionName} doesn't exist.`
    );
    return;
  }

  const folders = getFolders(basePath);

  folders.forEach((folder) => {
    const folderPath = path.join(basePath, folder);
    const files = getImageFiles(folderPath);
    metadata[folder] = files;
  });

  // JSON OUTPUT
  const jsonOutputPath = path.join(basePath, `${collectionName}_metadata.json`);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(metadata, null, 2));

  // TS OUTPUT
  const keys = Object.keys(metadata);
  const interfaceStr = `interface ${collectionName}MetadataTraits {\n${keys
    .map((key) => `  ${key}: string[];`)
    .join("\n")}\n}\n`;
  const constStr = `const ${collectionName}_METADATA_TRAITS: ${collectionName}MetadataTraits = ${JSON.stringify(
    metadata,
    null,
    2
  )};\n\nexport { ${collectionName}_METADATA_TRAITS };`;
  const tsOutput = `${interfaceStr}\n${constStr}`;
  const tsOutputPath = path.join(basePath, `${collectionName}_traits.ts`);
  fs.writeFileSync(tsOutputPath, tsOutput);

  // Done
  console.log("✅ Metadata generated!");
  console.log(`📄 JSON saved: ${jsonOutputPath}`);
  console.log(`📄 TS saved: ${tsOutputPath}`);
}

generateMetadata();
