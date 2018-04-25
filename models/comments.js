const mongoose = require('mongoose');

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
});

const comments = module.exports = mongoose.model('Comments', CommentSchema);