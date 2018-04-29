const mongoose = require('mongoose');
    config = require('../config/keys'),
    _ = require("underscore"),
    Schema = mongoose.Schema,
    Stream_node = require('getstream-node');

var feedManager = Stream_node.FeedManager;
// connect mongoose to stream.io
var streamMongoose = Stream_node.mongoose;


// Post Comment
const CommentSchema = mongoose.Schema({
    user_id:{
        type: mongoose.Schema.Types.ObjectId
    },
    body:{
        type: String,
        required: true
    },
    posted:{
        type: Date,
        default: Date.now
    },
    update:{
        type:Date,
        default: Date.now
    },
    post_id:{
        type: mongoose.Schema.Types.ObjectId
    }
},
{
    collection: 'Comments',
});

const comments = module.exports = mongoose.model('Comments', CommentSchema);
streamMongoose.setupMongoose(mongoose);