const fs = require('fs');
const path = require('path');

const LOCALAPPDATA = process.env.LOCALAPPDATA;
const discordPath = path.join(LOCALAPPDATA, 'Discord');

if (!fs.existsSync(discordPath)) {
    console.error('Discord installation not found in %LOCALAPPDATA%\\Discord');
    process.exit(1);
}

const folders = fs.readdirSync(discordPath).filter(f => f.startsWith('app-'));
if (folders.length === 0) {
    console.error('No Discord app folder found.');
    process.exit(1);
}

folders.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const latestVersion = folders[folders.length - 1];

const modulesPath = path.join(discordPath, latestVersion, 'modules');
const coreFolder = fs.readdirSync(modulesPath).find(f => f.startsWith('discord_desktop_core-'));

if (!coreFolder) {
    console.error('discord_desktop_core folder not found!');
    process.exit(1);
}

const corePath = path.join(modulesPath, coreFolder, 'discord_desktop_core', 'index.js');

if (!fs.existsSync(corePath)) {
    console.error(`index.js not found at ${corePath}`);
    process.exit(1);
}

const currentCode = fs.readFileSync(corePath, 'utf8');
const discordlateScriptPath = path.join(__dirname, 'discordlate.js').replace(/\\/g, '/');
const injectionString = `require('${discordlateScriptPath}');\n`;

if (currentCode.includes('discordlate.js')) {
    console.log('Discordlate is already injected!');
} else {
    fs.writeFileSync(corePath, injectionString + currentCode, 'utf8');
    console.log('Successfully injected Discordlate into Discord Core!');
    console.log(`Modified: ${corePath}`);
}
