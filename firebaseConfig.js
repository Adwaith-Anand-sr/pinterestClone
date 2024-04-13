// firebaseConfig.js
console.log('\nFirebase config file accessed.\n');

const admin = require('firebase-admin');
const path = require('path');

// Specify the path to your service account key file
const serviceAccount = require('./data/pinclone-000-firebase-adminsdk-f68gl-910b06e8bc.json'); // Update the path accordingly

// Initialize Firebase Admin SDK with the service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://pinclone-000.appspot.com', // Replace with your Firebase Storage bucket
});

module.exports = admin;
