var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");

const multer = require('multer');
const admin = require('../firebaseConfig');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const bucket = admin.storage().bucket();
const path = require('path');

const upload = require("./multer");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get('/register', function(req, res) {
   res.render('index');
});

router.get('/feeds', isLoggedIn,async function(req, res) {
   let post = await postModel.find()
   res.render("feed", {post});
});

router.get('/likes/post/:id', isLoggedIn, async function(req, res) {
   const postId = req.params.id;
   const user = await userModel.findOne({ username: req.session.passport.user });
   let post = await postModel.findOne({ _id: postId });
   const userIndex = post.likes.indexOf(user._id);
   if (userIndex === -1) {
      post.likes.push(user._id);
   } else {
      post.likes.splice(userIndex, 1);
   }
   await post.save()
   const likes = {
      value: post.likes.length
  };
  res.json(likes);
})

router.get('/feed', function(req, res) {
   res.render('feed');
});

router.get('/login', function(req, res) {
   res.render('login',{error: req.flash("error")});
});

router.post('/upload', isLoggedIn, upload.single('file'), async (req, res) => {
 try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const file = req.file;
    const originalname = file.originalname;
    const ext = path.extname(originalname);
    const fileName = Date.now() + ext;

    // Upload file to Firebase Storage
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(file.buffer, {
      metadata: {
       contentType: file.mimetype
      }
    });

    // Get download URL for the uploaded file
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;

    // Create a new post and save it to the database
    let user = await userModel.findOne({ username: req.session.passport.user });
    let post = await postModel.create({
      image: fileName,
      postName: req.body.caption,
      user: user._id,
      username: user.username
    });
    user.post.push(post._id);
    await user.save();

    // Redirect the user to the profile page
    res.redirect("/profile");
 } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image.');
 }
})


// router.post('/upload', isLoggedIn ,upload.single("file"), async (req, res) =>{
//    if (!req.file) {
//       return res.status(400).send("no files uploaded")
//    }
//    let user = await userModel.findOne({username: req.session.passport.user})
//    let post = await postModel.create({
//       image: req.file.filename,
//       postName: req.body.caption,
//       user: user._id
//    })
//    user.post.push(post._id)
//    await user.save()
//    res.redirect("/profile")
// });

router.get('/logout', function(req, res) {
   req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
   });
});

router.get('/profile', isLoggedIn, async function(req, res) {
   let user = await userModel.findOne({
      username: req.session.passport.user
   })
   .populate("post")
   res.render("profile", {user});
});

router.get('/posts', isLoggedIn, async function(req, res) {
   let user = await userModel.findOne({
      username: req.session.passport.user
   })
   .populate("post")
   res.render("posts", {user});
});

router.post("/register", function(req, res) {
   let newUser = new userModel({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
   });
   userModel.register(newUser, req.body.password, function(err) {
      if (err) {
         console.error('Error registering user:', err);
         return res.render('index');
      }
      passport.authenticate("local")(req, res, function() {
         res.redirect("/profile");
      });
   });
});

router.post("/login", passport.authenticate("local", {
   successRedirect: "/profile",
   failureRedirect: "/login",
   failureFlash: true
}), (res,req)=>{});

function isLoggedIn(req, res, next) {
   if (req.isAuthenticated()) {
      return next()
   }
   res.redirect("/login")
}


module.exports = router;