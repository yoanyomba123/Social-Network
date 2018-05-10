const mongoose = require('mongoose');
    config = require('../config/keys'),
    _ = require("underscore"),
    Schema = mongoose.Schema,
    Stream_node = require('getstream-node');

var feedManager = Stream_node.FeedManager;
var feedManagerFactory = Stream_node.feedManagerFactory;
// connect mongoose to stream.io
var streamMongoose = Stream_node.mongoose;

// Post schema
const followSchema = mongoose.Schema({
    user: { 
		type: Schema.Types.ObjectId, 
		required: true, 
		ref: 'User' 
	},
	target: { 
		type: Schema.Types.ObjectId, 
		required: true, 
		ref: 'User' 
	},
},
{
	collection: 'Follow',
});

followSchema.plugin(streamMongoose.activity);

followSchema.methods.activityNotify = function() {
	target_feed = feedManager.getNotificationFeed(this.target._id);
	return [target_feed];
};


followSchema.methods.activityForeignId = function() {
	return this.user._id + ':' + this.target._id;
};

followSchema.statics.pathsToPopulate = function() {
	return ['user', 'target'];
};

followSchema.post('save', function(doc) {
	if (doc.wasNew) {
		var userId = doc.user._id || doc.user;
		var targetId = doc.target._id || doc.target;
		feedManager.followUser(userId, targetId);
	}
});

followSchema.post('remove', function(doc) {
	feedManager.unfollowUser(doc.user, doc.target);
});


const follow = module.exports = mongoose.model('Follow', followSchema);
streamMongoose.setupMongoose(mongoose);