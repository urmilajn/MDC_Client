const express = require('express');
const router = express.Router();
const passport = require('passport');

/** LOGIN PAGE ***************************************************************************************************************************************/

//login landing page
router.get('/', function(req, res){
	res.render('login.handlebars');
});

//login request - authenticate user
router.post('/',
	passport.authenticate('local',{successRedirect:'/home', failureRedirect: '/login', failureFlash: true}),
	function(req, res) {
		res.redirect('/home');
});

/*****************************************************************************************************************************************************/

module.exports = router;