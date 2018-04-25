const mongoose = require('mongoose');

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
        userId: String
    }],

    followers:[{
        userId: String
    }],
    posts:[{
        post: mongoose.Schema.Types.ObjectId
    }]

});

const User = module.exports = mongoose.model('User', UserSchema);