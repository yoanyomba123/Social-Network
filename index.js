// imports
const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

// initialize app
const app = express();

// connect to my database
mongoose.connect(keys.MONGO_URI);
// define db connection
let db = mongoose.connection;

// check db connection
db.once('open',function(){
    console.log('Connected to MongoDb');
});

// check for db erros
db.on('error', function(error){
    console.log(error);
});

// bring in model class
let article = require('./models/article');

// initialize body parser middleware
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// express session middleware
app.use(session({
    secret: 'AKBhdahskldhfjas',
    resave: true,
    saveUninitialized: true,
}));

// express messages middleware
app.use(require('connect-flash')());
app.use(function(request, response, next){
    response.locals.messages = require('express-messages')(request, response);
    next();
});

// express validator middle ware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }

        return{
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


// make use of routes
require('./routes/routes')(app);
require('./routes/business')(app);
require('./routes/rssroutes')(app);


// load view engines
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');
 

// define server port
const PORT = process.env.PORT || 1000;
// start sever
app.listen(PORT);
