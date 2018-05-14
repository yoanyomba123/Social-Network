const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comments");
const Follow = require("../models/follow");
const bcrypt = require("bcryptjs");
const passport = require("passport");
var ObjectId = require("mongoose").Types.ObjectId;
var stream_node = require("getstream-node");
var stream = require("getstream");
var fs = require("fs");
var _ = require("underscore");
var FeedManager = stream_node.FeedManager;
var StreamMongoose = stream_node.mongoose;
var StreamBackend = new StreamMongoose.Backend();
var streamconfig = require("../getstream");
var client = stream.connect(
  streamconfig.apiKey,
  streamconfig.apiSecret,
  streamconfig.apiAppId
);

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
var ensureAuthenticated = function(request, response, next) {
  if (request.isAuthenticated) {
    return next();
  }
  response.redirect("/login");
};

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

var i_dont_follow = function(users) {
  var people_set = _.filter(users, function(user) {
    return user.followed != "true";
  });
  return people_set;
};
module.exports = {
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
  getNewsFeed,
  getNotifications
};

// define signup function
function signup(request, response, next) {
  response.render("Landing_Site/Signup/sign_up_file");
}

// login function
function login(request, response, next) {
  response.render("Landing_Site/Sign_In/sign_in_file");
}

// login auth
function loginAuth() {
  passport.authenticate(
    "local",
    {
      failureRedirect: "/login",
      failureFlash: true
    },
    function(request, response) {
      response.redirect("/UserFeed");
    }
  );
}
//logout function
function logout(request, response, next) {
  request.logout();
  response.locals.user = null;
  request.flash("success", "You are logged out");
  response.redirect("/login");
}

// generates a user password
function generatePassword(request, response, tempUser, message) {
  bcrypt.genSalt(10, function(error, salt) {
    bcrypt.hash(tempUser.password, salt, function(error, hash) {
      if (error) {
        console.log(error);
      }
      tempUser.password = hash;
      tempUser.save(function(error) {
        if (error) {
          console.log(error);
          request.flash("warning", "Failure For Correct Registrations");
          response.redirect("/");
          return;
        } else {
          request.flash("success", message);
          response.redirect("/login");
        }
      });
    });
  });
}

// authenticating function
function authenticateUser(request, response) {
  const firstname = request.body.first_name;
  const lastname = request.body.last_name;
  const email = request.body.email;
  const username = request.body.username;
  const password = request.body.password;
  const confirmpassword = request.body.confpassword;

  request.checkBody("first_name", "Name is required").notEmpty();
  request.checkBody("first_name", "Name is required").notEmpty();
  request.checkBody("email", "Email is required").notEmpty();
  request.checkBody("email", "Email is not valid").isEmail();
  request.checkBody("username", "Username is required").notEmpty();
  request.checkBody("password", "Password is required").notEmpty();
  request
    .checkBody("confpassword", "Passwords Do Not Match")
    .equals(request.body.password);

  let errors = request.validationErrors();

  if (errors) {
    response.render("Landing_Site/Signup/sign_up_file", {
      errors: errors
    });
  } else {
    let newUser = new User({
      first_name: firstname,
      last_name: lastname,
      email: email,
      username: username,
      password: password
    });

    let message = "You are now registered and can log in";
    generatePassword(request, response, newUser, message);
  }
}

// updates a user
function updateUser(request, response, next) {
  User.findOne({ username: request.session.user.username }, function(
    error,
    user
  ) {
    if (error) {
    }
    if (request.body.username) {
      user.username = request.body.username;
    }

    if (request.body.email) {
      user.email = request.body.email;
    }

    if (request.body.password) {
      let message = "Password Updated";
      generatePassword(request, response, user, message);
    }

    User.update(user, function(error) {
      if (error) {
        console.log(error);
        return;
      } else {
        request.flash("success", message);
        response.redirect("/");
      }
    });
  });
}

// delete a user
function deleteUser(request, response, next) {
  if (!request.params.user) {
    return next(new Error("Missing user id"));
  }

  User.remove({ username: request.session.user.username }, function(
    error,
    user
  ) {
    if (!user) {
      return next(new Error("User not found"));
    }
    if (error) {
      return next(error);
    }
    logout(request, response, next);
  });
}

