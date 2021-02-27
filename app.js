/**
 * Created by Ajay Kumar Tripathi on 26/09/2020.
 */
var express = require('express');
var bodyParser = require('body-parser');
var csv = require("fast-csv");
var fs = require('fs');
var app = express();

var mongoose = require('mongoose');
var router = require("./routes");
var deliveryBoyRouter = require('./deliveryBoyRouter');
var path = require('path');
var favicon = require('serve-favicon');
var hbs = require('express-handlebars');
var infobip = require('infobip');
var cookieParser = require("cookie-parser");

var session = require("express-session");
const flash = require('express-flash');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment');



var url = require('url');

//console.log(url)

mongoose.connect("mongodb://localhost:27017/gasdelivery",{ useNewUrlParser: true });
//mongoose.connect("mongodb://bokoadmin:bokoELC@172.31.22.166:27017/bokoELC",{ useNewUrlParser: true });
//mongoose.connect("mongodb://bokoadmin:bokoELC@localhost:27017/bokoELC",{ useNewUrlParser: true });


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ type: 'application/json' }));

app.use(cookieParser());

//Handle Session
app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$iuyi%%^^<MX",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000,
      //secure : true
     }
}));
app.use(flash());
//Handle Passport
app.use(passport.initialize());
app.use(passport.session());

//Flashing
//app.use(require('connect-flash-plus')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//End Flashing

app.use('/',router);
app.use('/deliveryBoy',deliveryBoyRouter);

app.use(express.static(__dirname + '/public'));
app.use('/upload', express.static(__dirname + '/upload'));
app.set("port",process.env.PORT || 3000 );

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

/**
 * View Engine Setup..
 */


app.engine('hbs',hbs({
    helpers:{

        // Function to do basic mathematical operation in handlebar
        compare: function(lvalue, rvalue, options){
            if (arguments.length < 3)
                throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

            var operator = options.hash.operator || "==";

            var operators = {
                '==':       function(l,r) { return l == r; },
                '===':      function(l,r) { return l === r; },
                '!=':       function(l,r) { return l != r; },
                '<':        function(l,r) { return l < r; },
                '>':        function(l,r) { return l > r; },
                '<=':       function(l,r) { return l <= r; },
                '>=':       function(l,r) { return l >= r; },
                'typeof':   function(l,r) { return typeof l == r; }
            };

            if (!operators[operator])
                throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

            var result = operators[operator](lvalue,rvalue);

            if( result ) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        math: function(lvalue, operator, rvalue,opts) {lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue,
            }[operator];
        },
        formatDate:function (date, format) {
            var mmnt = moment(date);
            return mmnt.format(format);
        },
        formatCurrency:function(value) {
            return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        },
    },

    extname:'hbs',
    defaultLayout:'layout',
    layoutsDir: __dirname + '/Views/layouts',
    partialsDir:__dirname + '/Views/partials',
}));


//THE BEGINNING OF ERROR
//
app.get('/404', function(req, res, next){
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
});

app.get('/403', function(req, res, next){
    // trigger a 403 error
    var err = new Error('not allowed!');
    err.status = 403;
    next(err);
});

app.get('/500', function(req, res, next){
    // trigger a generic (500) error
    next(new Error('keyboard cat!'));
});

app.use(function(req, res, next){
    res.status(404);

    res.format({
        html: function () {
            res.render('error_page404', { url: req.url })
        },
        json: function () {
            res.json({ error: 'Not found' })
        },
        default: function () {
            res.type('txt').send('Not found')
        }
    })
});
app.use(function(err, req, res, next){
    // we may use properties of the error object
    // here and next(err) appropriately, or if
    // we possibly recovered from the error, simply next().
    console.log(err)
    res.status(err.status || 500);
    res.render('error_page500', { error: err });
});

//END OF ERROR

app.set('views',path.join(__dirname,'Views'));
app.set('view engine', 'hbs');

var server = app.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

/*************************/
/*** INTERESTING STUFF WITH SOCKETS***/
/*************************/

//var io = require('socket.io').listen(server);
//require('./service/socketHandler.js')(io);