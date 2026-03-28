const axios = require("axios");
const fs = require("fs");
const path = require("path");
const db = require("csy.db");
const servers = new db.create("databases/cached.json", 0);
module.exports = function(client, interaction = null) {
  
  this.config = require("../config.js");
  
  /* Filter Function */
  this.filter = function (texts, maxlength = 150) {
    let text = (texts != null || texts != undefined || texts != "") ? String(texts) : null;
    if(text.length > maxlength || text == null || text == undefined || text == "") return "[...]";
    
    let tagregexp = new RegExp('<@(.*?)>', 'g');
    let tagsregexp = new RegExp('<@!(.*?)>', 'g');
    text = text.replaceAll(tagregexp, "[...]")
    text = text.replaceAll(tagsregexp, "[...]")
    
    var swears = [ '"', "'", "*", "`", "$", "<", "_", "~", "\n", ">"];
    var result = text.replaceAll(swears, '')
    return result;
  }
  /* Filter Function */
  
  this.date = function() {

    var date = new Date();

    let year  = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
  
  this.raad = () => {
    var date = new Date().getTime();
    return date;
  }
  
  this.db = db;
  this.servers = servers;
  
  this.pages = async(pat) => {
    
    let res = await fs.readdirSync(path.join(__dirname, "../views/libs/pages"))
    let result = {};
    
    for (var i = 0; i < res.length; i++) {
      var content = res[i];
      var getcontent = await fs.readFileSync(path.join(__dirname, "../views/libs/pages/"+content+""), {encoding:'utf8', flag:'r'});
      getcontent = getcontent.replaceAll("<%- base %>", this.config.web.url).replaceAll("<%- name %>", this.config.web.title);
      
      result[content.replace(".html", "")] = getcontent;
    }
    
    return result;
  }
  
  this.emailcontrol = (email) => {
    if(!email) return null;
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
  
  this.utf8 = (text) => {
    return text.replaceAll("Ä±", "ı").replaceAll("Ã§", "ç").replaceAll("ÅŸ", "ş").replaceAll("Ã¶", "ö").replaceAll("Ã¼", "ü").replaceAll("ÄŸ", "ğ").replaceAll("Ä°", "İ").replaceAll("Ã‡", "Ç").replaceAll("ÅŸ", "Ş").replaceAll("Ã–", "Ö").replaceAll("Ãœ", "Ü").replaceAll("ÄŸ", "Ğ");
  }

  this.ipverify = async(ip, port) => {

    return await new Promise(async(res, rej) => {

      let serverlist = await fs.readFileSync(path.join(__dirname, "../databases/cached.json"), "utf-8");
      if(!serverlist) {
        let error1 = await this.ipverify(ip, port);
        return res(error1);
      }
      let parsed = await JSON.parse(serverlist);
      setTimeout(async() => {
        if(typeof parsed?.result != "object") {
          let error2 = await this.ipverify(ip, port);
          return res(error2);
        }
        let serverfind = parsed?.result.find(x => x.ip == String(ip) && x.port == Number(port));
        
        if(serverfind && serverfind.name) {
          var namefiltered = this.utf8(serverfind.name);
          serverfind.name = namefiltered;
          res(serverfind);
        } else {
          res(false);
        }
      }, 200)
    });


    
  }

  this.maintence = this.config.maintence;
  
  this.autoreload = async () => {
    
    setInterval(async() => {
      let response = await axios.get("https://mtasa.com/api/").catch(err => err + "1");
      if(!response?.data || response?.response) {} else {
        servers.set("result", response?.data)
      }
      
      var lastreset;
      
      let last = this.db.get("lastreset");
      if(!last) {
        lastreset = this.db.set("lastreset", new Date().getTime())
      } else {
        lastreset = last;
      }
      
      if((lastreset+this.config.voteRefresh) <= new Date().getTime()) {
        this.db.set("lastreset", new Date().getTime());
        
        let alldatas = await this.db.all();
        let filtered = alldatas.filter(x => x.ID.startsWith("server_"));
        for (var i = 0; i < filtered.length; i++) {
          filtered[i].data.likes = [];
          this.db.set(filtered[i].ID, filtered[i]);
        }
      }
      
    }, this.config.refresh);
  }
  
  this.guildcontrol = async(guildid, userid) => {
    let botinserver = await client?.guilds?.cache?.get(guildid);
    if(!botinserver || botinserver?.owner !== userid) return false;
    
    return botinserver;
  }
  
}