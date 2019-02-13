var mongoose = require('mongoose');
var bcrypt = require('bcrypt'); 
var UserSchema = new mongoose.Schema({
   name:{
        type:String,
        required: true,
    },
  email: {
        type:String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
  password: {
        type: String,
        required: true
    },
    age:
    {
        type:Number,
        required:true,
    },
    Gender:
    {
        type:String,
        required:true
    },
    address:
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
    }
});
 
UserSchema.pre('save',  function(next) {
    var user = this;

     if (!user.isModified('password')) return next();

     bcrypt.genSalt(10, function(err, salt) {
         if (err) return next(err);
 
         bcrypt.hash(user.password, salt, function(err, hash) {
             if (err) return next(err);
 
             user.password = hash;
             next();
         });
     });
});
 
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
 
module.exports = mongoose.model('customers', UserSchema);