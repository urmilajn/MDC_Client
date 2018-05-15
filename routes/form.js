const express = require('express');
const router = express.Router();

const Form = require('../models/form');
const User = require('../models/user');

/** TEST **********************************************************************************************************************************************/

router.get('/test', User.ensureAuthenticated, function(req, res){
	res.render('formDetails.handlebars', {myVar: "myVar from express"});	
});

/** SHOW DATA FOR SELECTED FORM ***********************************************************************************************************************/

router.post('/', User.ensureAuthenticated, function(req, res){
	
	var formId = req.body.formId;
	var formName = req.body.formName;
	var collectionName = formName + "_" + formId;

	res.cookie('formId', formId);		//set or reset form id and name cookies based on the form selected by the user
	res.cookie('formName', formName);

	//get session variables
	var role = req.session.passport.user.role;

	Form.getFormDataByCollectionName("users" , function(err, results){
		if(err) throw err;
		else {
			//extract form-headers required to display the table headers i.e. for the <thead> html tag
			var formHeaders = [];
			for(key in results[0]) {	//take first column from the DB result and extract the "key" which is the respective column name
				if(key!="_id" && key!="__v") {		//hide _id column
					var temp = {};
					temp["name"] = key;
					formHeaders.push(temp);
				}
			}

			//extract rows and its columns
			var formData = [];
			for(var i=0; i<results.length; i++) {
				var row = [];
				for(key in results[i]) {
					var col = {};
					if(key=="_id")
						col["_id"] = results[i][key];
					else
						col["value"] = results[i][key];
					console.log(col);
					row.push(col);
				}
				formData.push(row);
			}
			
			res.render('formDataEditable.handlebars', {formName: formName, formHeaders: formHeaders, formData: formData});
		}
	});

	/*var tableName = 'pool_reading' + "_" + formId;
	Form.createFormTable(tableName, function(err,result){
		if(err) throw err;
		else
			console.log("table created in db");
	});*/
});

/** ADD DATA ****************************************************************************************************************************************/

//Add Data - Get
router.get('/addData', User.ensureAuthenticated, function(req, res){
	//console.log(req.session.formFields);
	//res.render('formDetails.handlebars', {myVar: "myVar from express"});
});

/****************************************************************************************************************************************************/

module.exports = router;