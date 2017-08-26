var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render('register',{title:'Register'});
});
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});
router.post('/register',function(req,res,next){
  //set form values
  var name = req.body.name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  //check for image field
  if(req.files.profileImageName){
    console.log('Uploading File...');

    //File info
    var profileImageOriginalName = req.files.profileImage.originalName;//the filename before it gets uploaded
    var profileImageName = req.files.profileImage.name;//name that server gives when we upload
    var profileImageMime = req.files.profileImage.mimetype;
    var profileImagePath = req.files.profileImage.path;
    var profileImageExt = req.files.profileImage.extension;
    var profileImageSize = req.files.profileImage.size;
  } else{
    //set a default image
    var profileImageName = 'noImage.png';
  }
  //form validation (using the express-validator)
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  //Check for errors
  req.getValidationResult().then(function(result) {
    if (!result.isEmpty()) {
      res.render('register',{
        errors:result.array(),
        name:name,
        email:email,
        username:username,
        password:password,
        password2:password2
      });
      return;
    }
    var newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      profileImage:profileImageName
    });
    //Create User
    User.createUser(newUser, function(err,user){
      if(err) throw err;
      console.log(user);
    });
    // Success message
    req.flash('success','You are now registered and may log in');
    //finally redirect to the home
    res.location('/');//set the location to home
    res.redirect('/');//redirect to home
  });
  
  //validationErrors is deprecated
  // var errors = req.validationErrors()
  // if(errors){
  //   res.render('register',{
  //     errors:errors,
  //     name:name,
  //     email:email,
  //     username:username,
  //     password:password,
  //     password2:password2
  //   });
  // }else{
  //   var newUser = new User({
  //     name:name,
  //     email:email,
  //     username:username,
  //     password:password,
  //     profileImage:profileImageName
  //   });
  //   //Create User
  //   User.createUser(newUser, function(err,user){
  //     if(err) throw err;
  //     console.log(user);
  //   });
  //   // Success message
  //   req.flash('success','You are now registered and may log in');
  //   //finally redirect to the home
  //   res.location('/');//set the location to home
  //   res.redirect('/');//redirect to home
  // }
});
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new LocalStrategy(function(username,password,done){
  User.getUserByUsername(username,function(err,user){
    if(err) throw err;
    if(!user){
      console.log('Unknown User');
      return done(null, false,{message:'Unknown User'});
    }
    User.comparePassword(password,user.password,function(err,isMatch){
      if(err) throw err;
      if(isMatch){
        return done(null,user);
      } else {
        console.log('Invalid password');
        return done(null,false,{message:'Invalid Password'});
      }
    })
  })
}));
router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid username or password'}),function(req,res){
  //this function will be called if LocalStrategy returned true
  console.log('Authentication successful');
  req.flash('success','You are logged in');
  res.redirect('/');
});
router.get('/logout',function(req,res){
  req.logout();//we are not taking the user to any logout page(we dont have one). We will just do logout with a message
  req.flash('success','You have logged out');
  res.redirect('/users/login');
});
module.exports = router;
