const Parser = require('rss-parser');
const rsscontent = require('../config/rssfeeds');
let parser = new Parser();

const finance = rsscontent.Finance;
const economics = rsscontent.Econonmics;
const blogs = rsscontent.Blogs;

const feedcontent = {};
const datastruct = [];

for(var i=0; i < finance.length; i++){
  parser.parseURL(finance[i], function(error, feedObject){
    feedObject.items.forEach(function(entry){
      datastruct.push(entry);
    });
  });
  if( i == finance.length -1){
    feedcontent["finance"] = datastruct;
  }
}

console.log(feedcontent["finance"]);