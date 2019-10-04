const http = require('http');
const query = require('querystring');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle data sent from client
const handlePost = (request, response, parsedUrl) => {
  if (parsedUrl.pathname === '/addContent') {
    const tempResponse = response;
    let body = [];

    // error in upload stream
    request.on('error', (err) => {
      console.dir(err);
      tempResponse.statusCode = 400;
      tempResponse.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    // end of upload stream.
    request.on('end', () => {
      body = query.parse(Buffer.concat(body).toString());

      jsonHandler.addContent(request, tempResponse, body);
    });
  }
};

// Function that handles requests from client
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  let body = [];

  switch (request.method) {
    case 'GET':
      if (parsedUrl.pathname === '/') {
        htmlHandler.getIndex(request, response);
      } else if (parsedUrl.pathname === '/style.css') {
        htmlHandler.getCSS(request, response);
      } else if (parsedUrl.pathname === '/getContent') {   
        jsonHandler.getContent(request, response, parsedUrl.query.split('=').pop());
      } else {
        // 404
        jsonHandler.notFound(request, response);
      }
      break;
    case 'HEAD':
      if (parsedUrl.pathname === '/getContent') {
        jsonHandler.getContentMeta(request, response);
      } else {
        // 404
        jsonHandler.notFoundMeta(request, response);
      }
      break;
    case 'POST':
      handlePost(request, response, parsedUrl);
      break;
    default:
      jsonHandler.notFound(request, response);
      break;
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
