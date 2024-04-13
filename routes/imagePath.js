const admin = require('firebase-admin');
const serviceAccount = require('../data/pinclone-000-firebase-adminsdk-f68gl-910b06e8bc.json'); // Replace with the path to your service account key file

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://pinclone-000.appspot.com', // Replace with your Firebase Storage bucket URL
});

// Get a reference to the Firebase Storage bucket
const bucket = admin.storage().bucket();

// Function to generate a download URL for a file in Firebase Storage
async function getDownloadUrl(filePath) {
  try {
    // Get a reference to the file
    const file = bucket.file(filePath);

    // Generate a signed download URL for the file
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2100' // Adjust the expiration date as needed
    });

    return url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    return null;
  }
}
const filePath = '1712594947507.jpg';
getDownloadUrl(filePath)
  .then(url => {
    if (url) {
      console.log('Download URL:', url);
      // Now you can use this URL in your <img> tag in your HTML
    } else {
      console.log('Download URL not available.');
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });

module.exports = getDownloadUrl;