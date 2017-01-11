var d = mvdom; // external lib
var render = require("../js-app/render.js").render;
var utils = require("../js-app/utils.js");

d.register("MainView",{
	create: function(data, config){
		return render("MainView");
	}, 

	postDisplay: function(){
		var view = this; // best practice, set the view variable first. 

		view.todosCtnEl = d.first(view.el, ".todos-ctn");
		
		d.empty(view.todosCtnEl);
		d.display("TodosCard", view.todosCtnEl);
	}
});