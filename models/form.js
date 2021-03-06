const config = require('../config/database');
const mongo = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect(config.database);    //getting url from config/database.js instead of connecting directly
const db = mongoose.connection;

/** FORM MODEL/SCHEMA *********************************************************************************************************************************/

var FormSchema = mongoose.Schema({
	formName: {
		type: String,
		required: true,
		index: true
	},
	fields: {
		type: [] 
	},
	customer: {
		type:String ,
		required:true
	},
	customerId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true
	}
});

var Form = module.exports = mongoose.model('Form',FormSchema);

/** FORMS COLLECTION - HELPER DATABASE FUNCTIONS *****************************************************************************************************/

module.exports.getFormNamesByCustomerID = function(customerId, results) {
	Form.find({customerId: customerId}, {formName: 1}, results);	//select _id, formName from forms where customerId = ?	//id is by default
}

module.exports.getFormFieldsByFormID = function(formId, result) {
	Form.findById(formId, result);	//select * from forms where formId = ?
}

/** OTHER COLLECTION - HELPER DATABASE FUNCTIONS *****************************************************************************************************/

/* Cannot use the above "Form" schema because, this is data of the form (not form itself). We only know the collection name in the format
   formName_formId. The schema of the collection and its data is not known yet and have to be retrieved dynamically */

module.exports.getFormDataByCollectionName = function(collectionName, results) {
	db.collection(collectionName).find({}).toArray(results);	//select * from given collection, convert to array and return
}

module.exports.addFormData = function(collectionName, formData, result) {
	db.collection(collectionName).insertOne(formData, result);
}

/*module.exports.getFormData = function(collectionName, dataId, data) {
	db.collection(collectionName).find({_id: mongoose.Types.ObjectId(dataId)}).toArray(data);
}

module.exports.updateFormData = function(collectionName, dataId, formData, result) {
	db.collection(collectionName).update({_id: dataId}, formData, {upsert: true}, result);
}*/

/*****************************************************************************************************************************************************/