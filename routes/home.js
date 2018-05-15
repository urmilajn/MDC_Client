const express = require('express');
const router = express.Router();

const Form = require('../models/form');
const User = require('../models/user');

/** HOME - LANDING PAGE AFTER SUCCESSFUL LOGIN **********************************************************************************************************/

//Show all available forms of current customer
router.get('/', User.ensureAuthenticated, function(req, res){
	
	//Get Session variables
	var role = req.session.passport.user.role;
	var customerId = req.session.passport.user.customerId;
	
	//Get all forms for this customer
	Form.getFormNamesByCustomerID(customerId, function(err, forms){
		if(err) throw err;
		else {
			if(role=='manager' || role=='regionalManager')
				res.render('home.handlebars', {role: role, forms: forms});		//show user management option only for manager/regional manager
			else
				res.render('home.handlebars', {forms: forms});
		}
	});
});

/** CHANGE USER PASSWORD *****************************************************************************************************************************/

//Change Password - Get
router.get('/changePassword', User.ensureAuthenticated, function(req, res){
  res.render('changePassword.handlebars');
});

//Change Password - Process & Reply
router.post('/changePassword', User.ensureAuthenticated, function(req, res){
	
	//Get new password details
	var newPassword = req.body.newPassword.trim();
	var confirmPassword = req.body.confirmPassword.trim();

	//Check if it not empty and matches
	req.checkBody('newPassword', 'Password is empty').notEmpty();
	req.checkBody('confirmPassword', 'Password does not match').equals(newPassword);
	var errors = req.validationErrors();

	if(errors)
		res.render('changePassword.handlebars', {errors: errors});

	else {
		User.changePassword(req, function(err, result){
			if(err) throw err;
		});

		req.flash('success_msg', 'Password changed successfully');
		res.redirect('/home');
	}
});	//Password Changed

//Change Password - Cancel
router.post('/cancelPassword', User.ensureAuthenticated, function(req, res){
	res.redirect('/home');
});

/** LOGOUT ********************************************************************************************************************************************/

//Logout
router.get('/logout', function(req, res){
	
	//clear all created cookies at logout
	res.clearCookie('userId');
	res.clearCookie('formId');		res.clearCookie('formName');

	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/login');
});

/****************************************************************************************************************************************************/

module.exports = router;