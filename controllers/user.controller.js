const User = require('../models/user');
const Post = require('../models/post');
const bcrypt = require('bcryptjs');
const passport = require('passport');


module.exports = {
    home,
    signup,
    login,
    loginAuth,
    logout,
    generatePassword,
    authenticateUser,
    updateUser,
    deleteUser,
    showPosts,
    showAllUsers,
    showUserProfile
  }


function home(request, response, next){
    var query = {'_id':request.user._id};
    User.findById(query, function(error, user){
        if(error){
            console.log(error);
            console.log("ERROR");
            return;
        }

        if(!user){
            return new Error("User Not Found");
        }

        console.log(user);
        response.render('Profile/User/user_profile', {
            user: user
        });
    });

}

// define signup function
function signup(request, response, next){
    response.render('Landing_Site/Signup/sign_up_file');
}

// login function
function login(request, response, next){
    response.render('Landing_Site/Sign_In/sign_in_file');
}

// login auth
function loginAuth(){
    passport.authenticate('local', { 
        failureRedirect: '/home',
        failureFlash: true 
    },function(request, response) {
        response.redirect('/profile');
});
}
//logout function
function logout(request, response, next){
    request.logout();
    response.locals.user = null;
    request.flash('success', 'You are logged out');
    response.redirect('/login');
}


// generates a user password
function generatePassword(request, response, tempUser, message){
    bcrypt.genSalt(10, function(error, salt){
        bcrypt.hash(tempUser.password, salt, function(error, hash){
            if(error){
                console.log(error);
            }
            tempUser.password = hash;
            tempUser.save(function(error){
                if(error){
                    console.log(error);
                    request.flash('warning', "Failure For Correct Registrations");
                    response.redirect('/');
                    return;
                }
                else{
                    request.flash('success', message);
                    response.redirect('/login');
                }
            })
        });
    });
}

// authenticating function
function authenticateUser(request, response){
    const firstname = request.body.first_name;
    const lastname = request.body.last_name;        
    const email = request.body.email;
    const username = request.body.username;
    const password = request.body.password;
    const confirmpassword = request.body.confpassword;
    
    request.checkBody('first_name', 'Name is required').notEmpty();
    request.checkBody('first_name', 'Name is required').notEmpty();
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
            first_name: firstname,
            last_name: lastname,
            email:email,
            username:username,
            password:password
        });

        let message = 'You are now registered and can log in';
        generatePassword(request, response,newUser, message);
    }
}


// updates a user
function updateUser(request, response, next){
    User.findOne({'username':request.session.user.username}, function(error, user){
        if(error){
            
        }
        if(request.body.username){
            user.username = request.body.username;
        }

        if(request.body.email){
            user.email = request.body.email;
        }

        if(request.body.password){
            let message = 'Password Updated';
            generatePassword(request, response,user, message);
        }

        user.save(function(error){
                if(error){
                    console.log(error);
                    return;
                }
                else{
                    request.flash('success', message);
                    response.redirect('/');
                }
        });
    });
}

// delete a user
function deleteUser(request, response, next){
    if(!request.params.user){
        return next(new Error('Missing user id'));
    }

    User.remove({'username': request.session.user.username}, function(error, user){
        if(!user){
            return next(new Error('User not found'));
        }
        if(error){
            return next(error);
        }
        logout(request, response, next);
    });
}

// shows all of a user's post
function showPosts(request, result, next){
    if(!request.params.user){
        return next(new Error('User not Found'));
    }
    console.log(request);
    User.findOne({'username': request.session.user.username}, function(user, error){
        if(error){
            return next(error);
        }

        if(!user){
            return next(new Error('User Not found'));
        }

        Post.find({'user_id': request.params.id},function(error, posts){
            if(error){
                return next(error);
            }    
            response.render('profile', {
                user: user,
                posts: posts
            });
        });
    });
}

// show all users
function showAllUsers(request, response, next) {
    User.find({}, function (error, users) {
      if (error){
          return next(err);
      }
        response.render('userlist', {
            user: req.session.user,
            users: users
        });
    });
  }

// Show User Profile
function showUserProfile(request, response, next) {
    User.findOne({
        email:request.body.email
    }, function(error, user) {
        if (error){
            return next(err);
        }
    	response.render('Profile/profile_template', {user: user});
  });
}