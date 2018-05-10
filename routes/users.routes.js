const users = require('../controllers/user.controller');
const User = require('../models/user');
const express = require('express');
const router = express.Router();
const passport = require('passport');
var ObjectId = require('mongoose').Types.ObjectId;
var stream_node = require('getstream-node');
var stream = require('getstream');
var FeedManager = stream_node.FeedManager;
var config = require('../config/keys');

// instantiate a stream client server side
var client = stream.connect(config.StreamConfig.apiKey, config.StreamConfig.apiSecret);

var ensureAuthenticated = function(request, response, next){
    if(request.isAuthenticated){
        return next();
    }
    response.redirect('/login');
}

module.exports = router;

router.use(function(request, response, next) {
	if (request.isAuthenticated()) {
		response.locals = {
			StreamConfigs: stream_node.settings,
			NotificationFeed: FeedManager.getNotificationFeed(
				request.user.id || request.user.github_id
			)
		};
	}
	next();
});

router.use(function(error, request, response, next) {
	if (!error) {
		next();
	} else {
		console.error(error.stack);
		response.send(500);
	}
});

router.use(function(request, response, next) {
	if (!request.isAuthenticated()) {
		return next();
	} else if (!request.user.id) {
		User.findOne({ username: req.user.username })
			.lean()
			.exec(function(err, user) {
				if (err) {
                    return next(err);
                }
				notificationFeed = FeedManager.getNotificationFeed(user._id);
				request.user.id = user._id;
				request.user.token = notificationFeed.token;
				request.user.APP_ID = FeedManager.settings.apiAppId;
				request.user.APP_KEY = FeedManager.settings.apiKey;

				notificationFeed.get({ limit: 0 }).then(function(body) {
					if (typeof body != 'undefined')
						request.user.unseen = body.unseen;
					next();
				});
			});
	} else {
		next();
	}
});



router.get('*', function(request, response, next){
    response.locals.user = request.user || null;
    next();
});
router.get('/register', users.signup);
router.post('/register', users.authenticateUser);
router.get('/login', users.login);
router.post('/login',  passport.authenticate('local', { 
    failureRedirect: '/login',
    failureFlash: true 
}),
    function(request, response) {
        response.redirect('/UserFeed');
});

router.get('/logout', ensureAuthenticated, users.logout);
router.post('/:user/update', ensureAuthenticated, users.updateUser);
router.delete('/:user/delete', ensureAuthenticated, users.deleteUser);
router.get('/network', ensureAuthenticated, users.showAllUsers);
router.get('/:user/posts', ensureAuthenticated, users.showPosts);
router.get('/profile', ensureAuthenticated, users.showUserProfile);

// test
router.get('/UserFeed',ensureAuthenticated, users.getUserFeed);
router.post('/View/user/:id',ensureAuthenticated, users.getSomeUserProfile);
router.get('/follow/user/:id',ensureAuthenticated, users.followSomeUser);
router.get('/NewsFeed',ensureAuthenticated, users.getNewsFeed);

// implement this later
router.get('/unfollow/user/:id',ensureAuthenticated, users.unfollowSomeUser);
router.get('/notifications',ensureAuthenticated, users.getNotifications);


