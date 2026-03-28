const axios = require("axios");
const fs = require("fs");
const passport = require("passport");
const sharp = require('sharp');
const path = require('path');
const Discord = require("discord.js");
module.exports = function(app, global, panel, client) {

app.all("/", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);

  let servers = [];
  let serversFilter = await global.db.all();
  let filtered = serversFilter.filter(x => x.ID.startsWith("server_") && x?.data?.status == 1);
  
  
  for (var i = 0; i < filtered.length; i++) {
    var obj = filtered[i].data;

    /* Data Control & Data info */
    let findserver = await global.ipverify(obj?.ip, obj?.port);
    if(!findserver) continue;

    servers.push({ id: obj.server, likes: obj.likes.length, ip: obj.ip, port: obj.port, players: findserver.players, maxplayers: findserver.maxplayers, name: findserver.name, desc: obj.long, date: obj.date })
  }
  
  servers.sort((x, y) => y.date - x.date);
  
  panel.download(res, req, "index.ejs", { servers });
});
  
app.all("/players", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  let servers = [];
  let serversFilter = await global.db.all();
  let filtered = serversFilter.filter(x => x.ID.startsWith("server_") && x?.data?.status == 1);
  
  for (var i = 0; i < filtered.length; i++) {
    var obj = filtered[i].data;

    /* Data Control & Data info */
    let findserver = await global.ipverify(obj?.ip, obj?.port);
    if(!findserver) continue;

    servers.push({ id: obj.server, likes: obj.likes.length, ip: obj.ip, port: obj.port, players: findserver.players, maxplayers: findserver.maxplayers, name: findserver.name, desc: obj.long })
  }
  
  servers.sort((x, y) => y.players - x.players);
  
  panel.download(res, req, "players.ejs", { servers });
});
  
app.all("/vote/:id/:type", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  if (!req.isAuthenticated()) return res.redirect(global.config.web.url+"/login");
  
  let id = req?.params?.id;
  let type = req?.params?.type;
  if(!id || isNaN(Number(id)) || (type != 1 && type != 2 && type != 3)) return res.redirect(global.config.web.url); 
  
  let serversFilter = await global.db.all();
  let filtered = await serversFilter.find(x => x.ID.startsWith("server_") && x?.data?.status == 1 && x?.data?.server == id);
  if(!filtered) return res.redirect(global.config.web.url); 
  
  let already = await filtered.data.likes.find(x => x == req?.user?.id);
  if(already) return res.redirect(global.config.web.url);
  
  filtered.data.likes.push(req?.user?.id);
  global.db.set(filtered.ID, filtered.data);
  
  if(type == 2) res.redirect(global.config.web.url+"/votes");
  if(type == 3) res.redirect(global.config.web.url+"/myservers");
  return res.redirect(global.config.web.url);
});
  
app.all("/votes", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  let servers = [];
  let serversFilter = await global.db.all();
  let filtered = serversFilter.filter(x => x.ID.startsWith("server_") && x?.data?.status == 1);
  
  for (var i = 0; i < filtered.length; i++) {
    var obj = filtered[i].data;

    /* Data Control & Data info */
    let findserver = await global.ipverify(obj?.ip, obj?.port);
    if(!findserver) continue;
    
    servers.push({ id: obj.server, likes: obj.likes.length, ip: obj.ip, port: obj.port, players: findserver.players, maxplayers: findserver.maxplayers, name: findserver.name, desc: obj.long })
  }
  
  servers.sort((x, y) => y.likes - x.likes);
  
  panel.download(res, req, "votes.ejs", { servers });
});
  
app.all("/myservers", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  if (!req.isAuthenticated()) return res.redirect(global.config.web.url+"/login");
  
  let servers = [];
  let serversFilter = await global.db.all();
  let filtered = serversFilter.filter(x => x.ID.startsWith("server_") && x.data.owner == req?.user?.id && (x?.data?.status == 1 || x?.data?.status == 0));
  
  for (var i = 0; i < filtered.length; i++) {
    var obj = filtered[i].data;

    /* Data Control & Data info */
    let findserver = await global.ipverify(obj?.ip, obj?.port);
    if(!findserver) continue;
    
    servers.push({ id: obj.server, likes: obj.likes.length, ip: obj.ip, port: obj.port, players: findserver.players, maxplayers: findserver.maxplayers, name: findserver.name, desc: obj.long })
  }
  
  servers.sort((x, y) => y.likes - x.likes);
  
  panel.download(res, req, "myservers.ejs", { servers });
});
  
