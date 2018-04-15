const mongoose = require('mongoose');

// bring in model class
let Article = require('../models/article');

module.exports = app => {
    // home route
    app.get('/business', function(request, response){
        response.render('our_business');
    });

};