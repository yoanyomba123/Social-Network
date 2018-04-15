// Author : D Yoan L Mekontchou Yomba

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieSession =  require('cookie-session');
const passport = require('passport');
const keys = require('./config/keys');


require('./models/user');
require('./services/passport');

// connect to mongodb virtual instance
mongoose.connect(keys.MongoURI);

const app = express();

// enable cookies
app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [ keys.CookieKey]
    })
);

// make use of authentication middleware
app.use(passport.initialize());
// allow passport middleware to serialize and deserialize a user
app.use(passport.session());

require('./routes/authenticationRoutes')(app);

const PORT = process.env.PORT || 3000;

app.listen(PORT);