app.all("/api", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  let servers = [];
  let serversFilter = await global.db.all();
  let filtered = serversFilter.filter(x => x.ID.startsWith("server_") && x?.data?.status == 1);

  for (var i = 0; i < filtered.length; i++) {
    var obj = filtered[i].data;

    /* Data Control & Data info */
    let findserver = await global.ipverify(obj?.ip, obj?.port);
    if(!findserver) continue;
    
    servers.push({ likes: obj.likes.length, ip: obj.ip, port: obj.port, players: findserver.players, maxplayers: findserver.maxplayers, name: findserver.name, desc: obj.long })
  }
  
  servers.sort((x, y) => x.likes.length - y.likes.length);
  
  res.status(200).json(servers);
});

app.all("/login", async(req, res, next) => {
    if(global.maintence) return res.status(201).send(global.maintence);
    
    if (req.isAuthenticated()) return res.redirect(global.config.web.url);
    next();
  },
  passport.authenticate("discord", { prompt: 'none' }));
  
app.all("/callback", function (req, res, next) { 
  if(global.maintence) return res.status(201).send(global.maintence);
  
  return passport.authenticate("discord", { failureRedirect: "/" }, async function (err, user, info) {
    if (err) {
        err + "1"
        return panel.download(res, req, "error.ejs", { error: 403, message: "Discord Giriş Limitine Ulaştınız Tekrar Deneyin!" });
    }
    await req.login(user, function (e) {
        if (e) return next(e);
        return next();
    });
})(req, res, next); }, async function (req, res) {
    res.redirect(global.config.web.url)
});

app.get("/request", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  if(!req?.isAuthenticated() || !req?.user?.id) return res.redirect(global.config.web.url+"/login")
  let ownguilds = [];
  
  for (var i = 0; i < req?.user?.guilds?.length; i++) {
    if(!req?.user?.guilds || !req?.user?.guilds[i]) break;
    let guild = req?.user?.guilds[i];
    if(!guild.owner) continue;
    ownguilds.push(guild);
  }
  
  panel.download(res, req, "request.ejs", { ownguilds, message: null });
});
  
app.all("/invite", (req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  let link = global.config.bot.invite;
  let guild_id = req?.query?.guild;
  if(guild_id) link += "&guild_id="+Number(guild_id);
  res.redirect(link);
});
  
app.post("/request", async(req, res) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  if(!req?.isAuthenticated() || !req?.user?.id) return res.redirect(global.config.web.url+"/login")
  let ownguilds = [];
  
  for (var i = 0; i < req?.user?.guilds?.length; i++) {
    if(!req?.user?.guilds || !req?.user?.guilds[i]) break;
    let guild = req?.user?.guilds[i];
    if(!guild.owner) continue;
    ownguilds.push(guild);
  }
  
  
  const { server, ip, port, longdetails, details, license } = req?.body;
  
  if(!server) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Boş Bırakılamaz", "desc": "Server Boş Bırakılamaz", "type": "error" } });
  if(!ip) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Boş Bırakılamaz", "desc": "Ip Boş Bırakılamaz", "type": "error" } });
  if(!port) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Boş Bırakılamaz", "desc": "Port Boş Bırakılamaz", "type": "error" } });
  if(!details) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Boş Bırakılamaz", "desc": "Açıklama Boş Bırakılamaz", "type": "error" } });
  if(!longdetails) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Boş Bırakılamaz", "desc": "Kısa Açıklama Boş Bırakılamaz", "type": "error" } });
  if(!license) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Boş Bırakılamaz", "desc": "Koşulları Kabul Ettmelisiniz!", "type": "error" } });
  
  if(details.length < 20 || details.length > 120) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Karakter Limiti!", "desc": "Açıklama Kısmına Minimum 20 Karakter Maximum 120 Karakter Girilmelidir!", "type": "error" } });
  if(longdetails.length < 7 || longdetails.length > 50) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Karakter Limiti!", "desc": "Kısa Açıklama Kısmına Minimum 20 Karakter Maximum 50 Karakter Girilmelidir!", "type": "error" } });
  
  let ipverify = await global.ipverify(ip, port);
  if(!ipverify) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Sunucuya Ulaşılamadı", "desc": "Girilen Bilgilerle Uyuşan Sunucu Bulunmuyor.", "type": "error" } });
  
  let servercontrol = await global.guildcontrol(server);
  if(!servercontrol) {
    if(!isNaN(Number(server)))
    return panel.download(res, req, "request.ejs", { ownguilds, message: { type: "bot", "id": Number(server) } });
    return panel.download(res, req, "request.ejs", { ownguilds, message: { type: "bot", "id": null } });
  }
  
  if(global.db.get(`server_${servercontrol.id}`)) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Zaten Listede!", "desc": "Discord Sunucusu Kullanılmaktadır.", "type": "error" } });
  let filterrule = await global.db.all();
  if(filterrule.find(x => x?.data?.ip == String(ip) && x?.data?.port == Number(port))) return panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Zaten Listede!", "desc": "Sunucu Zaten Kullanılmaktadır!", "type": "error" } });
  
  /* Register */
  global.db.set(`server_${servercontrol.id}`, {
    ip: String(ip),
    port: Number(port),
    long: String(longdetails),
    server: Number(servercontrol.id),
    status: 0,
    likes: [],
    owner: req?.user?.id,
    date: new Date().getTime()
  });
  /* Register */
  
  let getserver = await client.guilds.cache.get(global.config.bot.server);
  if(!getserver) console.warn("Official Server ID Problem!");
  let getchannel = await getserver.channels.cache.get(global.config.bot.channel);
  if(!getchannel) console.warn("Official Channel ID Problem!");
  
  const row = new Discord.MessageActionRow()
  .addComponents(
    new Discord.MessageButton()
      .setCustomId(`accept_${servercontrol.id}`)
      .setLabel(`Kabul`)
      .setStyle(3)
  )
  .addComponents(
    new Discord.MessageButton()
      .setCustomId(`decline_${servercontrol.id}`)
      .setLabel(`red`)
      .setStyle(4)
  );
  
  getchannel.send({ components: [row], embeds: [{
    title: `Yeni Başvuru. (${String(ip)}:${Number(port)})`,
    fields: [
      {
        name: "Sunucu IP",
        value: `\`\`${String(ip)}:${Number(port)}\`\``
      },
      {
        name: "Sunucu İsmi",
        value: `\`\`${global.filter(ipverify.name)}\`\``
      },
      {
        name: "Sunucu Oyuncu",
        value: `\`\`${Number(ipverify.maxplayers)}/${Number(ipverify.players)}\`\``
      },
      {
        name: "Başvuru Yapan",
        value: `\`\`${req?.user.username}#${req?.user.discriminator}\`\``
      },
      {
        name: "Kısa Açıklama",
        value: `\`\`\`${global.filter(longdetails)}\`\`\``
      },
      {
        name: "Açıklama",
        value: `\`\`\`${global.filter(details)}\`\`\``
      },
      {
        name: "ID",
        value: `\`\`\`${global.filter(servercontrol.id)}\`\`\``
      },
    ]
  }] });
  
  panel.download(res, req, "request.ejs", { ownguilds, message: { title: "Başarılı!", "desc": "Başarıyla Başvuru Listesine Kayıt Edildiniz.", "type": "success" } });
});
  
