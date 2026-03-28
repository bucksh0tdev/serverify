const ejs = require("ejs");
const bodyParser = require("body-parser");
const globalfun = require("../functions/global.js");
const panelfun = require("./libs/global.js");
const minifyHTML = require('express-minify-html-terser');
const express = require('express');
module.exports = async (client, app) => {

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.engine("html", ejs.renderFile);
app.set("view engine", "html");

app.use('/api/static', express.static(__dirname + '/styles/static'))

const global = new globalfun(client);
const panel = new panelfun(app);

app.use(minifyHTML({
  override: true,
  exception_url: false,
  htmlMinifier: {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    minifyJS: true
  }
}));
  
panel.setup();

require("./libs/subs/main.js")(app, global, panel, client);

/* END Handlers */
panel.end();
/* END Handlers */
}