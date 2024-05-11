var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const multer = require('multer');
const admin = require('firebase-admin')
const path = require("path");
const fs = require('fs');
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer();
const io = new Server(httpServer, {
   cors: {
      origin: "http://localhost:3000"
      //origin: "https://friendszone-vw8g.onrender.com:1000"
   }  
});
const cookieParser = require('cookie-parser');

let users = []


const userModel = require("../models/users.js");
const postModel = require("../models/posts.js");
const chatModel = require("../models/message.js");

//firebase storage setup
require('dotenv').config();
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
  universe_domain: process.env.UNIVERSE_DOMAIN
};
admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 storageBucket: 'gs://social-media-app-000.appspot.com',  
});
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const bucket = admin.storage().bucket();


//socket.io setup (server)
io.on("connection", (socket) => {
   console.log("user connected.");
   socket.on("join", (username)=>{
      users.push({ id: socket.id, username });
      console.log(`user joined : ${username}`);
      socket.emit('userJoined', users);
   })
   
   socket.on("sendMessage", async (message,sender, receiver)=>{
      const receiverSocketId = users.find(user => user.username === message.receiver)?.id;
      let senderUser = await userModel.findOne({username: message.sender})
      let receiverUser = await userModel.findOne({username: message.receiver})
      const chat = new chatModel({
         sender: senderUser,
         receiver: receiverUser,
         message: message.message
      })
      await chat.save()
      let chats = await chatModel.find({sender: senderUser._id, receiver: receiverUser._id, readed: false})
      if (receiverSocketId) {
         socket.to(receiverSocketId).emit('receiveMessage', message, chat);
         socket.to(receiverSocketId).emit('notifyMessege', chat, chats);
      }
   })
   
   socket.on("markAsSeen", async (chat)=>{
      const senderSocketId = users.find(user => user.username === chat.sender.username)?.id;
      let seenedChat = await chatModel.findByIdAndUpdate(chat._id, { readed: true });
      io.to(senderSocketId).emit('messagesSeen', seenedChat);
   })
   
   socket.on('disconnect', () => {
      users = users.filter(user => user.id !== socket.id);
      socket.emit('userLeft', users);
      console.log('A user disconnected');
   });
});
httpServer.listen(4000, () => {
   console.log("Server is running on port 4000");
});


router.get('/', isLoggedIn,  function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/message', isLoggedIn, async function(req, res) {
   let users = await userModel.find()
   let unReaded = await chatModel.find({readed: false})
   res.render('messege', { user: req.user , users, unReaded} );
});

router.get('/message/chat/:userId', isLoggedIn, async function(req, res) {
   let selectedUser = await userModel.findOne({_id: req.params.userId})
   let user = await userModel.findOne({username: req.user.username})
   selectedUserId = selectedUser._id
   userId = user._id
   let chats = await chatModel.find({
      $or: [
         { sender: userId, receiver: selectedUserId },
         { sender: selectedUserId, receiver: userId }
      ]
   }).sort({ timestamp: 1 });
   chats.map(async (item)=>{
      if (item.receiver.toString() === user._id.toString() && item.readed === false) {
         item.readed = true
         item.save()
         let sender = await userModel.findOne({_id: item.sender})
         const senderSocketId = users.find(user => user.username === sender.username)?.id;
         io.to(senderSocketId).emit('messagesSeen', item);
      }
   })
   res.render('../client/client', { user, selectedUser, chats } );
   
});

router.get('/login', function(req, res, next) {
   res.render('login');
});

router.get('/register', function(req, res, next) {
   res.render('register');
});

router.get('/logout', function(req, res, next) {
   res.cookie("token", "")
   res.redirect("/login")
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
   let user = await userModel.findOne({username: req.user.username})
   res.render('profile', {user: user});
});

router.get('/upload', isLoggedIn, async function(req, res, next) {
   let user = await userModel.findOne({username: req.user.username})
   res.render('upload', {user});
});

router.get('/posts', isLoggedIn, async function(req, res, next) {
   let user = await userModel.findOne({username: req.user.username})
   const postPromises = user.posts.map(async (postId) => {
    return await postModel.findOne({_id: postId});
   });
   const posts = await Promise.all(postPromises);
   res.render('posts', {user, posts});
});

router.get('/feeds', isLoggedIn, async function(req, res, next) {
   let user = await userModel.findOne({username: req.user.username})
   let posts = await postModel.find()
   
   const postPromises = posts.map(async (item) => {
      return await userModel.findOne({_id: item.user});
   });
   const users = await Promise.all(postPromises);
   
   res.render('feeds', {posts, users, user});
});

router.post('/register', async function(req, res, next) {
   let {username, fullname, password, gender, email} = req.body
   
   let existUser = await userModel.findOne({username})
   
   if (existUser) {
      return res.status(500).send("username alredy exists!!")
   }
   
   bcrypt.genSalt(10, (err, salt)=>{
      if (err) res.send(err)
      bcrypt.hash(password, salt, async (err, hash)=>{
         if (err) res.send(err)
         let user = await userModel.create({username, fullname, password: hash, gender, email})
      })
   })
   
   let token = jwt.sign({email, username}, "...here the secret")
   res.cookie("token", token)
   res.redirect("/profile")
});

router.post('/login', async function(req, res, next) {
   let {username, password} = req.body

   let existUser = await userModel.findOne({username})
   if (!existUser) {
      return res.status(500).send("invalid username or password.")
   }
   
   bcrypt.compare(password, existUser.password, (err, result)=>{
      if(result){
         let token = jwt.sign({email: existUser.email, username}, "...here the secret")
         res.cookie("token", token)
         req.flash("user", existUser)
         res.redirect("/profile")
      }else return res.status(500).send("invalid username or password.")
   })
});

router.post('/upload', upload.single('image'), isLoggedIn, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        // Continue with other operations after file reception
        const file = req.file;
        const originalname = file.originalname;
        const ext = path.extname(originalname);
        const fileName = Date.now() + ext;
        const fileUpload = bucket.file(fileName);

        // Perform the file upload asynchronously
        await fileUpload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype
            }
        });

        // Once upload is complete, continue with other operations
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
        console.log("Post uploaded successfully");

        // Find user and create post
        let user = await userModel.findOne({ username: req.user.username });
        let post = await postModel.create({ user: user._id, posts: imageUrl, caption: req.body.caption, location: req.body.location });

        // Update user's posts and save
        user.posts.push(post._id);
        await user.save();

        // Redirect the user to the profile page
        res.redirect("/profile");
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image.');
    }
});

function isLoggedIn(req, res, next) {
   if (req.cookies.token) {
      let data = jwt.verify(req.cookies.token, "...here the secret")
      req.user = data
      next();
   } else {
      res.status(401).redirect("/login");
   }
}

module.exports = router;