var mongoose = require('mongoose');
var bcrypt = require('bcrypt'); 
var UserSchema = new mongoose.Schema({
   Name:{
        type:String,
        required: true,
    },
  Email: {
        type:String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
  Password: {
        type: String,
        required: true
    },
    Age:
    {
        type:Number,
        required:true,
    },
    Gender:
    {
        type:String,
        required:true
    },
    Type:{
        type:String,
        required:true,
    },
    Address:
    {
        type:String,
        required:true,
        lowercase:true,
    },
    Birthdate:
    {
        type:Date,
        required:true
    },
    IdReceiver:
    {
        type:String,
        required:true
    },
    AccountBalance:
    {
        type:Number
    }
});

UserSchema.pre('save',  function(next) {
    var user = this;

     if (!user.isModified('Password')) return next();

     bcrypt.genSalt(10, function(err, salt) {
         if (err) return next(err);
 
         bcrypt.hash(user.Password, salt, function(err, hash) {
             if (err) return next(err);
 
             user.Password = hash;
             next();
         });
     });
});
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.Password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
module.exports = mongoose.model('customers', UserSchema);