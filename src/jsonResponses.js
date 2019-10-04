const content = {};
let counter = 0;
// Function that sends the response JSON back to the client
const respondJSON = (request, response, status, obj, lastIndex) => {
  // Send back response JSON to client
  response.writeHead(status, { 'Content-Type': 'application/json' });
  const jsonObj = JSON.stringify(obj);
  const filteredObj = {};
  // only get new data, lastIndex is the index of the last data fetched
  console.log(`length ${Object.keys(obj).length}`);
  console.log(`lastIndex ${Number(lastIndex)}`);
  console.log(`content ${jsonObj}`);
  for (let i = Number(lastIndex); i < Object.keys(obj).length; i++) {
    console.log(`looping ${obj[i]}`);
    filteredObj[i] = obj[i];
  }
  response.write(JSON.stringify(filteredObj));

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
  if (!body.name || !body.type) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  if (content[counter]) {
    responseCode = 204;
  } else {
    content[counter] = {};
  }

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
  notFound,
  notFoundMeta,
};
