import * as functions from "firebase-functions";
import bcrypt = require("bcryptjs");
import express = require("express");
import bodyParser = require("body-parser");
import admin = require("firebase-admin");
const serviceAccount = require("../../ServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crud-acl.firebaseio.com"
});

const db = admin.firestore();

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
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PATCH, DELETE, OPTIONS"
  );
  next();
});
app.get("/timestamp", (request, response) => {
  response.send(`${Date.now()}` + " Hello World");
});

/** Register API */
app.post("/register", (req, res) => {
  const dbUser = db.collection("users").doc();
  dbUser
    .set(
      {
        mobileNumber: req.body.mobileNumber,
        password: bcrypt.hashSync(req.body.password, 10),
        id: dbUser.id
      },
      { merge: true }
    )
    .then(ref => {
      console.log(ref);
      admin
        .auth()
        .createCustomToken(dbUser.id, additionalClaims)
        .then(customToken => {
          // console.log(customToken);
          return res.status(201).json({
            message: "User Created",
            user: customToken
          });
        })
        .catch(err => {
          console.log("Error Creating custom token:" + err);
        });
    })
    .catch(e => res.status(500).json({ e: e }));
});

/* login token generate */
app.post("/login", (req, res) => {
  let dbUser = db
    .collection("users")
    .where("mobileNumber", "==", req.body.mobileNumber)
    .limit(1);
  dbUser
    .get()
    .then(doc =>
      doc.forEach(doc => {
        if (!bcrypt.compareSync(req.body.password, doc.data().password)) {
          return res.status(401).json({ e: "userid or password is incorrect" });
        }
        return admin
          .auth()
          .createCustomToken(doc.data().id, additionalClaims)
          .then(token => {
            return res.status(201).json({
              message: "User login",
              user: token
            });
          });
      })
    )
    .catch(e => res.status(500).json({ err: e }));
});

exports.apphost = functions.https.onRequest(app);
