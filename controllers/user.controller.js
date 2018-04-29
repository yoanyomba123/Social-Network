const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comments');
const Follow = require('../models/follow');
const bcrypt = require('bcryptjs');
const passport = require('passport');
var ObjectId = require('mongoose').Types.ObjectId
var stream_node = require('getstream-node');
var fs = require('fs');
var _ = require('underscore');
var FeedManager = stream_node.FeedManager;
var StreamMongoose = stream_node.mongoose;
var StreamBackend = new StreamMongoose.Backend();

/*
    STREAM ACTIVITIES
*/
var enrichActivities = function(body) {
	var activities = body.results;
	return StreamBackend.enrichActivities(activities);
};

var enrichAggregatedActivities = function(body) {
	var activities = body.results;
	return StreamBackend.enrichAggregatedActivities(activities);
};

/*
    AUTHENTICATION CHECK
*/
var ensureAuthenticated = function(request, response, next){
    if(request.isAuthenticated){
        return next();
    }
    response.redirect('/login');
}

/*
    FOLLOWERS CHECK
*/
var did_i_follow = function(users, followers) {
	var followed_users_ids = _.map(followers, function(item) {
		return item.target.toHexString();
	});
	_.each(users, function(user) {
		if (followed_users_ids.indexOf(user._id.toHexString()) !== -1) {
			user.followed = true;
		}
	});
};

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
    showUserProfile,
    followUser,
    unfollowSomeUser,
    followSomeUser,
    getSomeUserProfile,
    getUserFeed,
    getNewsFeed
  }


// find user by id
function findUser(request){
    User.findById({'_id': ObjectId(request.params('_id'))}, function(error, user){
        if(error){
            console.log(error);
            return;
        }
        else{
            return user;
        }
    });
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

        //console.log(user);

        var postsObject = [];
        // find all posts the user wrote
        Post.find({"user":user._id}).then(results => {
            //console.log(results);
            response.render('Profile/profile_template', {
                user: user,
                posts: results
            });
        
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
    /*
    User.find({}, function (error, users) {
        if (error){
            return next(err);
        }

        response.render('Profile/User/userlist', {
            user: request.user,
            users: users
        });
    });
    */
    User.find({}).lean().exec(function(error, people){
        Follow.find({user: request.user.id}).exec(function(error, follows){
            if(error){
                return next(error);
            }
            did_i_follow(people, follows);
            // remove current user from people array            
            console.log(people)
            return response.render('Profile/User/userlist', {
                'location': 'people',
                user: request.user,
                people: people,
                path: request.url,
                show_feed: false,
            })
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
    	response.render('Profile/User/user_profile', {user: user});
  });
}

// follow a user
function followUser(request, response){
    console.log(request);
    let query = {'_id':request.user._id};
    User.findById(query,function(error, user){
        if(error){
            console.log(error);
            }
        if(!request.params.id){
            console.log("User does not exits");
        }
        user.following.push(ObjectId(request.params.id));

        // allow user to be added as follower
        user.save();
        let query = {'_id': request.params.id};
        User.findById(query, function(error, user){
            if( error){
                console.log(error);
            }
            if(!user){
                console.log("User does not exist");
            }
            user.followers.push(ObjectId(request.user._id));
        });

        console.log(user);
        response.redirect('/myprofile');
    });

}

/*
    Get Your NewsFeed
*/
function getNewsFeed(request, response, next){
    var flatFeed = FeedManager.getNewsFeeds(request.user.id)['timeline'];
     flatFeed.get({}).then(enrichActivities).then(function(enrichedActivities){
         response.render('feed',{
             location: 'feed',
             user: request.user,
             activities: enrichedActivities,
             path: request.url,
         });
     })
     .catch(next);
}

/*
    Get Your Own Profile
    Get Some Other User's Profile
*/
function getUserFeed(request, response, next){
    var UserFeed = FeedManager.getUserFeed(request.user.id);
    UserFeed.get({}).then(enrichActivities).then(function(enrichedActivities){
        console.log(enrichedActivities);
        response.render('Profile/User/user_profile_view',{
            location: 'profile',
            user: request.user,
            profile_user: request.user,
            activities: enrichedActivities,
            path: request.url,
            show_feed: true
        })
    }).catch(next);
}

function getSomeUserProfile(request, response, next){
    User.findOne({'_id': request.params.id}, function(error, founduserid){
        if(error){
            return next(error);
        }
        if(!founduserid){
            return response.send('User' + request.params.id + 'Not Found');
        }
        var flatfeed = FeedManager.getUserFeed(founduserid._id);
        flatfeed.get({}).then(enrichActivities).then(function(enrichedActivities){
            console.log(enrichedActivities)
            response.render('Profile/User/user_profile_view', {
                location: 'profile',
                user: founduserid,
                profile_user_id: founduserid,
                activities: enrichedActivities,
                path: request.url,
                show_feed: true,
            })
        });

    });
}

/*
    Follow Some User
    Unfollow Some User
*/
function followSomeUser(request, response, next){
    console.log(request.params.id);
    User.findById({'_id': request.params.id}, function(error, targetuser){
        if(targetuser){
            var followData = {
                user: request.user._id,
                target: request.params.id
            };
            

            Follow.find(followData, function(error, data){
                if(error){
                    return next(error);
                }
                if(data.length == 0 || data == undefined){
                    var follow = new Follow(followData);
                    follow.save(function(error){
                        if(error){
                            return next(error);
                        }
                    });
                    updateUserFollowed(request.params.id, request.user._id)
                    updateUserFollowing(request.user._id, request.params.id);
                }
            });
            
               
            response.redirect('/network');
        }
        else{
            response.status(404).send('Not Found');
        }
    }); 
}

function unfollowSomeUser(request, response, next){
    Follow.findOne({user: request.user_id, target: request.params.id}, function(error, follow){
        if(follow){
            follow.remove(function(error){
                if(error){
                    return next(error);
                }
            });
        }
        else{
            response.status(404).send('Not Found');
        }
    });
}

function updateUserFollowing(userid, targetid){
    if(userid == targetid){
        return;
    }
    User.findById({'_id': userid}, function(error, user){
        if(error){
            return error;
        }
        
        if(!_.contains(user.following, targetid)){
            user.following.push(targetid);
            User.update({'_id': userid}, user, function(error){
                if(error){
                    return next(error);
                }
            });
        }
        
    });
}

function updateUserFollowed(userid, targetid){
    if(userid == targetid){
        return;
    }

    User.findById({'_id': userid}, function(error, user){
        if(error){
            return error;
        }

        if(!_.contains(user.followers, targetid)){
            user.followers.push(targetid);
            User.update({'_id': userid}, user, function(error){
                if(error){
                    return next(error);
                }
            });
        }
    });
}