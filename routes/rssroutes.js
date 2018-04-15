const Parser = require('rss-parser');
let parser = new Parser();
const mongoose = require('mongoose');

// bring in model class
let Article = require('../models/article');
var businessrsslist = ['http://www.wsj.com/xml/rss/3_7031.xml'];
var feedcontent = [];
module.exports = app => {
    // home route
    app.get('/markets', function(request, response){
        for(var i =0; i < businessrsslist.length; i++){
            var data = parser.parseURL(businessrsslist[i], function(error,feed) {
                console.log(feed.items[0])
                /*
                feed.items.forEach(function(entry) {
                    //console.log(entry.title);
                });
                */
                response.render('markets', {
                    feeds: feed.items
                });
            });
        }
    });
};