# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Worker that runs as a scheduled Telegram bot for sending daily solar data reports to an amateur radio group. The worker triggers daily at 8 AM UTC to post solar activity visualizations from hamqsl.com.

## Common Commands

```bash
# Deploy the worker to Cloudflare
wrangler deploy

# Run the worker locally with hot-reload
wrangler dev

# View real-time logs from deployed worker
wrangler tail

# List deployed versions
wrangler versions list

# Manage environment secrets (recommended for bot token)
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put MASTER_ID
wrangler secret put TARGET_CHAT_ID
```

## Architecture

The worker has a minimal single-file architecture:

- **wrangler.toml** - Cloudflare Worker configuration with cron schedule (`0 8 * * *` = daily at 8 AM UTC)
- **index.js** - Main worker logic

### Event Flow

1. Cron trigger fires → `addEventListener('scheduled', ...)` catches it
2. `handleSchedule()` executes → sends Telegram messages via `tg()` helper
3. Success → returns HTTP 200
4. Error → caught and reported to master user via Telegram

### Telegram Integration

The worker uses a custom `tg()` wrapper function that:
- Makes POST requests to `https://api.telegram.org/bot{token}/{method}`
- Sends errors to a master user ID if API calls fail
- Supports any Telegram Bot API method (sendmessage, sendphoto, etc.)

### Hardcoded Configuration

Current implementation has these hardcoded in index.js:
- Telegram bot token
- Bot username (`@hossohbot`)
- Target chat ID (`-1001415136439`)
- Master user ID for error notifications (`1086689251`)

Consider migrating these to environment secrets for better security.

## No Build Process

This is pure JavaScript with no package.json, dependencies, or build steps. Simply deploy directly with `wrangler deploy`.
