const Parser = require('rss-parser');
let parser = new Parser();

parser.parseURL('http://feeds.reuters.com/reuters/businessNews', function(error,feed) {
    //console.log(feed);
    feed.items.forEach(function(entry) {
      console.log(entry.title);
    });
  });