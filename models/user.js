const config = require('../config/database');
const bcrypt = require('bcryptjs');
const mongo = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(config.database);    //getting url from config/database.js instead of connecting directly
const db = mongoose.connection;

//User Schema
var UserSchema = mongoose.Schema({
	username: {					//unique across the entire idm system
		type: String,
		required: true,
		unique: true,
		index: true
	},
	password: {					//hash value
		type: String,
		required: true
	},
	customerId: {				//lookup from customers
		type: mongoose.Schema.Types.ObjectId,
		required: true
	},
	role: {						//static - employee | manager | regionalManager - validated by front end
		type: String,
		required: true
	},
	locations: {				//subset of current-customer > locations
		type: [String],
		required: true
	},
	status: {
		type: String,
		default: "Active"			//Active or Inactive
	}
});

var User = module.exports = mongoose.model('User', UserSchema);	//mongoose understands 'User' as 'users' collection within idm db

module.exports.ensureAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

module.exports.getUserByUsername = function(username, result){
	User.findOne({username: username}, result);
}

module.exports.getUserById = function(id, result){
	User.findById(id, result);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.changePassword = function(req, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
	    	var query = {_id: req.session.passport.user};
	        User.update(query, {$set: {password: hash}}, callback);
	    });
	});
}

module.exports.createUser = function(newUser, result){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(result);
	    });	
	});
}

module.exports.getUsersByRole = function(role, customerId, results){
	User.find({role: role, customerId: customerId}, results);
}

module.exports.updateUserById = function(id, newUser, result){
	if(newUser.password) {
		bcrypt.genSalt(10, function(err, salt) {
		    bcrypt.hash(newUser.password, salt, function(err, hash) {
		        newUser.password = hash;
		        User.update({_id: id}, {$set: newUser}, result);
		    });	
		});
	}	
	else
		User.update({_id: id}, {$set: newUser}, result);
}