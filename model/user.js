const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // to hash user passwords
mongoose.Promise = global.Promise;


// Parent schema
const userSchema = mongoose.Schema({
    email: {
        type: String, required: [true, 'Email required'], trim: true, unique: true
    },
    password: {
        type: String, required: [true,'Password required. Must be at least 5 characters'], minlength: 5
    },
    role: {
        type: String, enum: ['student', 'admin'], default: 'student'
    },
    resetPasswordToken: String, // set after password reset is submitted
    resetPasswordExpires: Date,  // set after passsword reset is submitted
    updated: {type: Date, default: Date.now},    // stores date of last update
    student: {type: String}
});


userSchema.methods.encryptPassword = function(password, callback) {
    bcrypt.hash(password, 10, function(err, hash) {
        if (err) return callback(err);
        else return callback(null, hash);
    });
};

userSchema.methods.verifyPassword = function(password, callback) {
    bcrypt.compare(password, this.password, (err, result) => {
        if (err) return callback(err);
        return callback(null, result);  
    });
};


const User = mongoose.model('users', userSchema);
module.exports = mongoose.model('users', userSchema);


