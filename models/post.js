const mongoose = require('mongoose');
// Post schema
const PostSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId
    },
    body:{
        type: String,
        maxlength: 82,
        required: true
    },
    posted:{
        type: Date,
        default: Date.now
    },
    update:{
        type:Date,
        default: Date.now
    }
});

const post = module.exports = mongoose.model('Post', PostSchema);