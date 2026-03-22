const electron = require('electron');
const path = require('path');
const fs = require('fs');

// Log that we are running
console.log('[Discordlate] Main process script loaded!');

// Safely modify CSP to allow external translation requests from the browser context
try {
    const { session } = electron;
    if (session && session.defaultSession) {
        session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
            const responseHeaders = Object.assign({}, details.responseHeaders);
            
            // Delete CSP headers so our injected script can access googleapis
            for (const header in responseHeaders) {
                if (header.toLowerCase() === 'content-security-policy') {
                    delete responseHeaders[header];
                }
            }
            callback({ cancel: false, responseHeaders: responseHeaders });
        });
        console.log('[Discordlate] CSP successfully bypassed.');
    }
} catch (e) {
    console.error('[Discordlate] Failed to hook webRequest for CSP:', e);
}

electron.app.on('browser-window-created', (e, win) => {
    win.webContents.on('dom-ready', () => {
        const url = win.webContents.getURL();
        if (url.includes('discord.com/app') || url.includes('discordapp.com/app')) {
            console.log('[Discordlate] Discord App Loaded. Injecting payload...');
            const payloadPath = path.join(__dirname, 'payload.js');
            
            try {
                const payloadCode = fs.readFileSync(payloadPath, 'utf8');
                win.webContents.executeJavaScript(payloadCode).then(() => {
                    console.log('[Discordlate] Payload injected successfully!');
                }).catch(err => {
                    console.error('[Discordlate] Failed to inject payload:', err);
                });
            } catch (err) {
                console.error('[Discordlate] Could not read payload.js:', err);
            }
        }
    });
});
