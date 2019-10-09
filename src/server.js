const http = require('http');
const query = require('querystring');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');
const imageHandler = require('./imageResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// handle data sent from client
const handlePost = (request, response, parsedUrl) => {
  const tempResponse = response;
  let body = [];

  // error in upload stream
  request.on('error', (err) => {
    console.dir(err);
    tempResponse.statusCode = 400;
    tempResponse.end();
  });

  // add data to body
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // add content to table
  if (parsedUrl.pathname === '/addContent') {
    // end of upload stream.
    request.on('end', () => {
      body = query.parse(Buffer.concat(body).toString());

      jsonHandler.addContent(request, tempResponse, body);
    });
  } // update existing content in table 
  else if (parsedUrl.pathname === '/updateContent') {
    // end of upload stream.
    request.on('end', () => {
      body = query.parse(Buffer.concat(body).toString());

      jsonHandler.updateContent(request, tempResponse, body);
    });
  } // remove existing content in table 
  else if (parsedUrl.pathname === '/removeContent') {
    // end of upload stream.
    request.on('end', () => {
      body = query.parse(Buffer.concat(body).toString());
      jsonHandler.removeContent(request, tempResponse, body);
    });
  }
};

// Function that handles requests from client
const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);
  console.log(request.method);
  switch (request.method) {
    case 'GET':
      switch (parsedUrl.pathname) {
        case '/':
          // get Index page
          htmlHandler.getIndex(request, response);
          break;
        case '/style.css':
          // get CSS
          htmlHandler.getCSS(request, response);
          break;
        case '/script.js':
          // get client JS
          htmlHandler.getJS(request, response);
          break;
        case '/logo':
          // get logo img
          imageHandler.getLogo(request, response);
          break;
        case '/favicon.ico':
          // get favicon
          imageHandler.getFavicon(request, response);
          break;
        case '/getContent':
          // get requested content
          jsonHandler.getContent(request, response, parsedUrl.query.split('=').pop());
          break;
        default:
          // 404
          jsonHandler.notFound(request, response);
          break;
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
