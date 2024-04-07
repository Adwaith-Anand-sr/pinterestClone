var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const upload = require("./multer");
const passport = require("passport");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get('/register', function(req, res) {
   res.render('index');
});

router.get('/feed', function(req, res) {
   res.render('feed');
});

router.get('/login', function(req, res) {
   res.render('login',{error: req.flash("error")});
});

router.post('/upload', isLoggedIn ,upload.single("file"), async (req, res) =>{
   if (!req.file) {
      return res.status(400).send("no files uploaded")
   }
   let user = await userModel.findOne({username: req.session.passport.user})
   let post = await postModel.create({
      image: req.file.filename,
      postName: req.body.caption,
      user: user._id
   })
   user.post.push(post._id)
   await user.save()
   res.redirect("/profile")
});

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