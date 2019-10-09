const content = {};
const striptags = require('striptags');
let counter = 0;

// Function that sends the response JSON back to the client
const respondJSON = (request, response, status, obj, nextIndex) => {
  // Send back response JSON to client
  response.writeHead(status, { 'Content-Type': 'application/json' });
  const jsonObj = JSON.stringify(obj);
  const filteredObj = {};

  // only get new data, nextIndex is the index of the last data fetched
  Object.keys(obj).forEach((element) => {
    if (element >= nextIndex) {
      filteredObj[element] = obj[element];
    }
  });
  response.write(JSON.stringify(filteredObj));

  response.end();
};
// function to respond without json body
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// add row to content
const addContent = (request, response, body) => {
  const responseJSON = {
    message: 'Name, type, and status are required.',
  };
  let responseCode = 201;

  // Check for missing params
  if (!body.name || !body.type || !body.status) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // content already exists
  if (content[counter]) {
    responseCode = 204;
  } else {
    content[counter] = {};
  }

  content[counter].status = striptags(body.status);
  content[counter].name = striptags(body.name);
  content[counter].type = striptags(body.type);
  content[counter].year = striptags(body.year);
  content[counter].image = striptags(body.image);

  counter++;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

// send back updated JSON to client
const respondUpdateJSON = (request, response, status, obj, uniqueid) => {
  // Send back response JSON to client
  const jsonObj = obj;
  jsonObj.uniqueid = uniqueid;
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(jsonObj));
  response.end();
};

// update existing data in content
const updateContent = (request, response, body) => {

  // strip tags to prevent xss
  content[body.uniqueid].status = striptags(body.status);
  content[body.uniqueid].name = striptags(body.name);
  content[body.uniqueid].type = striptags(body.type);
  content[body.uniqueid].year = striptags(body.year);
  content[body.uniqueid].image = striptags(body.image);

  // requested object
  return respondUpdateJSON(request, response, 201, content[body.uniqueid], body.uniqueid);
};

// send back removed JSON to content (so that the client knows what to remove)
const respondRemoveJSON = (request, response, status, uniqueid) => {
  // Send back response JSON to client
  const jsonObj = {};
  jsonObj.uniqueid = uniqueid;
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(jsonObj));
  response.end();
};

// delete row from content
const removeContent = (request, response, body) => {
  delete content[body.uniqueid];
  return respondRemoveJSON(request, response, 201, body.uniqueid);
};


// exported function to get content
const getContent = (req, res, param) => respondJSON(req, res, 200, content, param);

const getContentMeta = (request, response) => respondJSONMeta(request, response, 200);

const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you looking for was not found.',
    id: 'notFound',
  };

  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
  respondJSONMeta(request, response, 404);
};


module.exports = {
  getContent,
  getContentMeta,
  addContent,
  updateContent,
  removeContent,
  notFound,
  notFoundMeta,
};
