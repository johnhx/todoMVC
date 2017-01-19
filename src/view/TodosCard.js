var d = mvdom; // external lib
var render = require("../js-app/render.js").render;
var ds = require("../js-app/ds.js");
var u = require("../js-app/utils.js");

d.register("TodosCard",{
	create: function(data, config){
		return render("TodosCard");
	}, 

	events: {
		// create new item
		"keyup; input.new-todo": function(evt){
			var inputEl = evt.target;

			// enter
			if (evt.which === 13){
				var val = inputEl.value;
				ds.create("Task",{subject: val}).then(function(){
					inputEl.value = "";
				});
			}
		}, 

		"click; .ctrl-check": function(evt){
			var entityRef = u.entityRef(evt.target, "Task");
			// we toggle the done value (yes, from the UI state, as this is what the user intent)
			var done = !entityRef.el.classList.contains("task-done");
			ds.update("Task",entityRef.id, {done:done});			
		}
	}, 

	hubEvents: {
		"dsHub; Task": function(data,info){				
			refreshList.call(this);
		}
	}
});


// private method
function refreshList(){
	var view = this;
	ds.list("Task").then(function(tasks){
		var html = render("TodosCard-todo-items",{items:tasks});
		d.first(view.el,".items").innerHTML = html;
	});	
}