const content = {};
let counter = 0;
// Function that sends the response JSON back to the client
const respondJSON = (request, response, status, content, lastIndex) => {
  // Send back response JSON to client
  response.writeHead(status, { 'Content-Type': 'application/json' });
  const jsonObj = JSON.stringify(content);
  let filteredObj = {}; 
  // only get new data, lastIndex is the index of the last data fetched
  console.log("length " + Object.keys(content).length);
  console.log("lastIndex " + Number(lastIndex));
  console.log("content " + jsonObj);
  for (let i = Number(lastIndex); i < Object.keys(content).length; i++) {
    console.log('looping ' + content[i]);
    filteredObj[i] =  content[i];
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
const getContent = (request, response, param) => respondJSON(request, response, 200, content, param);

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
  content[counter].year = body.year || "N/A";
  content[counter].image = body.image || "N/A";
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
