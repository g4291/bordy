#!/usr/bin/env node
/**
 * Syncs version from package.json to src/version.ts
 * Run: node scripts/sync-version.js
 */
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const version = packageJson.version;

const versionFileContent = `// This file is auto-generated. Do not edit manually.
// Run 'npm run version:sync' to update from package.json
export const APP_VERSION = '${version}';
`;

const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts');

fs.writeFileSync(versionFilePath, versionFileContent, 'utf8');
console.log(`✅ Version synced: ${version}`);
