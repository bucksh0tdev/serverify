module.exports = {
  "refresh": 50000,
  "voteRefresh": 604800000,
  "maintence": false,
  "web": {
    "title": "Serverify",
    "url": "http://IP:3000",
    "description": "Mta-Sa Sunucu Bul/Paylaş!",
    "keywords": ["mta-sa", "mta-sa sunucu", "mta-sa api"],
    "port": 3000
  },
  "bot": {
    "id": "BOT ID",
    "token": "BOT TOKEN",
    "owner": ["BOT OWNER"],
    "secret": "BOT OAUTH2 SECRET KEY",
    "callback": "http://IP:3000/callback",
    "scopes": ["identify", "guilds"],
    "invite": "https://discord.com/oauth2/authorize?scope=bot+applications.commands&client_id=BOT-ID&permissions=8",
    "server": "BOT APPROVE SERVER",
    "channel": "BOT APPROVE CHANNEL",
    "ready": "https://instagram.com/bucksh0tdev"
  }
}