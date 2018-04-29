const mongoose = require('mongoose');
const config = require('../config/keys');
const _ = require("underscore");
const Schema = mongoose.Schema;
const Stream_node = require('getstream-node');

var feedManager = Stream_node.FeedManager;
// connect mongoose to stream.io
var streamMongoose = Stream_node.mongoose;
// user schema
const UserSchema = mongoose.Schema({
    first_name:{
        type: String,
        required: true,
        validate: /[a-z]/
    },
    last_name:{
        type: String,
        required: true,
        validate: /[a-z]/
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    photoUrl:{
        type: String
    },
    bio:{
        type: String,
        maxlength: 100
    },
    following:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    followers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    posts:[{
        post: mongoose.Schema.Types.ObjectId
    }],
    num_posts: Number
},
{
    collection: 'User',
});

UserSchema.statics = {
    followUser: function(id, cb){
        this.findOne({_id: id}).populate("followers").exec(cb);
    }
};
const User = module.exports = mongoose.model('User', UserSchema);
streamMongoose.setupMongoose(mongoose);