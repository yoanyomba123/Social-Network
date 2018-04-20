const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
// bring in model class
let Article = require('../models/article');

module.exports = app => {
    // home route
    app.use('/public',express.static(path.join(__dirname, 'public')));

    app.get('/business', function(request, response){
        response.render('our_business', {
            image: '../public/static/yoyo.png'
        });
    });

};