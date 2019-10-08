const content = {};
let counter = 0;
// Function that sends the response JSON back to the client
const respondJSON = (request, response, status, obj, nextIndex) => {
  // Send back response JSON to client
  response.writeHead(status, { 'Content-Type': 'application/json' });
  const jsonObj = JSON.stringify(obj);
  const filteredObj = {};
  // only get new data, nextIndex is the index of the last data fetched
  console.log(`length ${Object.keys(obj).length}`);
  console.log(`nextIndex ${Number(nextIndex)}`);
  console.log(`content ${jsonObj}`);

  Object.keys(obj).forEach((element) => {
    if (element >= nextIndex) {
      filteredObj[element] = obj[element];
    }
  });
  response.write(JSON.stringify(filteredObj));

  response.end();
};

const respondUpdateJSON = (request, response, status, obj, uniqueid) => {
  // Send back response JSON to client
  const jsonObj = obj;
  jsonObj.uniqueid = uniqueid;
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(jsonObj));
  response.end();
};

const respondRemoveJSON = (request, response, status, uniqueid) => {
  // Send back response JSON to client
  const jsonObj = {};
  jsonObj.uniqueid = uniqueid;
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(jsonObj));
  response.end();
};

// function to respond without json body
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// return content as JSON
const getContent = (req, res, param) => respondJSON(req, res, 200, content, param);

const getContentMeta = (request, response) => respondJSONMeta(request, response, 200);

const addContent = (request, response, body) => {
  const responseJSON = {
    message: 'Name and age are both required.',
  };
  let responseCode = 201;

  // Check for missing params
  if (!body.name || !body.type || !body.status) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (content[counter]) {
    responseCode = 204;
  } else {
    content[counter] = {};
  }

  content[counter].status = body.status;
  content[counter].name = body.name;
  content[counter].type = body.type;
  content[counter].year = body.year || 'N/A';
  content[counter].image = body.image || 'N/A';

  counter++;

  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

const updateContent = (request, response, body) => {
  content[body.uniqueid].status = body.status;
  content[body.uniqueid].name = body.name;
  content[body.uniqueid].type = body.type;
  content[body.uniqueid].year = body.year || 'N/A';
  content[body.uniqueid].image = body.image || 'N/A';

  return respondUpdateJSON(request, response, 201, content[body.uniqueid], body.uniqueid);
};

const removeContent = (request, response, body) => {
  delete content[body.uniqueid];
  return respondRemoveJSON(request, response, 201, body.uniqueid);
};

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
