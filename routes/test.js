const express = require('express');
const router = express.Router();

const Admin = require('../models/admin');
const Customer = require('../models/customer');
const User = require('../models/user');

/** DASHBOARD *****************************************************************************************************************************************/

//Get customer details from "customers" collection
router.get('/', function(req, res){
   	
   	var taken = User.usernameTaken('abc');
   	console.log('test ' + taken);
   	res.end();
});



/****************************************************************************************************************************************************/

module.exports = router;