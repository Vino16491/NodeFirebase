import * as functions from "firebase-functions";
import express = require("express");

import admin = require("firebase-admin");
const serviceAccount = require("../../ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = "some-uid";
const additionalClaims = {
  premiumnAccount: true
};

// admin
//   .auth()
//   .createCustomToken(uid, additionalClaims)
//   .then(customToken => {
//     console.log(customToken);
//   })
//   .catch(err => {
//     console.log("Error Creating custom token:" + err);
//   });
// admin
//   .auth()
//   .createUser({
//     phoneNumber: "+919819254711",
//     password: "vino@123456",
//     disabled: false
//   })
//   .then(userRecord => {
//     console.log("successfully created: ", JSON.stringify(userRecord));
//   })
//   .catch(err => console.log("id creation error : " + JSON.stringify(err)));

const app = express();
app.get("/timestamp", (request, response) => {
  response.send(`${Date.now()}` + " Hello World");
});
exports.apphost = functions.https.onRequest(app);
