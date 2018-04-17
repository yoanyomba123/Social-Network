const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');


module.exports = function(passport){
    // Local Strategy
    passport.use(new LocalStrategy(function(username, password, done){
        let query = {username:username};
        User.findOne(query, function(error, user){
            if(error){
                throw error;
            }

            if(!user){
                return done(null, false, {message: 'no user found'});
            }

            //match user based off of password
            bcrypt.compare(password, user.password, function(error, isMatch){
                if(error){
                    throw error;
                }

                if( isMatch){
                    return done(null, user);
                }
                else{
                    return done(null, false, {message: 'Wrong password'});
                }
            });
        })
    }));

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(error, user){
            done(error, user);
        });
    });
}