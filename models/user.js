var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var bcrypt = require('bcrypt');
var db = mongoose.connection;
mongoose.connect('mongodb://localhost/nodeauth',{useMongoClient:true});
//user schema
var UserSchema = mongoose.Schema({
    username:{
        type:String,
        index:true
    },
    password:{
        type:String,
        required:true, 
        bcrypt:true,
    },
    email:{
        type:String
    },
    name:{
        type:String
    },
    profileImage:{
        type:String
    }
});
var User = module.exports = mongoose.model('User',UserSchema);
module.exports.comparePassword = function(candidatePassowrd, hash, callback){
    bcrypt.compare(candidatePassowrd,hash,function(err,isMatch){
        if(err) return callback(err);
        callback(null,isMatch);
    });
}
module.exports.getUserByUsername = function(username,callback){
    var query = {username:username};
    User.findOne(query,callback);
}
module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}
module.exports.createUser = function(newUser,callback){
    bcrypt.hash(newUser.password,10,function(err,hash){
        if(err) throw err;
        //Set hashed password
        newUser.password = hash;
        //create user
        newUser.save(callback);
    });
    newUser.save(callback);
}