const mongoose = require('mongoose');
    config = require('../config/keys'),
    _ = require("underscore"),
    Schema = mongoose.Schema,
    Stream_node = require('getstream-node'),
    stream = require('getstream'),
    config = require('../config/keys');
    
// instantiate a stream client server side
var client = stream.connect(config.StreamConfig.apiKey, config.StreamConfig.apiSecret);
    
var feedManager = Stream_node.FeedManager;
// connect mongoose to stream.io
var streamMongoose = Stream_node.mongoose;

// Post schema
const PostSchema = mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    body:{
        type: String,
        default: "",
        trim: true,
        maxlength: 200,
        required: true
    },
    comments: [
        {
            body: {
                type: String,
                default: "",
                maxlength: 100 
            },
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            commenterName:{
                type: String,
                default: ""
            },
            commenterPicture:{
                type: String,
                default: ""
            },
            createdAt:{
                type:Date,
                default: Date.now
            },
            likes:{
                type:Number,
                default:0
            }
        },
    ],
    favorites:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    favoriters:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    favoritesCount: Number,
    posted:{
        type: Date,
        default: Date.now
    },
    update:{
        type:Date,
        default: Date.now
    },
    likes:{
        type: Number,
        default: 0,
    },
    likers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]},
{
    collection: 'Post',
});

PostSchema.plugin(streamMongoose.activity);
PostSchema.statics.pathsToPopulate = function() {
	return ['user'];
};

// look into this some more
PostSchema.methods.activityForeignId = function(){
    return this.user._id + Date.now();
}

PostSchema.pre("save", function(next){
    if(this.favorites){
        this.favoritesCount = this.favorites.length;
    }

    if(this.favorites){
        this.favoriters = this.favorites;
    }


    next();
});


const post = module.exports = mongoose.model('Post', PostSchema);
streamMongoose.setupMongoose(mongoose);