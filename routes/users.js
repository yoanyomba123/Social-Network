const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
// bring in model class
let User = require('../models/user');
module.exports = app => {
    app.get('/register',function(request, response){
        response.render('register');
    });

    // process register 
    app.post('/register', function(request, response){
        const name = request.body.name;        
        const email = request.body.email;
        const username = request.body.username;
        const password = request.body.password;
        const confirmpassword = request.body.confpassword;
        
        request.checkBody('name', 'Name is required').notEmpty();
        request.checkBody('email', 'Email is required').notEmpty();
        request.checkBody('email', 'Email is not valid').isEmail();        
        request.checkBody('username', 'Username is required').notEmpty();
        request.checkBody('password', 'Password is required').notEmpty();
        request.checkBody('confpassword', 'Passwords Do Not Match').equals(request.body.password);

        let errors = request.validationErrors();

        if(errors){
            response.render('register', {
                errors:errors
            });
        }
        else{
            let newUser = new User({
                name: name,
                email:email,
                username:username,
                password:password
            });

            bcrypt.genSalt(10, function(error, salt){
                bcrypt.hash(newUser.password, salt, function(error, hash){
                    if(error){
                        console.log(error);
                    }
                    newUser.password = hash;
                    newUser.save(function(error){
                        if(error){
                            console.log(error);
                            return;
                        }
                        else{
                            request.flash('success', 'You are now registered and can log in');
                            response.redirect('/login');
                        }
                    })
                });
            });
        }
    });

    // get request for login form
    app.get('/login', function(request, response){
        response.render('login');
    });


    // process login post request
    app.post('/login', passport.authenticate('local', { 
        failureRedirect: '/login',
        failureFlash: true 
    }),
        function(request, response) {
            response.redirect('/');
    });

    // logout functionality
    app.get('/logout', function(request, response){
        request.logout();
        response.locals.user = null;
        request.flash('success', 'You are logged out');
        response.redirect('/login');
    });

    app.get('/profile', function(request, response){
        response.render('Profile/profile_template');
    });





    
};