const fs = require('fs');

const logo = fs.readFileSync(`${__dirname}/../client/media/logo.png`);
const favicon = fs.readFileSync(`${__dirname}/../client/media/favicon.ico`);
const getLogo = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(logo);
  response.end();
};
const getFavicon = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'image/x-icon' });
    response.write(favicon);
    response.end();
  };

module.exports.getLogo = getLogo;
module.exports.getFavicon = getFavicon;