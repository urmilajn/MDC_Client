var app = angular.module('ngDynamicForms',[]);
app.controller('FormBuilderCtrl',function FormBuilderCtrl($scope,  $http)
{
	$scope.newField = {};
	$scope.newFormName = {};
	$scope.fields = [
	];
	$scope.createForm = function(){
		console.log($scope.newFormName)
		//$scope.newFormName = formName;

	}
	$scope.customerName={}
	$scope.customerName1={}
	$scope.editing = false;
	$scope.tokenize = function(slug1, slug2) {
		var result = slug1;
		result = result.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
		result = result.replace(/-/gi, "_");
		result = result.replace(/\s/gi, "-");
		if (slug2) {
			result += '-' + $scope.token(slug2);
		}
		return result;
	};
	$scope.saveField = function() {
		console.log("entered save");
		console.log($scope.newField)
		if ($scope.newField.type == 'checkboxes') {
			$scope.newField.value = {};
		}
		if ($scope.editing !== false) {
			$scope.fields[$scope.editing] = $scope.newField;
			$scope.editing = false;
		} 
		else {
			if($scope.newField.name==undefined || $scope.newField.name==""){
				//alert("New Field Name cannot be empty")
			}
			else {
				if($scope.newField.type==undefined || $scope.newField.type==""){
				$scope.newField.type='text'
				}
				$scope.fields.push($scope.newField);
				}
			}
		

		$scope.newField = {
			//order : 0
		};
	};
	$scope.editField = function(field) {
		$scope.editing = $scope.fields.indexOf(field);
		$scope.newField = field;
	};


	$scope.splice = function(field, fields) {
		fields.splice(fields.indexOf(field), 1);
	};
	$scope.addOption = function() {
		if ($scope.newField.options === undefined) {
			$scope.newField.options = [];
		}
		$scope.newField.options.push({
		//	order : 0
		});
	};
	$scope.prettyPrint = function(feilds){
		console.log("Inside Pretty Print JSON");

	};
	$scope.typeSwitch = function(type) {
		/*if (angular.Array.indexOf(['checkboxes','select','radio'], type) === -1)
			return type;*/
		if (type == 'checkboxes')
			return 'multiple';
		if (type == 'select')
			return 'multiple';
		if (type == 'radio')
			return 'multiple';

		return type;
	}

	$scope.submitFieldsOfForm = function(){

		var allFields = {
			
			formName : $scope.newFormName.name,
			fields : $scope.fields,
			client : document.getElementById("customerName").getAttribute('name')
		};
		console.log(allFields)
		var result = $http.post('/getFieldsOfNewForm', allFields,{ headers: {'Content-Type': 'application/json'} })

	}
});

app.directive('ngDynamicForm', function () { 
    return { 
        // We limit this directive to attributes only.
         restrict : 'A',

        // We will not replace the original element code
        replace : false,
        
        // We must supply at least one element in the code 
        templateUrl : '/js/dynamicForms.html'
    } 
});
