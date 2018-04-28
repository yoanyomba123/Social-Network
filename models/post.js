const mongoose = require('mongoose');
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
    }
});

/*
PostSchema.pre("save", function(next){
    if(this.favorites){
        this.favoritesCount = this.favorites.length;
    }

    if(this.favorites){
        this.favoriters = this.favorites;
    }
    next();
});
*/
const post = module.exports = mongoose.model('Post', PostSchema);