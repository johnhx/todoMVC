// Here we include all of the libraries this application will need (i.e. non-app code) 
// and put it them to global scope. 
// This compartementalization allow more flexibility for later progressive modularization (i.e. progressive app module loading). 

// We use just the runtime on the client side
var Handlebars = require("handlebars/runtime")["default"];

// and the mvdom lib
var mvdom = require("mvdom");

if (window){
	window.Handlebars = Handlebars;
	window.mvdom = mvdom;
}