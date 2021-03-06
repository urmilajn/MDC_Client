const config = require('../config/database');
const bcrypt = require('bcryptjs');
const mongo = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(config.database);    //getting url from config/database.js instead of connecting directly
const db = mongoose.connection;

/** USER MODEL/SCHEMA *********************************************************************************************************************************/

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
	locations: {				//subset of current-manager > locations
		type: [String],
		required: true
	},
	status: {
		type: String,
		default: "Active"			//Active or Inactive
	}
});

var User = module.exports = mongoose.model('User', UserSchema);	//mongoose understands 'User' as 'users' collection within idm db

/** HELPER AUTHORIZATION FUNCTIONS ********************************************************************************************************************/

//Authentication checked at each page, to restrict the user from manually entering or navigating to previous authorized session
module.exports.ensureAuthenticated = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

/* Authentication checked at each page, to restrict the Employee user from manually entering or navigating to unauthorized pages
(i.e. pages dedicated only to managers) */
module.exports.isManager = function(req, res, next){
	var role = req.session.passport.user.role;
	if(role=='manager' || role=='regionalManager') {
		return next();
	} else {
		res.redirect('/home');
	}
}

/** HELPER DATABASE FUNCTIONS ************************************************************************************************************************/

module.exports.getUserByUsername = function(username, result){
	User.findOne({username: username}, result);
}

module.exports.getUserById = function(id, result){
	User.findById(id, result);
}

module.exports.comparePassword = function(candidatePassword, hash, result){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	result(null, isMatch);
	});
}

module.exports.getEmployees = function(customerId, result){
	User.find({role: 'employee', customerId: customerId}, result);
}

module.exports.getManagers = function(customerId, result){
	var query = {$and: [
					{$or: [{role: 'manager'}, {role: 'regionalManager'}]},
					{customerId: customerId}]};
	User.find(query, result);
}

module.exports.changePassword = function(req, result){
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