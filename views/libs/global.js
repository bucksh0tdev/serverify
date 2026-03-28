const path = require("path");
const axios = require("axios");
const express = require("express");
const Strategy = require("passport-discord").Strategy;
const passport = require("passport");
const fs = require("fs");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const globalfun = require("../../functions/global.js");
module.exports = function (app, listener) {
const global = new globalfun();
  
const mainlocation = path.resolve(`${process.cwd()}${path.sep}views`);
const templateslocation = path.resolve(`${mainlocation}${path.sep}views${path.sep}`);
  
this.download = async function(res, req, template, data = {}) {
  
let headshortcut = require(path.join(__dirname, "shortcuts/head.js"));
let pwashortcut = require(path.join(__dirname, "shortcuts/pwa.js"));
let realfooter = require(path.join(__dirname, "shortcuts/realfooter.js"));
let footerdesingshortcut = require(path.join(__dirname, "shortcuts/footerdesing.js"));
let pages = await global.pages(template);
  
    const baseData = {
      user: (req.user) ? req.user : null,
      base: global.config.web.url,
      path: req.path,
      global,
      head: headshortcut(global, template), 
      pwa: pwashortcut(global, template),
      footerdesing: footerdesingshortcut(global, template),
      realfooter: realfooter(global, template),
      pages
    };
    res.render(path.resolve(`${templateslocation}${path.sep}${template}`), Object.assign(baseData, data), /*{ async: true } */);
    
};
  
this.setup = function() {
let strategy = new Strategy({
  clientID: global.config.bot.id,
  clientSecret: global.config.bot.secret,
  callbackURL: global.config.bot.callback,
  scope: global.config.bot.scopes
}, async (accessToken, refreshToken, profile, cb) => {
    await process.nextTick(async () => {
        if (profile.guilds == undefined) return cb(null, false);
        
        return cb(null, profile);
    });
});
  
passport.use(strategy);
  
passport.serializeUser((user, done) => {
    if (!user) return;
    return done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
  
app.use(session({
  secret: 'aadsadnsqwcewqec1qwe561q5wec15qwsddasnmndasdasdasdasdsdaghasdaa',
  key: "aaqwce165dsadnsqwce1q5wec15qwsddasnmndasdasdasdasdsdaghasdaa",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
      checkPeriod: 86400000
  }),
  cookie: {
      maxAge: 21600000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
}
  
this.end = function() {
app.use(function (err, req, res, next) {
  if(global.config.web.maintenance) return res.status(200).json({ "message": `${global.config.maintenance}`, "code": 202 });
  let globalfun2 = require("../libs/global.js");
  let panel = new globalfun2(app);
  res.status(500);
  panel.download(res, req, "error.ejs", { error: 500, message: "Ciddi Hata Oluştu!" });
})
  
app.use((req, res, next) => {
  if(global.config.web.maintenance) return res.status(200).json({ "message": `${global.config.maintenance}`, "code": 202 });
  let globalfun2 = require("../libs/global.js");
  let panel = new globalfun2(app);
  res.status(404);
  panel.download(res, req, "error.ejs", { error: 404, message: "Sayfa Bulunamadı!" });
})

}
  
}