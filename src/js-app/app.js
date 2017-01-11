// The `app` module contain the main application methods. This file just have the base, which are the AJAX, 
// and other app-...js add methods to this scope.

module.exports = {
	doGet: doGet,
	doPost: doPost,
	doPut: doPut,
	doDelete: doDelete
};

// --------- App AJAX API --------- //
// App AJAX API that all app code should use for ajax request (no matter the backend implementation)
// Note 1) While it is tempting to expose AJAX library APIs to application code, it is often a better option to provide a smaller and more focused API set
//         which will provide better AJAX logic control and customizibility as the application scale.

// use for get and list
function doGet(path, data){
	return ajax('GET', path, data, null);
}

// use for create 
function doPost(path, data, asBody){
	return ajax('POST', path, data, asBody);
}

// use for update
function doPut(path, data, asBody){
	return ajax('PUT', path, data, asBody);
}

// use for delete
function doDelete(path, data){
	return ajax('DELETE', path, data, null);
}
// --------- /App AJAX API --------- //


// --------- Minimalistic Custom AJAX Implementation --------- //
// Note: This is a very simple and minimalistic zero dependency AJAX implementation. 
//       If a little more is needed, then, just adding to this implementation might be a good option. 
//       Otherwise, using an existing ajax library (by including it in the src/js-lib/index.js) is also a valid option

function ajax(type, path, data, asBody){

	// if asBody is not defined
	if (asBody == null && (type === 'POST' || type === 'PUT' )){
		asBody = true;
	}

	return new Promise(function(resolve, reject){
		var xhr = new XMLHttpRequest();
		
		var url = path; 

		if (data && !asBody){
			url += "?" + param(data);
		}

		xhr.open(type, url);
		xhr.setRequestHeader('Content-Type', 'application/json');

		xhr.onload = function() {
			if (xhr.status === 200) {
				try{
					var response = JSON.parse(xhr.responseText);
					resolve(response);
					return;
				} catch (ex){
					reject("Cannot do ajax request to '" + url + "' because \n\t" + ex);
				}
			}else{
				console.log("xhr.status '" + xhr.status + "' for ajax " + url, xhr);
				reject("xhr.status '" + xhr.status + "' for ajax " + url);
			}
		};

		// pass body
		if(asBody){
			xhr.send(JSON.stringify(data));
		}else{
			xhr.send();
		}
		
	});		
}

function param(object) {
	var encodedString = '';
	for (var prop in object) {
		if (object.hasOwnProperty(prop)) {
			if (encodedString.length > 0) {
				encodedString += '&';
			}
			encodedString += prop + '=' + encodeURIComponent(object[prop]);
		}
	}
	return encodedString;
}
// --------- /Minimalistic Custom AJAX Implementation --------- //
