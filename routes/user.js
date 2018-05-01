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