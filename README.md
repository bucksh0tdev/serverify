# Serverify v1

Serverify v1 is a Node.js project built to list MTA:SA servers, collect votes, and verify submissions through Discord. The application has two parts:

- Discord bot
- Express-based web panel

Users sign in with Discord and submit their own servers from the panel. Submissions are sent to an approval channel in a specified Discord server. When a moderator approves a submission, the server appears in the list; when rejected, the record is removed.

## Key Features

- Sign-in system with Discord OAuth2
- Server submission flow based on Discord server ownership
- Button-based approve/reject workflow for submissions
- Newest servers page
- Most played servers page
- Most voted servers page
- User dashboard for servers added by the current user
- Simple JSON API output
- Dynamic logo resizing service
- Generation of `sitemap.xml`, `robots.txt`, and service worker (`sw.js`)
- Periodic caching of data from the official MTA:SA API
- Vote reset at configurable intervals

## How It Works

The core flow is:

1. The user signs in with a Discord account.
2. The user selects one of the Discord servers they own and submits an application.
3. The submitted IP and port are validated against MTA:SA API data.
4. The submission is posted to a Discord approval channel as a message with buttons.
5. If a moderator accepts it, the server is added to the active list.
6. Visitors can vote for servers in the list.

## Technologies

- Node.js 16.x
- Express
- EJS
- Discord.js v13
- Passport Discord
- csy.db
- Tailwind CSS
- Sharp
- Axios

## Project Structure

```text
serverify-v1/
├── config.js                # Base configuration
├── index.js                 # Application entry point
├── discord/
│   └── index.js             # Discord bot and web server bootstrap
├── functions/
│   └── global.js            # Shared helper functions and data access
├── views/
│   ├── index.js             # Express view setup
│   ├── libs/
│   │   ├── global.js        # Panel helpers, session and passport config
│   │   └── subs/main.js     # All route definitions
│   ├── styles/              # Tailwind sources and static assets
│   └── views/               # EJS page templates
└── databases/               # Local data files
```

## Requirements

Before running the project, make sure you have:

- Node.js `16.x`
- npm
- A created Discord application and bot
- Discord OAuth2 credentials
- A management Discord server where the bot is present
- A channel for incoming submission messages
- A domain or IP address for the web panel

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd serverify-v1
```

### 2. Install dependencies

```bash
npm install
```

### 3. Update configuration

Fill `config.js` according to your environment.

```js
module.exports = {
  refresh: 50000,
  voteRefresh: 604800000,
  maintence: false,
  web: {
    title: "Serverify",
    url: "http://IP:3000",
    description: "Mta-Sa Server Find/Share!",
    keywords: ["mta-sa", "mta-sa server", "mta-sa api"],
    port: 3000
  },
  bot: {
    id: "BOT ID",
    token: "BOT TOKEN",
    owner: ["BOT OWNER"],
    secret: "BOT OAUTH2 SECRET KEY",
    callback: "http://IP:3000/callback",
    scopes: ["identify", "guilds"],
    invite: "https://discord.com/oauth2/authorize?scope=bot+applications.commands&client_id=BOT-ID&permissions=8",
    server: "BOT APPROVAL SERVER",
    channel: "BOT APPROVAL CHANNEL",
    ready: "https://instagram.com/bucksh0tdev"
  }
}
```

### 4. Start the application

```bash
npm start
```

By default, the application runs on the `web.port` value in `config.js`.

## Tailwind Build

To rebuild style files:

```bash
npm run tailwind
```

This command compiles `views/styles/tailwindcss.css` and produces `views/styles/static/styles.css`.

## Important Configuration Fields

### `web`

- `title`: Site title
- `url`: Full panel URL
- `description`: Meta description
- `keywords`: SEO keywords
- `port`: Port used by the Express application

### `bot`

- `id`: Discord application ID
- `token`: Bot token
- `owner`: User IDs that can run blacklist commands
- `secret`: OAuth2 client secret
- `callback`: Discord login callback URL
- `scopes`: OAuth2 scopes
- `invite`: Bot invite link
- `server`: Discord server ID where submissions are managed
- `channel`: Channel ID where submissions are sent
- `ready`: Text shown as bot status

## Route Summary

### Web Pages

- `/`: Newest servers
- `/players`: Servers with the most players
- `/votes`: Most voted servers
- `/myservers`: Servers added by the current user
- `/request`: New server submission form
- `/login`: Sign in with Discord
- `/callback`: Discord OAuth callback route
- `/invite`: Bot invite link
- `/exit`: Logout

### API and Utility Routes

- `/api`: Returns active servers as JSON
- `/api/logo?width=128&height=128`: Returns logo resized to requested dimensions
- `/sitemap.xml`: Sitemap output
- `/robots.txt`: Robots file
- `/sw.js`: Basic service worker

## Data Structure

Project data is stored locally via `csy.db`. Server records are stored in the format `server_<discordServerId>`. A typical record includes fields like:

```js
{
  ip: "127.0.0.1",
  port: 22003,
  long: "Short description",
  server: 123456789012345678,
  status: 0,
  likes: [],
  owner: "user_id",
  date: 1710000000000
}
```

`status` field:

- `0`: Waiting for approval
- `1`: Active
- `2`: Blacklisted

## Approval and Management Flow

When a user submits an application, the bot sends a message with buttons to the configured management channel:

- `Accept`: Activates the server
- `Reject`: Deletes the record

Bot owners can also use these message commands:

- `!addblacklist <serverId>`
- `!removeblacklist <serverId>`
- `!blacklist`

## Notes and Caveats

- The `callback` URL must exactly match the redirect URL configured in the Discord Developer Portal.
- `web.url` should match the real public address of the panel.
- The bot must be able to join Discord servers where users will submit applications.
- Submission validation depends on the MTA:SA API cache. If a server is not visible in the API, the submission may fail.
- The `databases/` directory must be writable.

## Development Notes

- On startup, both the Discord bot and web panel run together.
- `global.autoreload()` regularly pulls MTA:SA API data.
- Votes are reset when `voteRefresh` duration expires.
- Error and 404 pages are served with custom EJS templates.

## License

This project is distributed under the `Apache-2.0` license.
