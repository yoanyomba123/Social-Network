// imports
var passport = require('passport');
var mongoose = require('mongoose');
var express = require('express');
var path = require('path');
var keys = require('./config/keys');
var database = require('./config/database');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var cors = require("cors");
var bodyParser = require("body-parser");
var request = require("request");
var parseString = require('xml2js').parseString;
var stream_node = require('getstream-node');
var expressLayouts = require('express-ejs-layouts');
var expressSession = require('express-session');

users = require('./routes/users.routes');
posts = require('./routes/post.routes');
// initialize app
app = express();

// make use of cors module
app.use(cors());

// connect to my database
mongoose.connect(database.database);
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
//app.use('/public',express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + "/public"));

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

// passport config
require('./config/passport')(passport);
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(users);
app.use(posts);

// make use of routes
require('./routes/routes')(app);
require('./routes/business')(app);
require('./routes/rssroutes')(app);
//require('./routes/users')(app);
require('./routes/LoggedIn/Portfolio')(app);



// load view engines
app.engine('pug', require('pug').__express)
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');
 

// define server port
const PORT = process.env.PORT || 8000;
// start sever
app.listen(PORT);
