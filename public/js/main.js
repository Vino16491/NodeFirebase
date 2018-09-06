const config = require('./firebase.config');
const fireDb = require('firebase/database');
firebase.initializeApp(config);

function registerSubmit() {
fireDb.database.create
}

function generateOtp(mobilenumber) {
    console.log(JSON.stringify(mobilenumber))
}

function otpSubmit(otp) {
    console.log(JSON.stringify(otp))
}