const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport){
	passport.use(new LocalStrategy(
	  function(username, password, done) {
		   User.getUserByUsername(username, function(err, user){		//Get user details from database based on the username entered by the user
		   	if(err) throw err;

		   	if(!user){						//If user was not found in the database, show error message on the login page
		   		return done(null, false, {message: 'Unknown User'});
		   	}

		   	if(user && user.status!="Active"){		//If user was found, but is a deactiavted user, show error on the login page
		   		return done(null, false, {message: 'Access Denied'});
		   	}

		   	User.comparePassword(password, user.password, function(err, isMatch){		//if above conditions passed, match the passwprd provided with that in the database
		   		if(err) throw err;
		   		if(isMatch)
		   			return done(null, user);		//If all went well, allow the user to log in       
		   		else
		   			return done(null, false, {message: 'Invalid password'});	//If password did not match, show error on the login page
		   	});
	   });
	}));

	passport.serializeUser(function(user, done) {
	  done(null, {
		      _id: user["_id"],				//to make these current user data available via "req.session.passport.user"
		      username: user["username"],
		      customerId: user["customerId"],
		      role: user["role"],
		      locations: user["locations"]		      
   		});
	});

	passport.deserializeUser(function(_id, done) {
	  User.getUserById(_id, function(err, user) {
	    done(err, user);
	  })
	});
}