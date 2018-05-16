const express = require('express');
const router = express.Router();

const Form = require('../models/form');
const User = require('../models/user');

/** SHOW DATA FOR SELECTED FORM ***********************************************************************************************************************/

router.post('/', User.ensureAuthenticated, function(req, res){
	
	var formId = req.body.formId;
	var formName = req.body.formName;
	var collectionName = formName + "_" + formId;

	res.cookie('formId', formId);		//set or reset form id and name cookies based on the form selected by the user
	res.cookie('formName', formName);

	//get session variables
	var role = req.session.passport.user.role;

	Form.getFormDataByCollectionName(collectionName, function(err, results){
		if(err) throw err;
		else {

			//Extract form-headers required to display the table headers i.e. for the <thead> html tag
			var formHeaders = [];
			for(key in results[0]) {	//take first column from the DB result and extract the "key" which is the respective column name
				if(key!="_id") {		//hide _id i.e. dataId
					var temp = {};
					temp["name"] = key;
					formHeaders.push(temp);
				}
			}

			/* Extract data rows and its columns. In ususal case we don't need to extract, and can directly send DB "results" to handlebars.
			   But in this case, we have knowledge only about the collection name, and the column names are dynamic, so when we pass the
			   DB "results" to handlebars we cannot perform results.columnName directly */
			var formData = [];
			for(var i=0; i<results.length; i++) {
				var row = [];
				for(key in results[i]) {
					var col = {};
					if(key=="_id")		//hide _id (i.e. dataId) under "edit_symbol"
						col["_id"] = results[i][key];
					else
						col["value"] = results[i][key];
					row.push(col);
				}
				formData.push(row);
			}
			
			if(role=='manager' || role=='regionalManager')	//has data view, add, edit option
				res.render('formDataEditable.handlebars', {formName: formName, formHeaders: formHeaders, formData: formData});
			else	//has data view, add options only - no edit
				res.render('formData.handlebars', {formName: formName, formHeaders: formHeaders, formData: formData});
		}
	});
});

/** ADD DATA ****************************************************************************************************************************************/

//Add Data - Get
router.get('/addData', User.ensureAuthenticated, function(req, res) {
	//console.log(req.session.formFields);
	//res.render('formDetails.handlebars', {myVar: "myVar from express"});
	var formId = req.cookies.formId;

	Form.getFormFieldsByFormID(formId, function(err, form){
		if(err) throw err;
		else
			res.render('formDetails.handlebars', {formName: form.formName, formFields: JSON.stringify(form.fields)});
	});
});


//Add Data -Post

router.post('/addData', User.ensureAuthenticated, function(req, res) {
	
	var formId = req.cookies.formId;
	var formName = req.cookies.formName;
	var collectionName = formName + "_" + formId;


	Form.addFormData(collectionName, function(err, form){
		if(err) throw err;
		else {
			console.log("Added FormData to the formTable");
			res.render('formDetails.handlebars', {formName: form.formName, formFields: JSON.stringify(form.fields)});
		}
	});
});


router.post('/cancelData', User.ensureAuthenticated, function(req, res) {
	res.redirect('/home');
});


/****************************************************************************************************************************************************/

module.exports = router;