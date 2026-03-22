# Discordlate

Discordlate is a custom, standalone desktop injector for the official Discord desktop client that enables two-way, real-time message translation using Google Translate. It seamlessly integrates a native-looking settings modal and translation toggles directly into your Discord chat bar.

## Features

- 🌍 **Automated Two-Way Translation**: Write in your native language, and it automatically sends in the target language. Read any incoming foreign languages automatically translated to your preferred language.
- ⚙️ **Native UI Integration**: Adds a settings modal (⚙️) and a quick-toggle button directly inside Discord's chat bar, built using Discord's exact CSS variables.
- 🚀 **First-Run Guided Tour**: Includes an interactive UI popout to guide new users.
- 🛡️ **No Third-Party Frameworks**: It injects directly into the official `discord_desktop_core` without requiring heavy modded clients like Vencord or BetterDiscord.
- 🧹 **UI Debloat**: Hides native intrusive Discord buttons like Stickers and Gifts from your chat bar to make room for the language tools.

## Installation

You do not need to install any heavy modded clients. All you need is Node.js to run the one-time injector.

1. **Clone or Download** this repository to your computer.
2. Make sure you have **[Node.js](https://nodejs.org/)** installed.
3. Open a terminal (Command Prompt or PowerShell) inside the `Discordlate` folder.
4. Run the following command to inject the script into Discord:

   ```bash
   node injector.js
   ```

5. **Restart Discord** (Press `CTRL + R` or `CMD + R`, or completely close and reopen the app).

Upon restarting, Discordlate will automatically guide you through a quick tutorial to set up your preferred incoming and outgoing languages!

## Uninstallation

To remove Discordlate:
1. Open `%LOCALAPPDATA%\Discord` (Windows) or the equivalent Discord installation path on your OS.
2. Navigate to `app-<version>\modules\discord_desktop_core-<version>\discord_desktop_core`.
3. Open `index.js` in a text editor and remove the first `require` line added by the injector.
4. Restart Discord.

## Disclaimer

Modifying the Discord client violates Discord's Terms of Service. This script is provided for educational purposes only. Use it at your own risk. The author is not responsible for any account bans or issues that may arise from using this software.
