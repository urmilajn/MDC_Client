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

module.exports.ensureAuthenticated = function(req, res, next){	//Used
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

module.exports.isManager = function(req, res, next){	//Used
	var role = req.session.passport.user.role;
	if(role=='manager' || role=='regionalManager') {
		return next();
	} else {
		res.redirect('/home');
	}
}

module.exports.getUserByUsername = function(username, result){	//Used
	User.findOne({username: username}, result);
}

module.exports.getUserById = function(id, result){	//Used
	User.findById(id, result);
}

module.exports.comparePassword = function(candidatePassword, hash, result){	//Used
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	result(null, isMatch);
	});
}

module.exports.getEmployees = function(customerId, result){	//Used
	User.find({role: 'employee', customerId: customerId}, result);
}

module.exports.getManagers = function(customerId, result){	//Used
	var query = {$and: [
					{$or: [{role: 'manager'}, {role: 'regionalManager'}]},
					{customerId: customerId}]};
	User.find(query, result);
}

module.exports.changePassword = function(req, result){		//Used
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(req.body.newPassword, salt, function(err, hash) {
	    	var query = {_id: req.session.passport.user};
	        User.update(query, {$set: {password: hash}}, result);
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