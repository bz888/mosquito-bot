# Mosquito Bot (ts)

Mosquito Bot is a Discord bot that joins a specified voice channel and plays an audio file when specific users start talking. The bot pauses the audio when the users stop talking and resumes from where it left off when they start talking again.

Annoy your friends.

## Prerequisites
- Node.js v16 or higher
- Discord bot token. Instructions [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)

## Installation

1. Clone the repository
2. `npm install`
3. Setup `.env` follow `.env.example`
4. `npm run dev` or `npm run build && npm start`

## Commands
- `mos!play` Test audioFile
- `mos!start` Turn on
- `mos!stop` Turn off