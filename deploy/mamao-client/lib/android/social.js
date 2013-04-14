 
 var SocialShare = function() {};

SocialShare.prototype.sms = function(param, successCallback, failCallback) {

    function success(args) {
        successCallback(args);
    }

    function fail(args) {
    	failCallback(args);
    }

	return PhoneGap.exec(function(args) {
		success(args);
	}, function(args) {
		fail(args);
	}, 'SocialShare', 'startSmsActivity', [param]);
};
 
 
 SocialShare.prototype.email = function(param, successCallback, failCallback) {

    function success(args) {
        successCallback(args);
    }

    function fail(args) {
    	failCallback(args);
    }

	return PhoneGap.exec(function(args) {
		success(args);
	}, function(args) {
		fail(args);
	}, 'SocialShare', 'startEmailActivity', [param]);
};
 
 
  SocialShare.prototype.social = function(param, successCallback, failCallback) {

    function success(args) {
        successCallback(args);
    }

    function fail(args) {
    	failCallback(args);
    }

	return PhoneGap.exec(function(args) {
		success(args);
	}, function(args) {
		fail(args);
	}, 'SocialShare', 'startSocialActivity', [param]);
};


 cordova.addConstructor(function()  {
     console.log("****************************");
     console.log("SocialShare Constructor");
     if(!window.plugins)
     {
         window.plugins = {};
     }

     // shim to work in 1.5 and 1.6
     if (!window.Cordova) {
         window.Cordova = cordova;
     };

     window.plugins.SocialShare = new SocialShare();
 });
 
 
 