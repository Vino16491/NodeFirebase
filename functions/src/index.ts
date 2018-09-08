import * as functions from "firebase-functions";
/** module for password encryption and decryption */
import bcrypt = require("bcryptjs");
/** module for creating apis  */
import express = require("express");
/** module for parsing data from documents  */
import bodyParser = require("body-parser");
/** Firebase admin module for user creation and custom token generation */
import admin = require("firebase-admin");
/** Service Account Key need to be private  */
const serviceAccount = require("./ServiceAccountKey.json");

/** Initializing admin with Firebase credential  */
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crud-acl.firebaseio.com"
});

const db = admin.firestore();

/** @constant additionalClaims used for creating rules  */
const additionalClaims = {
  premiumnAccount: true
};


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
  response.send(`${Date.now()}` +'\n' +`<h1> API is Working </h1>`);
});

/** Register API @constant dbUser is used for creating doc id before setting its values
 * @var password is encrypted using bcrypt and salted for 10 rounds
 * @param customToken is send to the user on successful registration for login
 */
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
      // console.log(ref);
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


/** login API will taked user id and password and will verify database 
 * on success will generate @param token and sent it to user*/
app.post("/login", (req, res) => {
  const dbUser = db
    .collection("users")
    .where("mobileNumber", "==", req.body.mobileNumber)
    .limit(1);
  dbUser
    .get()
    .then(docSnap =>
      docSnap.forEach(doc => {
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
