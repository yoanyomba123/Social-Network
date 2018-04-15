const passport = require('passport');
const linkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const keys = require('./config/keys');
const User = mongoose.model('users');

passport.use(new LocalStrategy({
    usernameField: 'username'
},
    function(username, email, password, done){
        User.findOne({email: email, username: username}, function(error, user){
            if(error){
                return done(error);
            }

            if(!user){
                // user was nnot found
                return done(null, false, {
                    message: 'user was not found'
                });
            }

            if(!user.validatePassword(password)){
                return done(null, false,{
                    message: 'password is wrong'
                });
            }
            return done(null, user);
        });
    }
));