// shows all of a user's post
function showPosts(request, result, next) {
  if (!request.params.user) {
    return next(new Error("User not Found"));
  }
  console.log(request);
  User.findOne({ username: request.session.user.username }, function(
    user,
    error
  ) {
    if (error) {
      return next(error);
    }

    if (!user) {
      return next(new Error("User Not found"));
    }

    Post.find({ user_id: request.params.id }, function(error, posts) {
      if (error) {
        return next(error);
      }
      response.render("profile", {
        user: user,
        posts: posts
      });
    });
  });
}

/*
@Description : This Method allows us to see all user presently in the network. We do not show users that we follow already or ourself
@Access: Private - Must Be logged In 
@Route: /myNetwork
*/
function showAllUsers(request, response, next) {
  User.find({})
    .lean()
    .exec(function(error, people) {
      Follow.find({ user: request.user.id }).exec(function(error, follows) {
        if (error) {
          return next(error);
        }
        did_i_follow(people, follows);

        // remove current user from people array as well as any user we follow
        var people_network = _.reject(people, function(arrItem) {
          return arrItem.followed == true || arrItem._id == request.user.id;
        });

        console.log(request.user);
        return response.render("Profile/User/userlist", {
          location: "people",
          user: request.user,
          people: people_network,
          path: request.url,
          show_feed: false
        });
      });
    });
}

// Show User Profile
function showUserProfile(request, response, next) {
  User.findOne(
    {
      email: request.body.email
    },
    function(error, user) {
      if (error) {
        return next(err);
      }
      response.render("Profile/User/user_profile", { user: user });
    }
  );
}

// show user notifications
function getNotifications(request, response, next) {
  var notificationFeed = FeedManager.getNotificationFeed(request.user._id);
  notificationFeed
    .get({ mark_read: true, mark_see: true })
    .then(function(body) {
      var activities = body.results;
      console.log("YOMBAE\n\n\n");
      if (activities.length == 0) {
        return response.send("");
      } else {
        request.user.unseen = 0;
        return StreamBackend.enrichActivities(activities[0].activities);
      }
    })
    .then(function(enrichedActivities) {
      console.log(enrichActivities);
      response.render("Profile/User/notifications_follow", {
        lastFollower: enrichedActivities[0],
        count: enrichedActivities.length
      });
    });
}

// follow a user
function followUser(request, response) {
  console.log(request);
  let query = { _id: request.user._id };
  User.findById(query, function(error, user) {
    if (error) {
      console.log(error);
    }
    if (!request.params.id) {
      console.log("User does not exits");
    }
    user.following.push(ObjectId(request.params.id));

    // allow user to be added as follower
    user.save();
    let query = { _id: request.params.id };
    User.findById(query, function(error, user) {
      if (error) {
        console.log(error);
      }
      if (!user) {
        console.log("User does not exist");
      }
      user.followers.push(ObjectId(request.user._id));
    });

    console.log(user);
    response.redirect("/myprofile");
  });
}

/*
    Get Your NewsFeed
*/
function getNewsFeed(request, response, next) {
  var flatFeed = FeedManager.getNewsFeeds(request.user.id)["aggregated"];
  flatFeed
    .get({})
    .then(enrichAggregatedActivities)
    .then(function(enrichedActivities) {
      console.log("\n\n\n\n\n\n\n");
      console.log(enrichedActivities);
      console.log("\n\n\n\n\n\n\n");
      for (var i = 0; i < enrichedActivities.length; i++) {
        for (var j = 0; j < enrichedActivities[i].activities.length; j++) {
          console.log(enrichedActivities[i].activities[j].object);
          console.log("\n\n\n\n\n\n\n");
        }
      }

      response.render("Profile/User/newsfeed", {
        location: "feed",
        user: request.user,
        activities: enrichedActivities,
        path: request.url
      });
    })
    .catch(next);
}

