// api/serverless.js
const app = require('./index'); // your existing Express app
const serverless = require('serverless-http');

module.exports.handler = serverless(app);
