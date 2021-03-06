const Parser = require('rss-parser');
let parser = new Parser({
    customFields: {
    feed: ['otherTitle', 'extendedDescription'],
    item: ['coAuthor','subtitle'],
  }});

let ortoo_parse = require('ortoo-feedparser');
let async = require('async');
const mongoose = require('mongoose');
const rsscontent = require('../config/rssfeeds');
let fetch = require('isomorphic-fetch');
// bring in model class
let Article = require('../models/article');
var businessrsslist = ['http://www.wsj.com/xml/rss/3_7031.xml'];

// acquiring actualy feed ursl
let financeurls = rsscontent.Finance;
let economicsurls = rsscontent.Econonmics;
let blogurls = rsscontent.Blogs;
let socialurls = rsscontent.Social;
let filingsurls = rsscontent.MutualFundFilings;
let cryptourls = rsscontent.CryptoCurrencies;

module.exports = app => {
    // home route
    app.get('/', function(request, response){
        response.render('home');
    });


    app.get('/markets', function(request, response){
        Promise.all(financeurls.map(url => fetch(url).then(resp => parser.parseURL(url))
            )).then(texts => {
                response.render('Landing_Site/markets/markets_file', {
                    feeds: texts
                })   
            });

    });

    app.get('/economy', function(request, response){
        Promise.all(economicsurls.map(url => fetch(url).then(resp => parser.parseURL(url))
            )).then(texts => {
                response.render('Landing_Site/economy/economy_file', {
                    feeds: texts
                })   
            });

    });

    app.get('/opinions', function(request, response){
        Promise.all(blogurls.map(url => fetch(url).then(resp => parser.parseURL(url))
            )).then(texts => {
                response.render('Landing_Site/commentary/commentary_file', {
                    feeds: texts
                })   
            });

    });

    app.get('/social', function(request, response){
        Promise.all(socialurls.map(url => fetch(url).then(resp => parser.parseURL(url))
            )).then(texts => {
                console.log(texts[1].items[1].content);
                response.render('social', {
                    feeds: texts
                })   
            });
        });
    
    app.get('/filings', function(request, response){
        Promise.all(filingsurls.map(url => fetch(url).then(resp => parser.parseURL(url))
            )).then(texts => {                
                response.render('Landing_Site/fund_filings/fund_filings_file', {
                    feeds: texts
                })
            });
        });
  
    app.get('/crypto', function(request, response){
        Promise.all(cryptourls.map(url => fetch(url).then(resp => parser.parseURL(url))
            )).then(texts => {  
                console.log(texts[0].items[0].enclosure.url);
                             
                response.render('Landing_Site/cryptocurrency/cryptocurrency_file', {
                    feeds: texts
                })
                       
            });
        });
};