/*
    Get Your Own Profile
    Get Some Other User's Profile
*/
function getUserFeed(request, response, next) {
  var UserFeed = FeedManager.getUserFeed(request.user.id);
  console.log(UserFeed);

  UserFeed.get({})
    .then(enrichActivities)
    .then(function(enrichedActivities) {
      console.log(enrichedActivities);
      User.find({})
        .lean()
        .exec(function(error, people) {
          Follow.find({ user: request.user.id }).exec(function(error, follows) {
            if (error) {
              return next(error);
            }
            did_i_follow(people, follows);
            // remove current user from people array as well as any user we follow
            var following = _.reject(people, function(arrItem) {
              return arrItem.followed != true || arrItem._id == request.user.id;
            });
            response.render("Profile/User/user_profile_view", {
              location: "profile",
              user: request.user,
              following: following,
              profile_user: request.user,
              activities: enrichedActivities,
              path: request.url,
              show_feed: true
            });
          });
        });
    })
    .catch(next);
}

function getSomeUserProfile(request, response, next) {
  User.findOne({ _id: request.params.id }, function(error, founduserid) {
    if (error) {
      return next(error);
    }
    if (!founduserid) {
      return response.send("User" + request.params.id + "Not Found");
    }
    var flatfeed = FeedManager.getUserFeed(founduserid._id);
    flatfeed
      .get({})
      .then(enrichActivities)
      .then(function(enrichedActivities) {
        console.log(enrichedActivities[0].object.user);
        User.find({})
          .lean()
          .exec(function(error, people) {
            Follow.find({ user: founduserid._id }).exec(function(
              error,
              follows
            ) {
              if (error) {
                return next(error);
              }
              did_i_follow(people, follows);
              // remove current user from people array as well as any user we follow
              var following = _.reject(people, function(arrItem) {
                return (
                  arrItem.followed != true || arrItem._id == request.user.id
                );
              });
              response.render("Profile/User/user_profile_view", {
                location: "profile",
                user: founduserid,
                following: following,
                profile_user: founduserid,
                activities: enrichedActivities,
                path: request.url,
                show_feed: true
              });
            });
          });
      });
  });
}

/*
    Follow Some User
    Unfollow Some User
*/
function followSomeUser(request, response, next) {
  console.log(request.params.id);
  User.findById({ _id: request.params.id }, function(error, targetuser) {
    if (targetuser) {
      var followData = {
        user: request.user._id,
        target: request.params.id
      };
      Follow.find(followData, function(error, data) {
        if (error) {
          return next(error);
        }
        if (data.length == 0 || data == undefined) {
          var follow = new Follow(followData);
          follow.save(function(error) {
            if (error) {
              return next(error);
            }
          });
          updateUserFollowed(request.params.id, request.user._id);
          updateUserFollowing(request.user._id, request.params.id);
        }
      });
      response.redirect("/network");
    } else {
      response.status(404).send("Not Found");
    }
  });
}

function showFollowers() {}

function showFollowing() {}

function unfollowSomeUser(request, response, next) {
  Follow.findOne({ user: request.user_id, target: request.params.id }, function(
    error,
    follow
  ) {
    if (follow) {
      follow.remove(function(error) {
        if (error) {
          return next(error);
        }
      });
    } else {
      response.status(404).send("Not Found");
    }
  });
}

function updateUserFollowing(userid, targetid) {
  if (userid == targetid) {
    return;
  }

  User.findById({ _id: userid }, function(error, user) {
    if (error) {
      return error;
    }

    if (!_.contains(user.following, targetid)) {
      user.following.push(targetid);

      User.update({ _id: userid }, user, function(error) {
        if (error) {
          return next(error);
        }
      });
    }
  });
}

function updateUserFollowed(userid, targetid) {
  if (userid == targetid) {
    return;
  }

  User.findById({ _id: userid }, function(error, user) {
    if (error) {
      return error;
    }

    if (!_.contains(user.followers, targetid)) {
      user.followers.push(targetid);

      User.update({ _id: userid }, user, function(error) {
        if (error) {
          return next(error);
        }
      });
    }
  });
}
