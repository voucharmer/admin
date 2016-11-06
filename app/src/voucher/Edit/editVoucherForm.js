'use strict';

angular.module('myApp.editVoucher', ['ngRoute'])

.config(['$routeProvider', 'cloudinaryProvider',function($routeProvider, cloudinaryProvider) {
  $routeProvider.when('/edit_voucher', {
    templateUrl: 'app/src/voucher/Edit/editVoucherForm.html',
    controller: 'editVoucherFormCtrl'
  });

    cloudinaryProvider
      .set("cloud_name", "df5kf6ocq")
      .set("upload_preset", "pocovtmu");

}])

.controller('editVoucherFormCtrl', ['$scope' ,'$window' , '$sessionStorage' , '$localStorage', '$timeout','authService', 'Upload','editVoucherService', 'addVoucherService', 'cloudinary', function($scope, $window, $sessionStorage, $localStorage, $timeout, authService, Upload,editVoucherService, addVoucherService, cloudinary) {
	
     if (!!!authService.isUserLoggedIn()) {
	     $window.location.href = "#!/login";
    };


	$scope.$storage = $localStorage;
	$scope.success = "";
	$scope.error = "";
	$scope.brands = "";
	$scope.files = "";
	$scope.loading = true;
	$scope.editVoucherModel = {};
	// to clean up and organize data to send
	// var reqModel = {
 //    "id": "", 
 //    "voucher": {
 //        "brand": "",
 //        "product": {
 //            "location": {
 //                "coordinates": {
 //                    "latitude": "",
 //                    "longitude": ""
 //                    },
 //                "address": ""
 //            },
 //            "description": "",
 //            "name": ""
 //        },
 //        "valid": "",
 //        "expiry": "",
 //        "featured": "",
 //        "max_redeems": "",
 //        "city": "",
 //        "category": "",
 //        "discount": {
 //            "value": "",
 //            "symbol": ""
 //            }
 //        },
 //    "image": {
 //        "id": "",
 //        "url": ""
 //    }
 //  };

  var reqModel2 = {
  "id": "",
  "product": {
      "location": {
          "coordinates": {
              "latitude": "",
                "longitude": ""
                },
      "address": ""
    },
        "description": "",
        "name": ""
  },
    "valid": "",
    "expiry": "",
    "featured": "",
    "max_redeems": "",
    "city": "",
    "category": "",
    "discount": {
      "value": "",
        "symbol": "%"
    },
    "image": {
        "id": "",
        "url": ""
    }
 }



	// GET EDIT VOUCHER DETAILS
	var voucherId = $sessionStorage.editVoucherId || undefined;
	var retrievedVouchers = $scope.$storage.vouchers || undefined;
	$scope.editVoucherModel.id = voucherId; 
	$scope.editVoucherModel.image  = {};
	$scope.editVoucherModel.image.id = "";
	$scope.editVoucherModel.image.url = "";
	

  if (voucherId === undefined) {
    $scope.editVoucherModel = {};
    $scope.files = "";
   // clear the edit model
  };

	if (retrievedVouchers) {
		$scope.editVoucherModel.voucher = editVoucherService.extractVoucherById(voucherId, retrievedVouchers);
		$scope.files = $scope.editVoucherModel.voucher.product.image;
	}
	
	var newModel = {
		id: voucherId
	}
	// SUBMIT EDIT VOUCHER DETAILS
	$scope.submit = function (model) {
	 if (model) {
    reqModel2.id = model.id || undefined;
    reqModel2.product.location.coordinates.latitude = model.voucher.product.location.coordinates.latitude || "";
    reqModel2.product.location.coordinates.longitude = model.voucher.product.location.coordinates.longitude || "";
    reqModel2.product.location.address = model.voucher.product.location.address || "";
    reqModel2.product.description = model.voucher.product.description || "";
    reqModel2.product.name = model.voucher.product.name || "";
    // reqModel2.product.image = model.voucher.product.image || "";
    reqModel2.valid = model.voucher.valid || "";
    reqModel2.expiry = model.voucher.expiry || "";
    reqModel2.featured = model.voucher.featured || false;
    reqModel2.max_redeems = model.voucher.max_redeems || "100";
    reqModel2.city = model.voucher.city || "";
    reqModel2.category =  model.voucher.category || "";
    reqModel2.discount.value = model.voucher.discount.value || "";
    reqModel2.discount.symbol = model.voucher.discount.symbol || "";
    reqModel2.image.id = model.image.id || "";
    reqModel2.image.url = model.image.url || "";

    
    // console.log('reqModel2', reqModel2);

		var jsonModel = angular.toJson(reqModel2); // to clean up 
    // todo: clear cache
		editVoucherService.edit(jsonModel)
		.success(function(res, headers, status, config){
		   // console.log('success res', res);
            if (res.status === true) {
              		$sessionStorage.editVoucherId = "";
                  $scope.success = "Voucher has been successfully edited!";
                  $window.alert($scope.success);
                  $window.location.href="#!/dashboard";
              };

    })
    .error(function(res, headers, status, config){
      // console.log('err res', res);
      if (res.status === 401) {
        $scope.error = "Error: There was a problem saving the voucher.";
      }
  
    })
	 }
  }

	   //GET BRANDS
	 addVoucherService.getBrands()
	  .success(function(res, headers, status, config) {
	  	$scope.loading = false;
	     if (res.status === true){
	         if (res.data.brands.length > 0) {
	            $scope.brands = res.data.brands;
	         } 
	     } else {
	        $scope.error = "Sorry cannot reach the server at the moment";
	      } 
	  })
	  .error(function(res, headers, status, config){
	  	$scope.loading = false;
	    // console.log('brands err res is', res);
	 });

     // UPLOAD IMAGE
      var IMAGE_ADD_API_URL = "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload";
      var d = new Date();
      $scope.title = "Image (" + d.getDate() + " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ")";
      
      $scope.uploadFile = function (files) {
       
      $scope.files = files;
      if (!$scope.files) return;

      angular.forEach($scope.files, function(file){
         if (file && !file.$error) {  
            
             var CLOUDINARY_DATA = {
              upload_preset: cloudinary.config().upload_preset,
              tags: 'myphotoalbum',
              context: 'photo=' + $scope.title,
              file: file
            };

            var HEADER = {
                    'Content-Type': undefined,
                    'token': undefined,
                    'source_id': undefined
            }

              file.upload = Upload.upload({
                  url:  IMAGE_ADD_API_URL,
                  data: CLOUDINARY_DATA,
                  headers: HEADER
              });         

             file.upload.then(function (response) {
                $timeout(function () {  
                  file.result = response.data;
                 
                  $scope.editVoucherModel.image  = {};
                  $scope.editVoucherModel.image.id = response.data.public_id;
                  $scope.editVoucherModel.image.url = response.data.secure_url;
                });
              }, function (response) {
                  $scope.error = response.status + ': Sorry, cannot upload image at the moment. Please try later';
              }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                file.status = "Uploading... " + file.progress + "%";
              }); 
           }
        })
      }



}])
.service('editVoucherService', ['$http' , '$window', '$filter', 'authService', function ($http, $window, $filter, authService) {
	 var SESSION_TOKEN, SOURCE_ID, EDIT_VOUCHER_URL, EDIT_VOUCHER_URL_URLheaders, HTTP_CONFIG;
  	
   SESSION_TOKEN = authService.getToken() || undefined;
 	 SOURCE_ID = authService.getSourceId()  || undefined;
 	 EDIT_VOUCHER_URL =  'https://book-of-vouchers.herokuapp.com/api/v1/admin/edit_voucher';
 	 EDIT_VOUCHER_URL_URLheaders = {

        /**@const */    
        headers: 
        { 
            'Content-Type': "application/json",
            'token': SESSION_TOKEN,
            'source_id': SOURCE_ID
        }
        
     };

	this.edit = function (model) {

	HTTP_CONFIG = {
     	 headers: { 
            'Content-Type': "application/json"
        }
     }	
    	return $http.put(EDIT_VOUCHER_URL, model, HTTP_CONFIG);
	}

	this.extractVoucherById = function(voucherId, vouchers) {

			var vId = voucherId;
			var list = vouchers;
			var filteredResult = $filter('filter')(list, {id: vId});
			// console.log('filteredResult', filteredResult);
			if (filteredResult['0']){
				return filteredResult['0'];
			}
	}

}]);