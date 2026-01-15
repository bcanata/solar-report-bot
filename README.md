# Solar Report Bot ☀️

A Cloudflare Worker that automatically posts daily solar data reports to a Telegram group. Designed for amateur radio operators to monitor solar conditions that affect radio propagation.

## Features

- **Automated Daily Reports** - Scheduled to run every day at 8 AM UTC
- **Solar Data Visualization** - Posts real-time solar activity charts from [hamqsl.com](https://www.hamqsl.com)
- **Telegram Integration** - Sends formatted messages and images to your group
- **Error Notifications** - Reports any issues to the master user
- **Secure Configuration** - Uses Cloudflare Workers secrets for sensitive data

## How It Works

The worker triggers on a cron schedule (`0 8 * * *` = daily at 8 AM UTC) and:

1. Sends a text message to the target Telegram group
2. Fetches and posts a solar propagation chart from `hamqsl.com/solarvhf.php`
3. Reports any errors to the configured master user

## Prerequisites

- [Node.js](https://nodejs.org/) (for `wrangler` CLI)
- A [Cloudflare](https://cloudflare.com) account with Workers enabled
- A [Telegram Bot Token](https://core.telegram.org/bots#how-do-i-create-a-bot)
- Telegram Group Chat ID and Master User ID

## Installation

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Clone or Download This Repository

```bash
git clone https://github.com/bcanata/solar-report-bot.git
cd solar-report-bot
```

### 4. Configure Environment Secrets

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
# Paste your bot token when prompted

wrangler secret put TARGET_CHAT_ID
# Paste your target group chat ID (e.g., -1001415136439)

wrangler secret put MASTER_ID
# Paste your master Telegram user ID for error notifications
```

### 5. Deploy

```bash
wrangler deploy
```

## Configuration

The worker is configured via `wrangler.toml`:

```toml
name = "solar-report-bot"
main = "index.js"
compatibility_date = "2024-01-01"
account_id = "your-account-id"

[triggers]
crons = ["0 8 * * *"]  # Daily at 8 AM UTC
```

To change the schedule, modify the cron expression. Examples:
- `0 8 * * *` - Daily at 8 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 12 * * 1-5` - Weekdays at noon UTC

## Getting Telegram IDs

### Bot Token
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Use `/newbot` and follow the instructions
3. Copy the API token

### Chat ID
1. Add your bot to the target group
2. Send a message in the group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find the `chat.id` in the response (negative for groups)

### Master User ID
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your numeric user ID

## Usage

### View Real-Time Logs

```bash
wrangler tail
```

### Test Locally

```bash
wrangler dev
```

### List Deployed Versions

```bash
wrangler versions list
```

## Project Structure

```
solar-report-bot/
├── index.js          # Main worker code
├── wrangler.toml     # Cloudflare Workers configuration
├── CLAUDE.md         # Development documentation
└── README.md         # This file
```

## Code Architecture

The worker is organized into clear sections:

- **Constants** - API endpoints and fixed values
- **Configuration** - Environment variable validation and retrieval
- **Telegram API** - Wrapper for Telegram Bot API calls
- **Error Handling** - Error reporting to master user
- **Main Handlers** - Scheduled report generation

## Security

- All sensitive data (bot token, chat IDs) is stored as Cloudflare Workers secrets
- No credentials are hardcoded in the source code
- Secrets are encrypted at rest and in transit

## License

MIT License - feel free to use and modify for your own amateur radio group.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## About

This bot was created to help amateur radio operators monitor daily solar conditions that affect HF/VHF propagation. Solar data is sourced from [HamQSL](https://www.hamqsl.com/solar.html).

---

**Made with ❤️ for amateur radio operators**
