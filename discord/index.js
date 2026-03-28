const Discord = require("discord.js");
const globalfun = require("../functions/global.js");
const express = require("express");
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL"],
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
  ]
});
const app = express();
const global = new globalfun();

client.on("ready", () => {
  console.log("Discord Connected!")
  require("../views/index.js")(client, app);
  app.listen(global.config.web.port, function() { console.log("Started Project! @bucksh0tdev") });
  
  client.user.setActivity(global.config.bot.ready, {
    url: "https://www.twitch.tv/bucksh0tdev",
    type: "STREAMING"
  });

  global.autoreload();
});

/* Delete Server */
client.on("guildDelete", (guild) => {
  if(!guild?.id) return;
  if(global.db.get(`server_${guild.id}`)) {
    global.db.delete(`server_${guild.id}`);
  }
})

/* Delete Server */

/* Button Handle */
client.on("interactionCreate", async(interaction) => {
  if (!interaction.isButton()) return;
  
  if(!interaction.customId.startsWith("accept_") || !interaction.customId.startsWith("accept_")) return;
  let getid = interaction.customId.split("_")[1];
  
  if(interaction.customId.startsWith("decline_")) {
    
    let data = global.db.get(`server_${getid}`);
    if(!data) return interaction.message.delete().catch(err => err + "1");
    
    interaction.message.delete().catch(err => err + "1");
    
    global.db.delete(`server_${getid}`);
    interaction.reply({ content: `Başarıyla Red Edildi!`, ephemeral: true }).catch(err => err + "1");
  } else if(interaction.customId.startsWith("accept_")) {
    
    let data = global.db.get(`server_${getid}`);
    if(!data) return interaction.message.delete().catch(err => err + "1");
    
    interaction.message.delete().catch(err => err + "1");
    
    let editted = new Array(data);
    editted[0].status = 1;
    global.db.set(`server_${getid}`, editted[0]);
    
    interaction.reply({ content: `Başarıyla Onaylandı!`, ephemeral: true }).catch(err => err + "1");
  }
});
/* Button Handle */

/* BLACK LIST */
client.on("messageCreate", async(message) => {
  if(!message || !message.content || !message.author || message.author.bot || !global.config.bot.owner.includes(message.author.id)) return;
  
  if (message.content.startsWith(`!addblacklist`)) {
    let args = message.content.split(" ").slice(1) || [];
    let id = args[0];
    if(!id) return message.reply({ content: "Sunucu ID' si Girilmelidir!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");
      
    let control = global.db.get(`server_${id}`);
    if(!control) return message.reply({ content: "Sunucu Bulunamadı!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");
     
    control.status = 2;
    global.db.set(`server_${id}`, control);
    
    message.reply({ content: "Başarıyla Sunucu BlackList Kaydedildi!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");
  } else if (message.content.startsWith(`!removeblacklist`)) {
    let args = message.content.split(" ").slice(1) || [];
    let id = args[0];
    if(!id) return message.reply({ content: "Sunucu ID' si Girilmelidir!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");
      
    let control = global.db.get(`server_${id}`);
    if(!control) return message.reply({ content: "Sunucu Bulunamadı!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");
     
    control.status = 1;
    global.db.set(`server_${id}`, control);
    
    message.reply({ content: "Başarıyla Sunucu BlackList Kaldırıldı!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");
  } else if (message.content == "!blacklist") {

    let servers = [];
    let serversFilter = await global.db.all();
    let filtered = serversFilter.filter(x => x.ID.startsWith("server_") && x?.data?.status == 2);
    
    for (var i = 0; i < filtered.length; i++) {
      var obj = filtered[i].data;
      
      var objembed = {
        title: "BlackList ["+i+"]",
        fields: [
          {
            name: "IP",
            value: `\`\`${obj.ip}:${obj.port}\`\``
          },
          {
            name: "Sunucu",
            value: `\`\`${obj.server}\`\``
          },
          {
            name: "Açıklama",
            value: `\`\`\`${obj.long}\`\`\``
          },
          {
            name: "Beğenme",
            value: `\`\`\`${obj.likes.length}\`\`\``
          },
          {
            name: "Sahibi",
            value: `\`\`\`${obj.owner}\`\`\``
          }
        ]
      }

      message.reply({ embeds: [objembed], allowedMentions: { repliedUser: true }}).catch(err => err + "1");
    }

    message.reply({ content: "Tamamlandı!", allowedMentions: { repliedUser: true }}).catch(err => err + "1");

  }
  
});
/* BLACK LIST */

client.login(global.config.bot.token).catch(err => console.warn("Valid Discord Bot Token!"))