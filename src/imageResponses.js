const fs = require('fs');

const logo = fs.readFileSync(`${__dirname}/../client/media/logo.png`);
const getLogo = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'image/png' });
  response.write(logo);
  response.end();
};

module.exports.getLogo = getLogo;