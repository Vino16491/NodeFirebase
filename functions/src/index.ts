import * as functions from "firebase-functions";
import express = require("express");

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

/* *

Basic Sample API

*/
const app = express();
app.get("/timestamp", (request, response) => {
  response.send(`${Date.now()}` + " Hello World");
});
exports.apphost = functions.https.onRequest(app);
