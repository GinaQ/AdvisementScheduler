// passport is also imported at app.js
// the configuration made at app.js is available here too
// do not configure it again
const passport = require('passport');
const User = require('../model/user');
const LocalStrategy = require('passport-local').Strategy;

// Serialize user to store in session
passport.serializeUser((user, callback)=> {
    callback(null, user._id);
});

// Deserailize user from serialized data' 
// Only the user id is stored in the session
passport.deserializeUser((id, callback) => {
    User.findById(id, (err, user) => {
        callback(err, user);
    })
});

const localStrategyConfig = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // pass the entire request to the callback
}

passport.use('localsignup',
    new LocalStrategy(localStrategyConfig, (req, email, password, callback) => {
        User.findOne({'email': email}, (err, user) => {
            if (err) {
                return callback(null, false, req.flash('signuperror', err));
            }
            if (user) {
                return callback(null, false, req.flash('signuperror','Email is already in use'));
            }
            const newUser = new User();
            newUser.email = email;
            newUser.encryptPassword(password, (err, result) => {
                if (err) {
                    return callback(null, false, req.flash('signuperror', err));
                }
                newUser.password = result;
                newUser.save((err, result)=> {
                    if (err) {  
                        return callback(err);
                    }
                    return callback(null, newUser, req.flash('signupsuccess', 'Sign up successful! Login, please!'));
                });
            });
        });
    })
);

passport.use('locallogin',
    new LocalStrategy(localStrategyConfig, (req, email, password, callback) => {
        User.findOne({'email': email}, (err, user) => {
            if (err) return callback(null, false, req.flash('loginerror', err));
            if (!user) return callback(null, false, req.flash('loginerror', 'Incorrect email'));
            user.verifyPassword(password, (err, result) => {
                if (err) return callback(null, false, req.flash('loginerror', err)); 
                if (!result) return callback(null, false, req.flash('loginerror', 'Incorrect password'));
                return callback(null, user, req.flash('loginsuccess', 'Login successful!'));
            });
        });
    })
);

passport.use('facultylogin',
    new LocalStrategy(localStrategyConfig, (req, email, password, callback) => {
        User.findOne({'email': email}, (err, user) => {
            if (err) return callback(err);
            if (!user) return callback(null, false, req.flash('loginerror', 'Incorrect email'));
            const role = user.role;
            if (role === 'student') return callback(null, false, req.flash('loginerror', 'Unauthorized Access'));
            user.verifyPassword(password, (err, result) => {
                if (err) return callback(null, false, req.flash('loginerror', err)); 
                if (!result) return callback(null, false, req.flash('loginerror', 'Incorrect password'));
                return callback(null, user, req.flash('loginsuccess', 'Login successful!'));
            });
        });
    })
);

