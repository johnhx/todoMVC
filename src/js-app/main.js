var d = mvdom; // external lib
var route = require("./route.js")

document.addEventListener("DOMContentLoaded", function(event) {
	var bodyEl = d.first("body");

	// first make sure we empty eventual body (this should never happen in this event, but as a best practices)
	d.empty(bodyEl);
	// then add this new MainView
	d.display("MainView", bodyEl);

	// initialize the routing
	route.init();
});
