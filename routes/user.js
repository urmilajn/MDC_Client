const express = require('express');
const router = express.Router();

const User = require('../models/user');

/** SHOW ALL EMPLOYEES TO MANAGERS ONLY *****************************************************************************************************************/

router.get('/manageUsers', User.ensureAuthenticated, User.isManager, function(req, res){
	
	User.getEmployees(req.session.passport.user.customerId, function(err, users){
		if(err) throw err;
		else
			res.render('manageUsers.handlebars', {employees: users});
	});	
});

/** ADD USER ****************************************************************************************************************************************/

//Add User - Get
router.get('/addUser', User.ensureAuthenticated, User.isManager, function(req, res){
	res.render('addUser.handlebars', {locations: req.session.passport.user.locations});
});


//Add User - Process & Reply
router.post('/addUser', User.ensureAuthenticated, User.isManager, function(req, res){
	
	//New user details
	var username = req.body.username.trim();
	var password = req.body.password.trim();
	var empLocations = req.body.locations;

	//Get session variables
	var customerId = req.session.passport.user.customerId;
	var managerLocations = req.session.passport.user.locations;

	// Validation
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('locations', 'At least one location is required').notEmpty();

	var errors = req.validationErrors();

	if(errors)
		res.render('addUser.handlebars', {errors: errors, locations: managerLocations});

	else {
		//Check if username is already taken
		User.getUserByUsername(username, function(err,user) {
			if(err) throw err;

			else if(user) {		//validation error is name is taken
				errors = [{param: 'username', msg: 'Username is already taken', value: '' }];
				res.render('addUser.handlebars', {errors: errors, locations: managerLocations});
			}

			else {		//create new user if username is available
					var newUser = new User({
						username: username,
						password: password,
						customerId: customerId,
						role: 'employee',
						locations: empLocations		//status is set to Active by default at the db level
					});

				User.createUser(newUser, function(err, result){
					if(err) throw err;
				});

				req.flash('success_msg', 'User added successfully');
				res.redirect('/user/manageUsers');
			}
		});		
	}
});

//Add user - Cancel
router.post('/cancelUser', User.ensureAuthenticated, User.isManager, function(req, res){
	User.getEmployees(req.session.passport.user.customerId, function(err, users){
		if(err) throw err;
		else
			res.render('manageUsers.handlebars', {employees: users});
	});
});

/** EDIT USER ****************************************************************************************************************************************/

//Get user details for the user "selected"
router.post('/editUser', User.ensureAuthenticated, User.isManager, function(req, res){
	
	var userId = req.body.userId;
	var username = req.body.username;
	var managerLocations = req.session.passport.user.locations;

	res.cookie('userId', userId);	//set the employee user being edited in cookies
	// Note: This user i.e. cookie > user is the employee being edited. The user in session is the manager user. Both are not the same.

	res.render('editUser.handlebars', {username: username, locations: managerLocations});
});

//Save the changes
router.post('/updateUser', User.ensureAuthenticated, User.isManager, function(req, res){
	
	//Get updated user details
	var username = req.body.username.trim();
	var password = req.body.password.trim();
	var empLocations = req.body.locations;
	var status = req.body.status;

	//Get cookies & session variables
	var userId = req.cookies.userId;
	var managerLocations = req.session.passport.user.locations;

	// Validation
	req.checkBody('username', 'Username is required').notEmpty();
	var errors = req.validationErrors();

	if(errors)
		res.render('editUser.handlebars', {errors: errors, locations: managerLocations});

	/* username and/or password and/or employee location and/or status can be updated
	   if username is being updated i.e. changed, check if the new username is already taken */

	else {
		User.getUserByUsername(username, function(err,user) {

			var updateUser = {};

			if (err) throw err;

			else if(user) {		//if user is found it means we either got current user's details or it means a clash of username
				if(user._id!=userId) {	//check if it is a clash of usernames
					errors = [{param: 'username', msg: 'Username is already taken', value: '' }];
					res.render('editUser.handlebars', {errors: errors, username: username, locations: managerLocations});
				}
				else {					//if is not a clash, it means we are trying to update details for the same user
					if(password!='')								//skip if empty
						updateUser.password = password;
					if(empLocations)								//skip if empty
						updateUser.locations = empLocations;
					if(status)										//skip if empty
						updateUser.status = status;

					User.updateUserById(userId, updateUser, function(err, result) {		//update to database
						if(err) throw err;
					});

					req.flash('success_msg', 'User details updated successfully');
					res.redirect('/user/manageUsers');
				}
			}

			else {	//it is same user but different username, update everything
				updateUser.username = username;
				if(password!='')								//skip if empty
					updateUser.password = password;
				if(empLocations)									//skip if empty
					updateUser.locations = empLocations;
				if(status)										//skip if empty
					updateUser.status = status;

				User.updateUserById(userId, updateUser, function(err, result) {		//update to database
					if(err) throw err;
				});

				req.flash('success_msg', 'User details updated successfully');
				res.redirect('/user/manageUsers');
			}
		});	
	}
}); //Updated user

//Cancel update is same as Cancel add

/** SHOW MANAGERS (NOT EDITABLE) **************************************************************************************************************************/

router.get('/showManagers', User.ensureAuthenticated, User.isManager, function(req, res){
	
	User.getManagers(req.session.passport.user.customerId, function(err, users){
		if(err) throw err;
		else
			res.render('showManagers.handlebars', {managers: users});
	});	
});

/****************************************************************************************************************************************************/

module.exports = router;