app.all("/exit", async(req, res, next) => {
  if(global.maintence) return res.status(201).send(global.maintence);
  
  if (!req.isAuthenticated()) return res.redirect(global.config.web.url);
    req.session.destroy(() => {
      req.logout({}, () => {});
      res.redirect(global.config.web.url);
    });
});
  
app.all("/api/logo", (req, res) => {

  const widthString = req.query.width || 128
  const heightString = req.query.height || 128

  let width, height
  if (widthString) {
    width = parseInt(widthString)
  }
  if (heightString) {
    height = parseInt(heightString)
  }

  res.type(`image/png`);

  function resize(path, width, height) {
    const readStream = fs.createReadStream(path)
    let transform = sharp()

    if (width || height) {
      transform = transform.resize(width, height)
    }

    return readStream.pipe(transform)
  }
  
  resize(path.join(__dirname, "/../../styles/logo.png"), width, height).pipe(res)
});
  
app.all('/sitemap.xml', async function(req, res, next){
  let xml_content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd"',
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    '    <loc>' + global.config.web.url + '</loc>',
    '    <lastmod>' + global.date() + '</lastmod>',
    '  </url>',
    '  <url>',
    '    <loc>' + global.config.web.url + '/votes</loc>',
    '    <lastmod>' + global.date() + '</lastmod>',
    '  </url>',
    '  <url>',
    '    <loc>' + global.config.web.url + '/players</loc>',
    '    <lastmod>' + global.date() + '</lastmod>',
    '  </url>',
    '  <url>',
    '    <loc>' + global.config.web.url + '/invite</loc>',
    '    <lastmod>' + global.date() + '</lastmod>',
    '  </url>',
    '</urlset>'
  ]
  
  res.set('Content-Type', 'text/xml')
  res.status(200);
  res.send(xml_content.join('\n'))
});
  
app.all("/robots.txt", async function (req, res, next){

  let robots_content = [
    'Sitemap: ' + global.config.web.url + '/sitemap.xml',
    'User-agent:*',
    'Disallow'
  ]
  
  
    res.type('text/plain');
    res.send(robots_content.join('\n'))

});
  
app.all("/sw.js", async function (req, res, next) {
        
  let content = [
    "self.addEventListener('install', e => console.log('pwa installed.'));",
    "self.addEventListener('fetch', event => {});"
  ]
  
  
  res.set('Content-Type', 'text/javascript');
  res.status(200);
  res.send(content.join('\n'));
  
});
  
};