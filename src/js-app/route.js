var d = mvdom;

/*
	A custom the 

	Status Events: 
		- routeHub.CHANGE 
		- e.g. ```mvdom.hub("routeHub").sub("CHANGE", function(){route.pathAt(0)})```
*/
// --------- Public API --------- //
var routeInfo = {};

var routeHub = d.hub("routeHub");

module.exports = {
	
	// return the value in path index if present, otherwise, null
	pathAt: function(idx){
		return (routeInfo.paths.length > idx)?routeInfo.paths[idx]:null;
	},

	// return the number at this path index, if not numeric or null or out of bound return null;
	pathAsNum: function(idx){
		var num = app.route.pathAt(idx);
		return (num !== null && $.isNumeric(num))?(num * 1):null;
	},

	paths: function(){
		return routeInfo.paths; // TODO: need to clone it
	}, 

	get: function(){
		return $.extend({},routeInfo);
	},

	init: function(){
		routeInfo = parseHash();
		triggerRouteChange();
	}

};
// --------- /Public API --------- //	

document.addEventListener("DOMContentLoaded", function(event) {
	d.on(window,"hashchange",function(){
		routeInfo = parseHash();	
		triggerRouteChange();
	});
});

// --------- utilities --------- //
function triggerRouteChange(){
	routeHub.pub("CHANGE");
}

function parseHash(){
	var hash = window.location.hash;
	var hashRoute = {}; // partial route
	if (hash){
		hash = hash.substring(1);
		// TODO: need to add support for params
		var pathAndParam = hash.split("!"); // should get the first "!" as we should allow for param values to have "!"
		hashRoute.paths = pathAndParam[0].split("/");
	}else{
		hashRoute.paths = [];
	}

	return hashRoute;
}
// --------- /utilities --------- //