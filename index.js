#!/usr/bin/env node
const fs = require('fs');
const axios = require('axios');
const path = require('path'); // Added for path handling

async function generateDocs() {
  try {
    // 1. Get the path of the package.json in the user's current folder
    const targetPath = path.join(process.cwd(), 'package.json');

    // Check if the file actually exists before trying to read it
    if (!fs.existsSync(targetPath)) {
      console.error("❌ Error: No package.json found in this directory. Are you in the right folder?");
      return;
    }

    const packageData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
    const dependencies = packageData.dependencies || {};
    const depNames = Object.keys(dependencies);

    if (depNames.length === 0) {
      console.log("No dependencies found in package.json!");
      return;
    }

    let markdownContent = "# Project Dependency Guide\n\n";
    markdownContent += "| Package | Description | Version |\n| --- | --- | --- |\n";

    console.log(`🔍 Found ${depNames.length} packages. Fetching data from npm...`);

    for (const name of depNames) {
      try {
        const response = await axios.get(`https://registry.npmjs.org/${name}`);
        const description = response.data.description || "No description available.";
        const version = dependencies[name];

        markdownContent += `| **${name}** | ${description} | \`${version}\` |\n`;
      } catch (error) {
        console.error(`Could not fetch data for ${name}`);
      }
    }

    // 3. Write to DEPENDENCIES.md in the user's current folder
    const outputPath = path.join(process.cwd(), 'DEPENDENCIES.md');
    fs.writeFileSync(outputPath, markdownContent);
    
    console.log("✅ DEPENDENCIES.md has been generated successfully!");

  } catch (err) {
    console.error("Error:", err.message);
  }
}

generateDocs();