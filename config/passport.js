const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

module.exports = function(passport){
	passport.use(new LocalStrategy(
	  function(username, password, done) {
		   User.getUserByUsername(username, function(err, user){
		   	if(err) throw err;

		   	if(!user){
		   		return done(null, false, {message: 'Unknown User'});
		   	}

		   	if(user && user.status!="Active"){
		   		return done(null, false, {message: 'Access Denied'});
		   	}

		   	User.comparePassword(password, user.password, function(err, isMatch){
		   		if(err) throw err;
		   		if(isMatch)
		   			return done(null, user);        
		   		else
		   			return done(null, false, {message: 'Invalid password'});
		   	});
	   });
	}));

	passport.serializeUser(function(user, done) {
	  done(null, {
		      _id: user["_id"],				//to make these data available via "req.session.passport.user"
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