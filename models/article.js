const mongoose = require('mongoose');

// article schem
let articlesSchema = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    author:{
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    }
});

let article = module.exports = mongoose.model('Article', articlesSchema);