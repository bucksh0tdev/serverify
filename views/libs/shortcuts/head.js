module.exports = function(global, path) {
  let location = path
    .replaceAll("index.ejs", "Anasayfa")
    .replaceAll("myservers.ejs", "Sunucularım")
    .replaceAll("votes.ejs", "Oy Sıralama")
    .replaceAll("request.ejs", "Başvuru")
    .replaceAll("error.ejs", "Error");
  
    let header = `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet" />
    <link rel="stylesheet" href="${global.config.web.url}/api/static/styles.css?aa=${global.raad()}">
    <link rel="stylesheet" href="${global.config.web.url}/api/static/custom.css?aa=${global.raad()}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css" />
    <meta name="twitter:card" value="summary">
    <meta name="twitter:title" content="${global.config.web.title} - ${location}">
    <meta name="twitter:description" content="${global.config.web.description}">
    <meta name="twitter:image" content="${global.config.web.url}/api/logo">
    <meta name="title" content="${global.config.web.title} - ${location}">
    <meta name="description" content="${global.config.web.description}">
    <meta name="keywords" content="${global.config.web.keywords
      .map(x => x)
      .join(", ")}">
    <meta name="image" content="${global.config.web.url}/api/logo">
    <meta itemprop="image" content="${global.config.web.url}/api/logo"  />
    <meta http-equiv="Content-Type" content="text/html; charset=utf8">
    <meta name="revisit-after" content="1 days">
    <meta name="google" content="notranslate" />
    
    <link rel="icon" href="${global.config.web.url}/api/logo">
    
    <title>${global.config.web.title} - ${location}</title>
  `;
  
  return header + require("./loader.js")(global);
}