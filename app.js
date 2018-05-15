/** MDC-CLIENT APPLICATION *********************************************************************************************************************************

This is MDC (Client) application i.e the place where all users (except admin) can log in, and view and/or add Maintenance Data of their respective
Company. The application follows MVC design pattern.

Pre-requisite:
Admin will create the company (a.k.a. customer/client) and assign one or more manager (or regional manager)
Admin will optionally create Employees
Admin will create and maintain forms

Scope:
There are three identified Roles - Regional Manager, Manager, and Employee
All users (irrespective of roles) will have access to view and add data using forms (only data of the company they belong to)
Additionally, users who have the role of Regional Manager or Manager will have data "Edit" access (no delete)
Users who have the role of Regional Manager or Manager will have access to add/edit Employees only (no delete, but can deactive instead)
Username (of any role) is unique across all of IDM's customers (not just within one customer) */

/** ABOUT APP.JS ****************************************************************************************************************************************

This file, app.js is the start point and acts as the node.js server for the MDC-Client application
This file is settings-only which is used across the application
The application once deployed will run on port 9009 of the system
File names, function names, and variable names are kept as self-explainatory as possible */

/*******************************************************************************************************************************************************/

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const httpPort = 9009;

//Controllers a.k.a Routes
const login = require('./routes/login.js');  //validate user
const home = require('./routes/home.js');   //Get all forms, for managers and above, provide option for employee management
const user = require('./routes/user.js');   //User specififc activities - view, add, edit
const form = require('./routes/form.js');   //Form specififc activities - view form, add data, edit data

//Initial app 
const app = express();

//View Engine - Handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
    secret: 'idmsecret',
    saveUninitialized: true,
    resave: true
}));

//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//Passport Config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//Connect Flash -- for flash messages on UI
app.use(flash());

//Global variables
app.get('*', function (req, res, next) {      //set these variables for each incoming "get"
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//Global variables
app.post('*', function (req, res, next) {   //set these variables for each incoming "post"
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', login);                //on GET / go to ./routes/login.js which will take you to views/login.handlebars
app.use('/login', login);           //even on GET /login it should behave as above
app.use('/home', home);
app.use('/user', user);
app.use('/form',form);

//Set Port
app.set('port', process.env.PORT || httpPort);

app.listen(app.get('port'), function(){
	console.log('Server started on port ' + httpPort);
});